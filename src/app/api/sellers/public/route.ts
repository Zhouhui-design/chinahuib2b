import { NextRequest, NextResponse } from 'next/server';
import * as sellerService from '@/services/sellerService';

// GET /api/sellers/public - Get all approved sellers (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await sellerService.getApprovedSellers(page, limit);

    return NextResponse.json({
      sellers: result.sellers,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
