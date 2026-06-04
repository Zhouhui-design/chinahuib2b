import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// GET /api/sellers/[id]/products - Get seller's products
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive') === 'true';

    const products = await sellerService.getProductsBySeller(
      params.id,
      categoryId || undefined,
      isActive
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sellers/[id]/products - Create product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const seller = await sellerService.getSellerProfile(session.user.id);
    if (!seller || seller.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const product = await sellerService.createProduct(params.id, {
      title: body.title,
      titles: body.titles,
      description: body.description,
      descriptions: body.descriptions,
      categoryId: body.categoryId,
      boothId: body.boothId,
      specifications: body.specifications,
      minOrderQty: body.minOrderQty,
      supplyCapacity: body.supplyCapacity,
      mainImageUrl: body.mainImageUrl,
      images: body.images,
      hasBrochure: body.hasBrochure,
      isFeatured: body.isFeatured,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}