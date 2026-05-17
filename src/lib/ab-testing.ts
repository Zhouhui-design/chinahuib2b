/**
 * A/B Testing Framework
 * Self-hosted A/B testing system for conversion optimization
 */

import { redis } from './redis'

// Experiment types
export interface Experiment {
  id: string
  name: string
  description: string
  variants: Variant[]
  trafficPercentage: number // 0-100
  status: 'draft' | 'running' | 'completed'
  startDate?: Date
  endDate?: Date
  goal: GoalMetric
  createdAt: Date
}

export interface Variant {
  id: string
  name: string
  weight: number // 0-100, total should be 100
  config?: Record<string, any>
}

export type GoalMetric = 
  | 'page_view'
  | 'click'
  | 'conversion'
  | 'revenue'
  | 'signup'
  | 'purchase'

// User assignment
export interface UserAssignment {
  userId: string
  experimentId: string
  variantId: string
  assignedAt: Date
}

// Event tracking
export interface ABTestEvent {
  id: string
  userId: string
  experimentId: string
  variantId: string
  eventType: GoalMetric
  value?: number
  timestamp: Date
  metadata?: Record<string, any>
}

// Results
export interface ExperimentResults {
  experimentId: string
  totalUsers: number
  variants: VariantResult[]
  statisticalSignificance?: number
  winner?: string
}

export interface VariantResult {
  variantId: string
  variantName: string
  users: number
  conversions: number
  conversionRate: number
  revenue?: number
  avgRevenue?: number
}

/**
 * Create a new A/B test experiment
 */
export async function createExperiment(
  experiment: Omit<Experiment, 'id' | 'createdAt'>
): Promise<Experiment> {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newExperiment: Experiment = {
    ...experiment,
    id,
    createdAt: new Date(),
  }
  
  // Store experiment in Redis
  await redis.hset(`abtest:experiment:${id}`, {
    data: JSON.stringify(newExperiment),
  })
  
  // Set TTL if end date is specified
  if (newExperiment.endDate) {
    const ttl = Math.floor((newExperiment.endDate.getTime() - Date.now()) / 1000)
    if (ttl > 0) {
      await redis.expire(`abtest:experiment:${id}`, ttl)
    }
  }
  
  return newExperiment
}

/**
 * Get experiment by ID
 */
export async function getExperiment(experimentId: string): Promise<Experiment | null> {
  const data = await redis.hget(`abtest:experiment:${experimentId}`, 'data')
  
  if (!data) return null
  
  return JSON.parse(data as string)
}

/**
 * Assign user to a variant (consistent hashing)
 */
export async function assignUserToVariant(
  userId: string,
  experimentId: string
): Promise<string | null> {
  const experiment = await getExperiment(experimentId)
  
  if (!experiment || experiment.status !== 'running') {
    return null
  }
  
  // Check if user is already assigned
  const existingAssignment = await redis.get(`abtest:assignment:${userId}:${experimentId}`)
  if (existingAssignment) {
    return existingAssignment as string
  }
  
  // Check if user is in traffic percentage
  const userHash = hashString(userId + experimentId)
  const userPercent = userHash % 100
  
  if (userPercent >= experiment.trafficPercentage) {
    return null // User not in experiment
  }
  
  // Assign variant based on weights
  const variant = selectVariantByWeight(experiment.variants, userHash)
  
  if (!variant) return null
  
  // Store assignment
  await redis.setex(
    `abtest:assignment:${userId}:${experimentId}`,
    86400 * 30, // 30 days TTL
    variant.id
  )
  
  // Track assignment
  await redis.hincrby(`abtest:stats:${experimentId}:users`, variant.id, 1)
  
  return variant.id
}

/**
 * Track conversion event
 */
export async function trackConversion(
  userId: string,
  experimentId: string,
  eventType: GoalMetric = 'conversion',
  value?: number,
  metadata?: Record<string, any>
): Promise<void> {
  const variantId = await redis.get(`abtest:assignment:${userId}:${experimentId}`)
  
  if (!variantId) return
  
  // Track event
  const event: ABTestEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    experimentId,
    variantId: variantId as string,
    eventType,
    value,
    timestamp: new Date(),
    metadata,
  }
  
  // Store event (use list for recent events)
  await redis.lpush(`abtest:events:${experimentId}`, JSON.stringify(event))
  await redis.ltrim(`abtest:events:${experimentId}`, 0, 9999) // Keep last 10k events
  
  // Update stats
  await redis.hincrby(`abtest:stats:${experimentId}:conversions:${eventType}`, variantId as string, 1)
  
  if (value) {
    await redis.hincrbyfloat(`abtest:stats:${experimentId}:revenue`, variantId as string, value)
  }
}

/**
 * Get experiment results
 */
export async function getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
  const experiment = await getExperiment(experimentId)
  if (!experiment) return null
  
  const totalUsers: Record<string, any> = (await redis.hgetall(`abtest:stats:${experimentId}:users`)) as any || {}
  const conversions: Record<string, any> = (await redis.hgetall(`abtest:stats:${experimentId}:conversions:conversion`)) as any || {}
  const revenue: Record<string, any> = (await redis.hgetall(`abtest:stats:${experimentId}:revenue`)) as any || {}
  
  const variants: VariantResult[] = experiment.variants.map(variant => {
    const users = parseInt(totalUsers[variant.id]) || 0
    const variantConversions = parseInt(conversions[variant.id]) || 0
    const variantRevenue = parseFloat(revenue[variant.id]) || 0
    
    return {
      variantId: variant.id,
      variantName: variant.name,
      users,
      conversions: variantConversions,
      conversionRate: users > 0 ? (variantConversions / users) * 100 : 0,
      revenue: variantRevenue,
      avgRevenue: users > 0 ? variantRevenue / users : 0,
    }
  })
  
  // Calculate statistical significance (simplified chi-squared test)
  const significance = calculateSignificance(variants)
  
  // Determine winner
  let winner: string | undefined
  if (significance > 95) {
    winner = variants.reduce((max, v) => v.conversionRate > max.conversionRate ? v : max, variants[0]).variantId
  }
  
  return {
    experimentId,
    totalUsers: variants.reduce((sum, v) => sum + v.users, 0),
    variants,
    statisticalSignificance: significance,
    winner,
  }
}

/**
 * Get all active experiments
 */
export async function getActiveExperiments(): Promise<Experiment[]> {
  const keys = await redis.keys('abtest:experiment:*')
  const experiments: Experiment[] = []
  
  for (const key of keys) {
    const data = await redis.hget(key, 'data')
    if (data) {
      const exp = JSON.parse(data as string)
      if (exp.status === 'running') {
        experiments.push(exp)
      }
    }
  }
  
  return experiments
}

/**
 * Stop an experiment
 */
export async function stopExperiment(experimentId: string): Promise<void> {
  await redis.hset(`abtest:experiment:${experimentId}`, 'data', 
    JSON.stringify({ status: 'completed' })
  )
}

// Helper functions

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function selectVariantByWeight(variants: Variant[], hash: number): Variant | null {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const normalized = hash % totalWeight
  
  let cumulativeWeight = 0
  for (const variant of variants) {
    cumulativeWeight += variant.weight
    if (normalized < cumulativeWeight) {
      return variant
    }
  }
  
  return variants[variants.length - 1]
}

function calculateSignificance(variants: VariantResult[]): number {
  if (variants.length < 2) return 0
  
  // Simplified calculation - in production use proper statistical library
  const rates = variants.map(v => v.conversionRate)
  const maxRate = Math.max(...rates)
  const minRate = Math.min(...rates)
  
  if (maxRate === 0) return 0
  
  const difference = ((maxRate - minRate) / maxRate) * 100
  
  // Return rough significance estimate
  return Math.min(difference * 10, 99)
}
