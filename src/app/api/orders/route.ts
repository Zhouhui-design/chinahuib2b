import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as orderService from '@/services/orderService';
import { PaymentMethod } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'buyer' | 'seller' || 'buyer';
    const status = searchParams.get('status') || undefined;

    const orders = await orderService.getUserOrders(session.user.id, role, status);

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, quantity, shippingMethod, portOfLoading, portOfDestination, buyerNote } = body;

    if (!listingId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Listing ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const result = await orderService.createOrderWithStock({
      listingId,
      buyerId: session.user.id,
      quantity: Math.floor(quantity),
      shippingMethod,
      portOfLoading,
      portOfDestination,
      buyerNote,
    });

    if (!result.success) {
      if (result.message?.includes('STOCK_CONFLICT')) {
        return NextResponse.json(
          { error: result.message, code: 'STOCK_CONFLICT' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data: result.order, message: result.message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error?.message?.includes('STOCK_CONFLICT')) {
      return NextResponse.json(
        { error: 'Stock conflict: Another buyer purchased the available stock. Please try again.', code: 'STOCK_CONFLICT' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
