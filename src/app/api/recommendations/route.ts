/**
 * Recommendation API Routes
 * Provide AI-powered product and seller recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/recommendation-engine-simple';

/**
 * GET /api/recommendations/products
 * Get personalized product recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendations = await recommendationEngine.getProductRecommendations(
      userId,
      limit
    );

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('[API] Failed to get recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/track
 * Track user behavior for recommendation engine
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, sellerId, categoryId, action, duration } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    await recommendationEngine.recordBehavior({
      userId,
      productId,
      sellerId,
      categoryId,
      action,
      timestamp: new Date(),
      duration
    });

    return NextResponse.json({
      success: true,
      message: 'Behavior tracked successfully'
    });
  } catch (error) {
    console.error('[API] Failed to track behavior:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}
