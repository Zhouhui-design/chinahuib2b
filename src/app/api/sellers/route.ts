import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// GET /api/sellers - Get all active sellers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    let sellers;
    if (featured) {
      sellers = await sellerService.getFeaturedSellers(limit);
    } else {
      sellers = await sellerService.getActiveSellers();
    }

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sellers - Create seller profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if seller profile already exists
    const existingProfile = await sellerService.getSellerProfile(session.user.id);
    if (existingProfile) {
      return NextResponse.json({ error: 'Seller profile already exists' }, { status: 400 });
    }

    const body = await request.json();
    const sellerProfile = await sellerService.createSellerProfile(session.user.id, {
      companyName: body.companyName,
      companyType: body.companyType,
      country: body.country,
      province: body.province,
      city: body.city,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      whatsapp: body.whatsapp,
      wechat: body.wechat,
      telegram: body.telegram,
      linkedin: body.linkedin,
      facebook: body.facebook,
      instagram: body.instagram,
      description: body.description,
      descriptions: body.descriptions,
      logoUrl: body.logoUrl,
      bannerUrl: body.bannerUrl,
      certifications: body.certifications,
    });

    return NextResponse.json(sellerProfile, { status: 201 });
  } catch (error) {
    console.error('Error creating seller profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}