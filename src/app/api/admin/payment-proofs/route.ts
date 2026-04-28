import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: List payment proofs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const whereClause = status === 'ALL' ? {} : { status };

    const proofs = await prisma.paymentProof.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            username: true,
            sellerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error("Failed to fetch payment proofs:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment proofs" },
      { status: 500 }
    );
  }
}
