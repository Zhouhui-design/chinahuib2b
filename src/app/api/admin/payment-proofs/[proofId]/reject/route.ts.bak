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
        status: 'REJECTED',
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
    });

    // TODO: Send email notification to user

    return NextResponse.json({
      message: "Payment proof rejected",
    });
  } catch (error) {
    console.error("Failed to reject payment proof:", error);
    return NextResponse.json(
      { error: "Failed to reject payment proof" },
      { status: 500 }
    );
  }
}
