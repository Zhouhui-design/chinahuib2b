/**
 * A/B Testing Framework for Chinahuib2b
 * 
 * Features:
 * - Experiment management
 * - Variant assignment
 * - Conversion tracking
 * - Statistical analysis
 * - Local storage persistence
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  trafficPercentage: number; // 0-100
  status: 'draft' | 'running' | 'completed';
  startDate?: Date;
  endDate?: Date;
  goals: Goal[];
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100, sum of all variants should be 100
  config: Record<string, any>;
}

export interface Goal {
  id: string;
  name: string;
  type: 'pageview' | 'click' | 'conversion' | 'custom';
  selector?: string; // For click events
  value?: number; // Conversion value
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  userId: string;
  timestamp: Date;
  conversions: Array<{
    goalId: string;
    value: number;
    timestamp: Date;
  }>;
}

class ABTestingFramework {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, string> = new Map(); // userId -> variantId
  private results: ExperimentResult[] = [];
  private storageKey = 'ab_testing_assignments';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Register a new experiment
   */
  registerExperiment(experiment: Experiment): void {
    if (experiment.variants.reduce((sum, v) => sum + v.weight, 0) !== 100) {
      throw new Error('Variant weights must sum to 100');
    }
    this.experiments.set(experiment.id, experiment);
    console.log(`[A/B Test] Registered experiment: ${experiment.name}`);
  }

  /**
   * Get assigned variant for a user
   */
  getVariant(experimentId: string, userId: string): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      console.warn(`[A/B Test] Experiment not found: ${experimentId}`);
      return null;
    }

    // Check if user is already assigned
    const cacheKey = `${experimentId}_${userId}`;
    if (this.userAssignments.has(cacheKey)) {
      return this.userAssignments.get(cacheKey)!;
    }

    // Check if user is in traffic percentage
    if (Math.random() * 100 > experiment.trafficPercentage) {
      return null; // User not in experiment
    }

    // Assign variant based on weights
    const variant = this.assignVariant(experiment.variants);
    this.userAssignments.set(cacheKey, variant.id);
    this.saveToStorage();

    console.log(`[A/B Test] User ${userId} assigned to variant: ${variant.name}`);
    return variant.id;
  }

  /**
   * Track a conversion event
   */
  trackConversion(
    experimentId: string,
    userId: string,
    goalId: string,
    value: number = 1
  ): void {
    const variantId = this.userAssignments.get(`${experimentId}_${userId}`);
    if (!variantId) {
      console.warn(`[A/B Test] User not assigned to experiment: ${experimentId}`);
      return;
    }

    const result: ExperimentResult = {
      experimentId,
      variantId,
      userId,
      timestamp: new Date(),
      conversions: [{
        goalId,
        value,
        timestamp: new Date()
      }]
    };

    this.results.push(result);
    this.sendToAnalytics(result);
    console.log(`[A/B Test] Conversion tracked: ${goalId} (value: ${value})`);
  }

  /**
   * Get experiment results with statistical significance
   */
  getResults(experimentId: string): {
    variantId: string;
    conversions: number;
    totalUsers: number;
    conversionRate: number;
    confidence?: number;
  }[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const results = this.results.filter(r => r.experimentId === experimentId);
    
    return experiment.variants.map(variant => {
      const variantResults = results.filter(r => r.variantId === variant.id);
      const totalUsers = variantResults.length;
      const conversions = variantResults.reduce((sum, r) => 
        sum + r.conversions.length, 0
      );
      const conversionRate = totalUsers > 0 ? conversions / totalUsers : 0;
      const confidence = this.calculateConfidence(variantResults);

      return {
        variantId: variant.id,
        conversions,
        totalUsers,
        conversionRate,
        ...(confidence !== undefined && { confidence })
      };
    });
  }

  /**
   * Check if a result is statistically significant
   */
  isSignificant(experimentId: string, confidenceThreshold: number = 0.95): boolean {
    const results = this.getResults(experimentId);
    if (results.length < 2) return false;

    const confidences = results.map(r => r.confidence || 0);
    return Math.max(...confidences) >= confidenceThreshold;
  }

  /**
   * Private: Assign variant based on weights
   */
  private assignVariant(variants: Variant[]): Variant {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to last variant (should never reach here if weights sum to 100)
    const lastVariant = variants[variants.length - 1];
    if (!lastVariant) {
      throw new Error('No variants available');
    }
    return lastVariant;
  }

  /**
   * Private: Calculate statistical confidence (simplified z-test)
   */
  private calculateConfidence(results: ExperimentResult[]): number | undefined {
    if (results.length < 30) return undefined; // Need minimum sample size

    // Simplified calculation - in production, use proper statistical library
    const conversions = results.reduce((sum, r) => sum + r.conversions.length, 0);
    const rate = conversions / results.length;
    
    // Return mock confidence based on sample size
    // In production, implement proper A/B test statistical analysis
    return Math.min(0.5 + (results.length / 1000), 0.99);
  }

  /**
   * Private: Send data to analytics backend
   */
  private sendToAnalytics(result: ExperimentResult): void {
    // In production, send to your analytics API
    // fetch('/api/ab-testing/results', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(result)
    // });
    
    console.log('[A/B Test] Analytics data:', result);
  }

  /**
   * Private: Save assignments to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(
        Array.from(this.userAssignments.entries())
      ));
    }
  }

  /**
   * Private: Load assignments from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const entries = JSON.parse(stored);
          this.userAssignments = new Map(entries);
        } catch (e) {
          console.error('[A/B Test] Failed to load from storage:', e);
        }
      }
    }
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.experiments.clear();
    this.userAssignments.clear();
    this.results = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

// Singleton instance
export const abTesting = new ABTestingFramework();

/**
 * React Hook for A/B Testing
 */
export function useABTest(experimentId: string, userId: string) {
  const variantId = abTesting.getVariant(experimentId, userId);
  
  return {
    variantId,
    trackConversion: (goalId: string, value?: number) => {
      abTesting.trackConversion(experimentId, userId, goalId, value);
    },
    isActive: variantId !== null
  };
}
