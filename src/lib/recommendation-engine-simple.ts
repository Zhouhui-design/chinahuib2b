/**
 * AI Recommendation Engine - Simplified Version
 * Uses mock data for now, will integrate with database later
 */

export interface RecommendationResult {
  itemId: string;
  score: number;
  reason: string;
  type: 'product' | 'seller' | 'category';
}

export interface UserBehavior {
  userId: string;
  productId?: string;
  sellerId?: string;
  categoryId?: string;
  action: 'view' | 'inquiry' | 'favorite' | 'purchase';
  timestamp: Date;
  duration?: number;
}

class RecommendationEngine {
  private behaviorCache: Map<string, UserBehavior[]> = new Map();

  /**
   * Get personalized product recommendations for a user
   */
  async getProductRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      // Get user's behavior history
      const behaviors = this.behaviorCache.get(userId) || [];

      if (behaviors.length === 0) {
        // Cold start: return trending products
        return await this.getTrendingProducts(limit);
      }

      // Calculate preferences and generate recommendations
      const recommendations = await this.generateRecommendations(userId, behaviors, limit);
      return recommendations;
    } catch (error) {
      console.error('[Recommendation] Failed to get product recommendations:', error);
      return await this.getTrendingProducts(limit);
    }
  }

  /**
   * Get seller recommendations
   */
  async getSellerRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<RecommendationResult[]> {
    return await this.getTopSellers(limit);
  }

  /**
   * Record user behavior for recommendation engine
   */
  async recordBehavior(behavior: UserBehavior): Promise<void> {
    try {
      // Store in cache
      const userBehaviors = this.behaviorCache.get(behavior.userId) || [];
      userBehaviors.push(behavior);
      this.behaviorCache.set(behavior.userId, userBehaviors);

      console.log('[Recommendation] Behavior recorded:', behavior);
    } catch (error) {
      console.error('[Recommendation] Failed to record behavior:', error);
    }
  }

  /**
   * Get category recommendations
   */
  async getCategoryRecommendations(
    userId: string,
    limit: number = 8
  ): Promise<RecommendationResult[]> {
    return await this.getPopularCategories(limit);
  }

  /**
   * Private: Generate recommendations based on user behavior
   */
  private async generateRecommendations(
    userId: string,
    behaviors: UserBehavior[],
    limit: number
  ): Promise<RecommendationResult[]> {
    // Simple collaborative filtering based on viewed products
    const viewedProducts = behaviors
      .filter(b => b.productId && b.action === 'view')
      .map(b => b.productId!);

    // Return related products (mock implementation)
    return Array.from({ length: limit }, (_, i) => ({
      itemId: `prod_${Date.now()}_${i}`,
      score: Math.random() * 10,
      reason: 'Based on your browsing history',
      type: 'product' as const
    }));
  }

  /**
   * Private: Get trending products (cold start)
   */
  private async getTrendingProducts(limit: number): Promise<RecommendationResult[]> {
    // Mock trending products
    return Array.from({ length: limit }, (_, i) => ({
      itemId: `trending_${i + 1}`,
      score: 10 - i,
      reason: 'Trending now',
      type: 'product' as const
    }));
  }

  /**
   * Private: Get top sellers
   */
  private async getTopSellers(limit: number): Promise<RecommendationResult[]> {
    return Array.from({ length: limit }, (_, i) => ({
      itemId: `seller_${i + 1}`,
      score: 1,
      reason: 'New suppliers',
      type: 'seller' as const
    }));
  }

  /**
   * Private: Get popular categories
   */
  private async getPopularCategories(limit: number): Promise<RecommendationResult[]> {
    return Array.from({ length: limit }, (_, i) => ({
      itemId: `cat_${i + 1}`,
      score: 1,
      reason: 'Popular categories',
      type: 'category' as const
    }));
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();
