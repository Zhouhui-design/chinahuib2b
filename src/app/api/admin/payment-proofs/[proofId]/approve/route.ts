import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { proofId: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { adminNotes } = body;

    // Get payment proof
    const proof = await prisma.paymentProof.findUnique({
      where: { id: params.proofId },
      include: {
        user: {
          include: {
            sellerProfile: true,
          },
        },
      },
    });

    if (!proof) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    if (proof.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Payment proof already processed" },
        { status: 400 }
      );
    }

    // Update payment proof status
    await prisma.paymentProof.update({
      where: { id: params.proofId },
      data: {
        status: 'APPROVED',
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
    });

    // Activate seller account
    if (proof.user.sellerProfile) {
      await prisma.sellerProfile.update({
        where: { id: proof.user.sellerProfile.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionAmount: proof.amount,
          lastPaymentAt: new Date(),
          subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true,
        },
      });
    }

    // TODO: Send email notification to user

    return NextResponse.json({
      message: "Payment proof approved and account activated",
    });
  } catch (error) {
    console.error("Failed to approve payment proof:", error);
    return NextResponse.json(
      { error: "Failed to approve payment proof" },
      { status: 500 }
    );
  }
}
