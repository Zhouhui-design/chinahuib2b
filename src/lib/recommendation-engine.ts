/**
 * AI Recommendation Engine
 * Intelligent product and supplier recommendations using collaborative filtering
 */

import { prisma } from '@/lib/db';

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
  duration?: number; // seconds
}

class RecommendationEngine {
  /**
   * Get personalized product recommendations for a user
   */
  async getProductRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      // Get user's behavior history
      const behaviors = await this.getUserBehaviors(userId);

      if (behaviors.length === 0) {
        // Cold start: return trending products
        return await this.getTrendingProducts(limit);
      }

      // Calculate user preferences
      const preferences = await this.calculateUserPreferences(behaviors);

      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId, preferences);

      // Generate recommendations based on collaborative filtering
      const recommendations = await this.generateCollaborativeRecommendations(
        userId,
        similarUsers,
        preferences,
        limit
      );

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
    try {
      const behaviors = await this.getUserBehaviors(userId);
      
      if (behaviors.length === 0) {
        return await this.getTopSellers(limit);
      }

      const preferences = await this.calculateUserPreferences(behaviors);
      const recommendations = await this.generateSellerRecommendations(
        preferences,
        limit
      );

      return recommendations;
    } catch (error) {
      console.error('[Recommendation] Failed to get seller recommendations:', error);
      return await this.getTopSellers(limit);
    }
  }

  /**
   * Record user behavior for recommendation engine
   */
  async recordBehavior(behavior: UserBehavior): Promise<void> {
    try {
      // Store in database for offline processing
      await prisma.userBehavior.create({
        data: {
          userId: behavior.userId,
          productId: behavior.productId,
          sellerId: behavior.sellerId,
          categoryId: behavior.categoryId,
          action: behavior.action,
          timestamp: behavior.timestamp,
          duration: behavior.duration
        }
      });

      // Update real-time cache (Redis)
      await this.updateRealTimeCache(behavior);
    } catch (error) {
      console.error('[Recommendation] Failed to record behavior:', error);
    }
  }

  /**
   * Get category recommendations based on user interests
   */
  async getCategoryRecommendations(
    userId: string,
    limit: number = 8
  ): Promise<RecommendationResult[]> {
    try {
      const behaviors = await this.getUserBehaviors(userId);
      
      if (behaviors.length === 0) {
        return await this.getPopularCategories(limit);
      }

      const categoryScores = await this.calculateCategoryScores(behaviors);
      
      // Sort by score and return top categories
      const sorted = Object.entries(categoryScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([categoryId, score]) => ({
          itemId: categoryId,
          score,
          reason: 'Based on your browsing history',
          type: 'category' as const
        }));

      return sorted;
    } catch (error) {
      console.error('[Recommendation] Failed to get category recommendations:', error);
      return await this.getPopularCategories(limit);
    }
  }

  /**
   * Private: Get user behavior history
   */
  private async getUserBehaviors(userId: string, days: number = 30): Promise<UserBehavior[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const behaviors = await prisma.userBehavior.findMany({
      where: {
        userId,
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });

    return behaviors.map(b => ({
      userId: b.userId,
      productId: b.productId || undefined,
      sellerId: b.sellerId || undefined,
      categoryId: b.categoryId || undefined,
      action: b.action as UserBehavior['action'],
      timestamp: b.timestamp,
      duration: b.duration || undefined
    }));
  }

  /**
   * Private: Calculate user preferences from behaviors
   */
  private async calculateUserPreferences(behaviors: UserBehavior[]): Promise<Record<string, number>> {
    const preferences: Record<string, number> = {};

    // Weight different actions
    const actionWeights = {
      view: 1,
      favorite: 3,
      inquiry: 5,
      purchase: 10
    };

    behaviors.forEach(behavior => {
      const weight = actionWeights[behavior.action];
      const key = behavior.productId || behavior.sellerId || behavior.categoryId;
      
      if (key) {
        preferences[key] = (preferences[key] || 0) + weight;
      }
    });

    return preferences;
  }

  /**
   * Private: Find similar users using collaborative filtering
   */
  private async findSimilarUsers(
    userId: string,
    preferences: Record<string, number>,
    limit: number = 20
  ): Promise<string[]> {
    // Get users who interacted with same items
    const itemIds = Object.keys(preferences);
    
    const similarUsers = await prisma.userBehavior.findMany({
      where: {
        productId: { in: itemIds.filter(id => id.startsWith('prod_')) },
        userId: { not: userId }
      },
      select: {
        userId: true
      },
      take: 100
    });

    // Count co-occurrences
    const userScores: Record<string, number> = {};
    similarUsers.forEach(({ userId: otherUserId }) => {
      userScores[otherUserId] = (userScores[otherUserId] || 0) + 1;
    });

    // Return top similar users
    return Object.entries(userScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId]) => userId);
  }

  /**
   * Private: Generate collaborative filtering recommendations
   */
  private async generateCollaborativeRecommendations(
    currentUserId: string,
    similarUsers: string[],
    preferences: Record<string, number>,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get products that similar users liked but current user hasn't seen
    const seenProducts = await prisma.userBehavior.findMany({
      where: {
        userId: currentUserId,
        action: { in: ['view', 'inquiry', 'favorite', 'purchase'] }
      },
      select: {
        productId: true
      }
    });

    const seenProductIds = new Set(
      seenProducts.map(b => b.productId).filter(Boolean)
    );

    // Find recommended products from similar users
    const recommendations = await prisma.userBehavior.findMany({
      where: {
        userId: { in: similarUsers },
        productId: { notIn: Array.from(seenProductIds) },
        action: { in: ['favorite', 'inquiry', 'purchase'] }
      },
      select: {
        productId: true,
        action: true
      },
      take: 100
    });

    // Score products
    const productScores: Record<string, number> = {};
    recommendations.forEach(({ productId, action }) => {
      if (productId) {
        const weight = action === 'purchase' ? 10 : action === 'inquiry' ? 5 : 3;
        productScores[productId] = (productScores[productId] || 0) + weight;
      }
    });

    // Return top recommendations
    return Object.entries(productScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId, score]) => ({
        itemId: productId,
        score,
        reason: 'Recommended based on similar users',
        type: 'product' as const
      }));
  }

  /**
   * Private: Get trending products (cold start)
   */
  private async getTrendingProducts(limit: number): Promise<RecommendationResult[]> {
    const products = await prisma.product.findMany({
      orderBy: {
        viewCount: 'desc'
      },
      take: limit,
      select: {
        id: true
      }
    });

    return products.map(product => ({
      itemId: product.id,
      score: 1,
      reason: 'Trending now',
      type: 'product' as const
    }));
  }

  /**
   * Private: Get top sellers
   */
  private async getTopSellers(limit: number): Promise<RecommendationResult[]> {
    const sellers = await prisma.seller.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true
      }
    });

    return sellers.map(seller => ({
      itemId: seller.id,
      score: 1,
      reason: 'New suppliers',
      type: 'seller' as const
    }));
  }

  /**
   * Private: Generate seller recommendations
   */
  private async generateSellerRecommendations(
    preferences: Record<string, number>,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Implementation for seller recommendations
    return await this.getTopSellers(limit);
  }

  /**
   * Private: Calculate category scores
   */
  private async calculateCategoryScores(
    behaviors: UserBehavior[]
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};

    behaviors.forEach(behavior => {
      if (behavior.categoryId) {
        scores[behavior.categoryId] = (scores[behavior.categoryId] || 0) + 1;
      }
    });

    return scores;
  }

  /**
   * Private: Get popular categories
   */
  private async getPopularCategories(limit: number): Promise<RecommendationResult[]> {
    const categories = await prisma.category.findMany({
      take: limit,
      select: {
        id: true
      }
    });

    return categories.map(cat => ({
      itemId: cat.id,
      score: 1,
      reason: 'Popular categories',
      type: 'category' as const
    }));
  }

  /**
   * Private: Update real-time cache
   */
  private async updateRealTimeCache(behavior: UserBehavior): Promise<void> {
    // Implement Redis caching for real-time recommendations
    // This is a placeholder for Redis integration
    console.log('[Recommendation] Cache updated for user:', behavior.userId);
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();
