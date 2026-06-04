import { NextRequest, NextResponse } from 'next/server';
import * as voucherService from '@/services/voucherService';

// POST /api/vouchers/verify-certificate - Verify certificate authenticity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateNumber } = body;

    if (!certificateNumber) {
      return NextResponse.json({ error: 'Certificate number is required' }, { status: 400 });
    }

    const result = await voucherService.verifyCertificate(certificateNumber);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}