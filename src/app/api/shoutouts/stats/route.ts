import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as shoutOutService from '@/services/shoutOutService';

// GET /api/shoutouts/stats/trending - Get trending tags
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const trendingTags = await shoutOutService.getTrendingTags(limit);
    
    // Get user stats
    const userStats = await shoutOutService.getDailyShoutOutStats(session.user.id);

    return NextResponse.json({
      trendingTags,
      userStats,
    });
  } catch (error) {
    console.error('Error fetching shout out stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}