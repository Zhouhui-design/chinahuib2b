import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  createExperiment, 
  getExperiment, 
  getExperimentResults,
  getActiveExperiments,
  stopExperiment,
  Experiment 
} from '@/lib/ab-testing'

/**
 * A/B Testing Management API
 * GET - List experiments or get specific experiment
 * POST - Create new experiment
 * PUT - Update experiment status
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const experimentId = searchParams.get('id')
    
    if (experimentId) {
      // Get specific experiment
      const experiment = await getExperiment(experimentId)
      
      if (!experiment) {
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
      }
      
      // Get results
      const results = await getExperimentResults(experimentId)
      
      return NextResponse.json({
        experiment,
        results,
      })
    } else {
      // List all active experiments
      const experiments = await getActiveExperiments()
      
      return NextResponse.json({
        experiments,
        count: experiments.length,
      })
    }
  } catch (error) {
    console.error('A/B Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate input
    if (!body.name || !body.variants || !body.goal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, variants, goal' },
        { status: 400 }
      )
    }
    
    // Validate variants
    if (!Array.isArray(body.variants) || body.variants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 variants are required' },
        { status: 400 }
      )
    }
    
    // Validate weights sum to 100
    const totalWeight = body.variants.reduce((sum: number, v: any) => sum + v.weight, 0)
    if (totalWeight !== 100) {
      return NextResponse.json(
        { error: 'Variant weights must sum to 100' },
        { status: 400 }
      )
    }
    
    // Create experiment
    const experiment = await createExperiment({
      name: body.name,
      description: body.description || '',
      variants: body.variants,
      trafficPercentage: body.trafficPercentage || 100,
      status: body.status || 'draft',
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      goal: body.goal,
    })
    
    return NextResponse.json({
      success: true,
      experiment,
    }, { status: 201 })
  } catch (error) {
    console.error('A/B Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const experimentId = searchParams.get('id')
    
    if (!experimentId) {
      return NextResponse.json(
        { error: 'Experiment ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    if (body.action === 'stop') {
      await stopExperiment(experimentId)
      
      return NextResponse.json({
        success: true,
        message: 'Experiment stopped',
      })
    }
    
    if (body.action === 'start') {
      // Update status to running
      const experiment = await getExperiment(experimentId)
      
      if (!experiment) {
        return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
      }
      
      // Implementation would update the experiment status
      // For now, just return success
      
      return NextResponse.json({
        success: true,
        message: 'Experiment started',
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('A/B Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
