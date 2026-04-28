import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, transactionId, amount, notes } = body;

    // Validation
    if (!email || !amount || Number(amount) < 10) {
      return NextResponse.json(
        { error: "Invalid payment information" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sellerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "SELLER") {
      return NextResponse.json(
        { error: "User is not a seller" },
        { status: 400 }
      );
    }

    // Create payment proof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        userId: user.id,
        sellerProfileId: user.sellerProfile?.id || undefined,
        amount: Number(amount),
        currency: "USD",
        transactionId: transactionId || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    // TODO: 实际应用中需要处理文件上传
    // 这里暂时只保存表单数据

    // 发送邮件通知管理员（可选）
    // await sendEmailToAdmin({
    //   to: 'admin@chinahuib2b.top',
    //   subject: 'New Payment Proof Submitted',
    //   body: `User ${email} submitted payment proof for $${amount}`,
    // });

    return NextResponse.json({
      message: "Payment proof submitted successfully",
      proofId: paymentProof.id,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Payment proof submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment proof" },
      { status: 500 }
    );
  }
}
