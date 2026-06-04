import { prisma } from '@/lib/db'
import { TransactionType, TransactionStatus, PaymentGateway } from '@prisma/client'

export async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0, currency: 'USD' }
    })
  }
  return wallet
}

export async function getWallet(userId: string) {
  return await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { take: 20, orderBy: { createdAt: 'desc' } } }
  })
}

export async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  description: string,
  gateway?: PaymentGateway,
  gatewayTxId?: string,
  reference?: string
) {
  const wallet = await getOrCreateWallet(userId)
  const balanceBefore = Number(wallet.balance)

  if ((type === 'WITHDRAWAL' || type === 'PAYMENT' || type === 'FEE') && balanceBefore < amount) {
    throw new Error('Insufficient balance')
  }

  let balanceAfter = balanceBefore
  let newDeposited = Number(wallet.totalDeposited)
  let newWithdrawn = Number(wallet.totalWithdrawn)

  if (type === 'DEPOSIT' || type === 'REFUND') {
    balanceAfter = balanceBefore + amount
    if (type === 'DEPOSIT') newDeposited += amount
  } else if (type === 'WITHDRAWAL' || type === 'PAYMENT' || type === 'FEE') {
    balanceAfter = balanceBefore - amount
    if (type === 'WITHDRAWAL') newWithdrawn += amount
  }

  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount,
      currency: 'USD',
      status: TransactionStatus.COMPLETED,
      description,
      gateway,
      gatewayTxId,
      reference
    }
  })

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: balanceAfter,
      totalDeposited: newDeposited,
      totalWithdrawn: newWithdrawn
    }
  })

  return transaction
}

export async function hasSufficientBalance(userId: string, amount: number) {
  const wallet = await getOrCreateWallet(userId)
  return Number(wallet.balance) >= amount
}

export async function getTransactionHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const wallet = await getOrCreateWallet(userId)
  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.walletTransaction.count({ where: { walletId: wallet.id } })
  ])
  return { transactions, total, totalPages: Math.ceil(total / limit), page, limit }
}

// Create payment proof (uses existing PaymentProof model, compatible)
export async function createPaymentProof(
  userId: string,
  amount: number,
  paymentMethod: string,
  transactionId?: string,
  notes?: string
) {
  return await prisma.paymentProof.create({
    data: {
      userId,
      amount,
      currency: 'USD',
      paymentMethod,
      transactionId,
      notes,
      status: 'PENDING'
    }
  })
}

// Review payment proof (admin only)
export async function reviewPaymentProof(
  proofId: string,
  status: 'APPROVED' | 'REJECTED',
  adminNotes?: string
) {
  const proof = await prisma.paymentProof.findUnique({ where: { id: proofId } })
  if (!proof) throw new Error('Payment proof not found')

  if (status === 'APPROVED') {
    await createTransaction(
      proof.userId,
      'DEPOSIT',
      Number(proof.amount),
      'Manual deposit approved',
      undefined,
      undefined,
      `PaymentProof:${proof.id}`
    )
  }

  return await prisma.paymentProof.update({
    where: { id: proofId },
    data: { status, adminNotes, reviewedAt: new Date() }
  })
}

// Create withdrawal request
export async function createWithdrawalRequest(
  userId: string,
  amount: number,
  gateway: PaymentGateway,
  gatewayDetails?: Record<string, unknown>
) {
  const wallet = await getOrCreateWallet(userId)
  if (Number(wallet.balance) < amount) throw new Error('Insufficient balance')

  return await prisma.withdrawalRequest.create({
    data: {
      userId,
      amount,
      currency: 'USD',
      gateway,
      gatewayDetails: gatewayDetails ?? null,
      status: 'PENDING'
    }
  })
}

// Review withdrawal request (admin only)
export async function reviewWithdrawalRequest(
  requestId: string,
  adminUserId: string,
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED',
  reviewNotes?: string,
  gatewayTxId?: string
) {
  const request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } })
  if (!request) throw new Error('Withdrawal request not found')

  if (status === 'REJECTED') {
    // Refund back to wallet
    await createTransaction(
      request.userId,
      'REFUND',
      Number(request.amount),
      'Withdrawal rejected',
      undefined,
      undefined,
      `WithdrawalRejected:${request.id}`
    )
  }

  if (status === 'COMPLETED') {
    // Deduct from wallet
    await createTransaction(
      request.userId,
      'WITHDRAWAL',
      Number(request.amount),
      'Withdrawal completed',
      request.gateway as PaymentGateway,
      gatewayTxId,
      `Withdrawal:${request.id}`
    )
  }

  return await prisma.withdrawalRequest.update({
    where: { id: requestId },
    data: {
      status,
      reviewedByAdmin: adminUserId,
      reviewedAt: new Date(),
      reviewNotes,
      gatewayTxId,
      completedAt: status === 'COMPLETED' ? new Date() : undefined
    }
  })
}
