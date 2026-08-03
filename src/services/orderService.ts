import { prisma } from '@/lib/db';
import { Order, OrderStatus, PaymentStatus_Order, EscrowStatus_Order, PaymentMethod } from '@prisma/client';

export interface CreateOrderInput {
  listingId: string;
  buyerId: string;
  quantity: number;
  shippingMethod?: string;
  portOfLoading?: string;
  portOfDestination?: string;
  buyerNote?: string;
}

export interface OrderResult {
  success: boolean;
  order?: Order;
  escrow?: any;
  message: string;
}

export async function createOrderWithStock(
  input: CreateOrderInput
): Promise<OrderResult> {
  const { listingId, buyerId, quantity } = input;

  if (quantity <= 0) {
    return { success: false, message: 'Quantity must be greater than 0' };
  }

  const listing = await prisma.auctionListing.findUnique({
    where: { id: listingId },
    include: {
      poster: true,
      seller: true,
      unit: true,
    },
  });

  if (!listing) {
    return { success: false, message: 'Listing not found' };
  }

  if (listing.status !== 'ACTIVE') {
    return { success: false, message: 'Listing is not active for purchase' };
  }

  if (listing.posterId === buyerId) {
    return { success: false, message: 'You cannot purchase your own listing' };
  }

  const availableStock = listing.stockQuantity - listing.soldQuantity;
  
  if (quantity > availableStock) {
    return {
      success: false,
      message: `Insufficient stock. Available: ${availableStock}`,
    };
  }

  if (listing.minOrderQty && quantity < listing.minOrderQty) {
    return {
      success: false,
      message: `Quantity must be at least ${listing.minOrderQty}`,
    };
  }

  if (listing.maxOrderQty && quantity > listing.maxOrderQty) {
    return {
      success: false,
      message: `Quantity cannot exceed ${listing.maxOrderQty}`,
    };
  }

  const unitPrice = listing.price?.toNumber() ?? 0;
  const totalAmount = unitPrice * quantity;

  if (totalAmount <= 0) {
    return { success: false, message: 'Invalid price' };
  }

  const sellerId = listing.sellerId || listing.posterId;

  const result = await prisma.$transaction(async (tx) => {
    const updatedListing = await tx.auctionListing.update({
      where: {
        id: listingId,
        stockQuantity: { gte: listing.soldQuantity + quantity },
      },
      data: {
        soldQuantity: { increment: quantity },
      },
    });

    if (!updatedListing) {
      throw new Error('STOCK_CONFLICT: Another buyer purchased the stock first. Please try again with a different quantity or the stock may be depleted.');
    }

    const order = await tx.order.create({
      data: {
        buyerId,
        sellerId,
        listingId,
        quantity,
        unitPrice,
        totalAmount,
        currency: listing.currency,
        status: OrderStatus.PENDING_PAYMENT,
        shippingMethod: (input.shippingMethod as any) || (listing.incoterms?.includes('FOB') ? 'FOB' : null),
        portOfLoading: input.portOfLoading || listing.portOfLoading,
        portOfDestination: input.portOfDestination || listing.portOfDestination,
        incoterms: listing.incoterms,
        buyerNote: input.buyerNote,
      },
    });

    return order;
  });

  return {
    success: true,
    order: result,
    message: 'Order created successfully. Please complete payment to confirm.',
  };
}

export async function getOrderById(orderId: string, userId?: string): Promise<Order | null> {
  const where: any = { id: orderId };
  
  if (userId) {
    where.OR = [
      { buyerId: userId },
      { sellerId: userId },
    ];
  }

  return await prisma.order.findUnique({
    where,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
          category: true,
          stockQuantity: true,
          soldQuantity: true,
          portOfLoading: true,
          portOfDestination: true,
          incoterms: true,
          shippingCountry: true,
        },
      },
      buyer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      seller: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      escrow: true,
      logisticsRecords: {
        include: { updates: true },
        orderBy: { createdAt: 'desc' },
      },
      dispute: true,
    },
  });
}

export async function getUserOrders(
  userId: string,
  role: 'buyer' | 'seller',
  status?: string
): Promise<Order[]> {
  const where: any = {};
  if (role === 'buyer') {
    where.buyerId = userId;
  } else {
    where.sellerId = userId;
  }
  if (status) {
    where.status = status;
  }

  return await prisma.order.findMany({
    where,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
          price: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function confirmOrderPayment(
  orderId: string,
  paymentMethod: PaymentMethod,
  gatewayTxId?: string
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return { success: false, message: 'Order is not in pending payment status' };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PENDING_SHIPMENT,
      paymentStatus: PaymentStatus_Order.PAID,
      paymentMethod,
      paymentGatewayTxId: gatewayTxId,
      paidAt: new Date(),
    },
  });

  const escrow = await prisma.escrowTransaction.create({
    data: {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: order.totalAmount,
      currency: order.currency,
      status: EscrowStatus_Order.FUNDED,
      paymentMethod,
      paymentGatewayTxId: gatewayTxId,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { escrowId: escrow.id },
  });

  return {
    success: true,
    order: updatedOrder,
    escrow,
    message: 'Payment received. Funds held in escrow. Seller will be notified to ship.',
  };
}

export async function sellerShipOrder(
  orderId: string,
  sellerId: string,
  shippingDetails: {
    carrierName?: string;
    trackingNumber?: string;
    originPort?: string;
    destinationPort?: string;
    estimatedArrival?: string;
  }
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  if (order.sellerId !== sellerId) {
    return { success: false, message: 'Only the seller can ship this order' };
  }

  if (order.status !== OrderStatus.PENDING_SHIPMENT) {
    return { success: false, message: 'Order cannot be shipped in current status' };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.SHIPPED,
      shippedAt: new Date(),
      carrierName: shippingDetails.carrierName,
      trackingNumber: shippingDetails.trackingNumber,
      portOfLoading: shippingDetails.originPort || order.portOfLoading,
      portOfDestination: shippingDetails.destinationPort || order.portOfDestination,
      estimatedDeliveryDate: shippingDetails.estimatedArrival ? new Date(shippingDetails.estimatedArrival) : undefined,
    },
  });

  if (shippingDetails.trackingNumber) {
    const logistics = await prisma.logisticsRecord.create({
      data: {
        orderId: order.id,
        buyerId: order.buyerId,
        carrierName: shippingDetails.carrierName,
        trackingNumber: shippingDetails.trackingNumber,
        status: 'IN_TRANSIT',
        originPort: shippingDetails.originPort || order.portOfLoading,
        destinationPort: shippingDetails.destinationPort || order.portOfDestination,
        estimatedArrival: shippingDetails.estimatedArrival ? new Date(shippingDetails.estimatedArrival) : undefined,
        shippingDate: new Date(),
        updates: {
          create: {
            status: 'IN_TRANSIT',
            location: shippingDetails.originPort,
            description: 'Package picked up and in transit',
          },
        },
      },
      include: { updates: true },
    });
    return { success: true, order: updatedOrder, message: 'Order shipped successfully. Logistics tracking created.' };
  }

  return { success: true, order: updatedOrder, message: 'Order marked as shipped.' };
}

export async function buyerConfirmReceipt(
  orderId: string,
  buyerId: string
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  if (order.buyerId !== buyerId) {
    return { success: false, message: 'Only the buyer can confirm receipt' };
  }

  if (order.status !== OrderStatus.SHIPPED) {
    return { success: false, message: 'Order cannot be confirmed in current status' };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.COMPLETED,
      deliveredAt: new Date(),
      completedAt: new Date(),
    },
  });

  if (order.escrowId) {
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: {
        status: EscrowStatus_Order.RELEASED,
        releasedToSellerAt: new Date(),
        releasedAt: new Date(),
      },
    });
  }

  const logisticsRecords = await prisma.logisticsRecord.findMany({
    where: { orderId },
  });
  
  for (const record of logisticsRecords) {
    await prisma.logisticsRecord.update({
      where: { id: record.id },
      data: {
        status: 'DELIVERED',
        actualArrival: new Date(),
        deliveryDate: new Date(),
        updates: {
          create: {
            status: 'DELIVERED',
            location: record.destinationPort,
            description: 'Package delivered. Buyer confirmed receipt.',
          },
        },
      },
    });
  }

  return {
    success: true,
    order: updatedOrder,
    message: 'Receipt confirmed. Funds released to seller. Transaction completed.',
  };
}

export async function cancelOrder(
  orderId: string,
  userId: string,
  reason: string
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  if (order.buyerId !== userId && order.sellerId !== userId) {
    return { success: false, message: 'Not authorized to cancel this order' };
  }

  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
    return { success: false, message: 'Order cannot be cancelled' };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  await prisma.auctionListing.update({
    where: { id: order.listingId },
    data: {
      soldQuantity: { decrement: order.quantity },
    },
  });

  if (order.escrowId) {
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: {
        status: EscrowStatus_Order.REFUNDED,
        refundedToBuyerAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus_Order.REFUNDED,
      },
    });
  }

  return {
    success: true,
    order: updatedOrder,
    message: 'Order cancelled. Stock restored. Refund processed.',
  };
}

export async function createDispute(
  orderId: string,
  buyerId: string,
  type: string,
  reason: string,
  docs?: any
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  if (order.buyerId !== buyerId) {
    return { success: false, message: 'Only the buyer can open a dispute' };
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId,
      buyerId,
      sellerId: order.sellerId,
      type: type as any,
      status: 'OPEN',
      reason,
      buyerDocs: docs || [],
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.DISPUTED },
  });

  if (order.escrowId) {
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: { status: EscrowStatus_Order.DISPUTED },
    });
  }

  return {
    success: true,
    order,
    message: 'Dispute opened. Platform will review and resolve within 48 hours.',
  };
}

export async function resolveDispute(
  orderId: string,
  adminId: string,
  resolution: string,
  resolutionAmount?: number,
  resolutionType?: 'REFUND' | 'PARTIAL_REFUND' | 'RELEASE_TO_SELLER'
): Promise<OrderResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dispute: true },
  });

  if (!order || !order.dispute) {
    return { success: false, message: 'No dispute found for this order' };
  }

  const dispute = await prisma.dispute.update({
    where: { orderId },
    data: {
      status: 'RESOLVED',
      resolution,
      resolutionAmount: resolutionAmount ? resolutionAmount : undefined,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    },
  });

  if (resolutionType === 'REFUND' && order.escrowId) {
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: { status: EscrowStatus_Order.REFUNDED, refundedToBuyerAt: new Date() },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus_Order.REFUNDED, status: OrderStatus.CANCELLED },
    });
  } else if (resolutionType === 'RELEASE_TO_SELLER' && order.escrowId) {
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: { status: EscrowStatus_Order.RELEASED, releasedToSellerAt: new Date(), releasedAt: new Date() },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
    });
  } else if (resolutionType === 'PARTIAL_REFUND' && order.escrowId && resolutionAmount) {
    const remainingAmount = order.totalAmount.toNumber() - resolutionAmount;
    await prisma.escrowTransaction.update({
      where: { id: order.escrowId },
      data: { status: EscrowStatus_Order.PARTIALLY_REFUNDED, refundedToBuyerAt: new Date() },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus_Order.PARTIAL_REFUND },
    });
  }

  return {
    success: true,
    order,
    message: `Dispute resolved: ${resolution}`,
  };
}
