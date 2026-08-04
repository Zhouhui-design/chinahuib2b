/**
 * AI 权限目录与工具函数
 *
 * 为 AI 账号提供细粒度权限控制。
 * 使用 Prisma AIPermission 模型存储，无记录时回退到默认值。
 */

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { logAIAudit } from '@/lib/ai-audit-prisma'

// ============================================================
// 权限目录定义
// ============================================================

export const AI_PERMISSIONS = {
  // 通用权限
  'product.browse':     { label: '浏览商品',     default: { AI_BUYER: true,  AI_SELLER: true  } },
  'chat.send':          { label: '发送聊天',     default: { AI_BUYER: true,  AI_SELLER: true  } },
  'chat.read':          { label: '读取聊天',     default: { AI_BUYER: true,  AI_SELLER: true  } },
  'shoutout.post':      { label: '广场喊话',     default: { AI_BUYER: true,  AI_SELLER: true  } },
  'order.view':         { label: '查看订单',     default: { AI_BUYER: true,  AI_SELLER: true  } },
  // 买家专属
  'inquiry.create':     { label: '发起询盘',     default: { AI_BUYER: true,  AI_SELLER: false } },
  'order.place':        { label: '下单购买',     default: { AI_BUYER: true,  AI_SELLER: false } },
  // 卖家专属
  'product.create':     { label: '发布商品',     default: { AI_BUYER: false, AI_SELLER: true  } },
  'product.update':     { label: '编辑商品',     default: { AI_BUYER: false, AI_SELLER: true  } },
  'product.delete':     { label: '删除商品',     default: { AI_BUYER: false, AI_SELLER: false } },
  'booth.edit':         { label: '装修展位',     default: { AI_BUYER: false, AI_SELLER: true  } },
  'brochure.upload':    { label: '上传宣传册',   default: { AI_BUYER: false, AI_SELLER: true  } },
  'store.profile.edit': { label: '编辑店铺资料', default: { AI_BUYER: false, AI_SELLER: false } },
  'inquiry.respond':    { label: '回复询盘',     default: { AI_BUYER: false, AI_SELLER: true  } },
  'order.fulfill':      { label: '履行订单',     default: { AI_BUYER: false, AI_SELLER: true  } },
} as const

export type AIPermissionName = keyof typeof AI_PERMISSIONS
export type AIRoleType = 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT'

// ============================================================
// 核心权限检查函数
// ============================================================

/**
 * 检查用户是否拥有某权限。
 *
 * 逻辑：
 * 1. 查询 AIPermission where { userId, permission }
 * 2. 若记录存在且 expiresAt 未过期 → 返回 isAllowed
 * 3. 若记录不存在 → 查 User.isAI；若非 AI 则返回 true（人类不受限）
 * 4. 若是 AI 且无记录 → 返回 AI_PERMISSIONS[permission].default[role]
 */
export async function hasAIPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // 查询 DB 中的权限记录
    const record = await prisma.aIPermission.findFirst({
      where: {
        userId,
        permission,
      },
    })

    // 若记录存在，检查是否过期
    if (record) {
      if (record.expiresAt && record.expiresAt < new Date()) {
        // 已过期，回退到默认值
      } else {
        return record.isAllowed
      }
    }

    // 无记录或已过期 → 查询用户是否为 AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAI: true, role: true },
    })

    // 用户不存在或非 AI → 人类直接放行
    if (!user || !user.isAI) {
      return true
    }

    // AI 用户无记录 → 使用默认值
    const permDef = AI_PERMISSIONS[permission as AIPermissionName]
    if (!permDef) {
      // 未知权限，默认拒绝
      return false
    }

    const roleKey = user.role as 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT'
    return permDef.default[roleKey] ?? false
  } catch (error) {
    console.error('[AI Permissions] hasAIPermission error:', error)
    // 出错时保守拒绝
    return false
  }
}

/**
 * 批量检查权限（避免 N+1 查询）
 */
export async function checkAIPermissions(
  userId: string,
  permissions: string[]
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {}

  try {
    const records = await prisma.aIPermission.findMany({
      where: {
        userId,
        permission: { in: permissions },
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAI: true, role: true },
    })

    const isAI = user?.isAI ?? false
    const role = user?.role as 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT'

    for (const perm of permissions) {
      if (!isAI) {
        result[perm] = true
        continue
      }

      const record = records.find(r => r.permission === perm)
      if (record) {
        if (record.expiresAt && record.expiresAt < new Date()) {
          // 过期，用默认值
          const permDef = AI_PERMISSIONS[perm as AIPermissionName]
          result[perm] = permDef ? (permDef.default[role] ?? false) : false
        } else {
          result[perm] = record.isAllowed
        }
      } else {
        const permDef = AI_PERMISSIONS[perm as AIPermissionName]
        result[perm] = permDef ? (permDef.default[role] ?? false) : false
      }
    }
  } catch (error) {
    console.error('[AI Permissions] checkAIPermissions error:', error)
    for (const perm of permissions) {
      result[perm] = false
    }
  }

  return result
}

// ============================================================
// 默认权限播种
// ============================================================

/**
 * 为新创建的 AI 账号播种默认权限到 DB。
 * 使权限在 guardian UI 中可见可改。
 */
export async function seedDefaultAIPermissions(
  userId: string,
  role: 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT'
): Promise<void> {
  try {
    const permissions = Object.entries(AI_PERMISSIONS).map(([perm, def]) => ({
      userId,
      permission: perm,
      isAllowed: def.default[role as 'AI_BUYER' | 'AI_SELLER'] ?? false,
    }))

    await prisma.aIPermission.createMany({
      data: permissions,
      skipDuplicates: true,
    })

    console.log(`[AI Permissions] Seeded ${permissions.length} default permissions for user ${userId} (role: ${role})`)
  } catch (error) {
    console.error('[AI Permissions] seedDefaultAIPermissions error:', error)
    // 不抛出，避免阻断账号创建
  }
}

// ============================================================
// 有效用户 ID 解析（AI 代理身份）
// ============================================================

/**
 * 获取有效的 SellerProfile 用户 ID。
 * AI 账号使用 ownerId（监护人的 ID），人类用户使用自己的 ID。
 */
export function getEffectiveUserId(session: {
  user?: { id: string; isAI?: boolean; ownerId?: string }
}): string | null {
  if (!session?.user?.id) return null
  if (session.user.isAI && session.user.ownerId) {
    return session.user.ownerId
  }
  return session.user.id
}

// ============================================================
// API 路由权限装饰器
// ============================================================

/**
 * API 路由装饰器：要求当前用户（若是 AI）拥有指定权限。
 * 人类用户透明通过，仅 AI 受限。
 *
 * 用法：
 *   export const POST = requireAIPermission('product.create')(async (request) => { ... })
 */
export function requireAIPermission(permission: string) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest
      const session = await auth()

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }

      // 人类用户直接放行
      if (!session.user.isAI) {
        return handler(...args)
      }

      // AI 用户检查权限
      const allowed = await hasAIPermission(session.user.id, permission)
      if (!allowed) {
        // 异步记录审计（拒绝事件）
        await logAIAudit({
          userId: session.user.id,
          action: permission,
          result: 'DENIED',
          metadata: { path: request?.nextUrl?.pathname },
        })
        return NextResponse.json(
          {
            error: 'Permission denied',
            code: 'AI_PERMISSION_DENIED',
            permission,
          },
          { status: 403 }
        )
      }

      return handler(...args)
    }) as T
  }
}

/**
 * 获取 AI 账号的完整权限列表（DB 记录 + 默认值合并）
 * 用于 guardian UI 展示。
 */
export async function getAIPermissionList(aiUserId: string): Promise<Array<{
  permission: string
  label: string
  isAllowed: boolean
  isDefault: boolean
  expiresAt: Date | null
}>> {
  const records = await prisma.aIPermission.findMany({
    where: { userId: aiUserId },
  })

  const user = await prisma.user.findUnique({
    where: { id: aiUserId },
    select: { role: true },
  })

  const role = user?.role as 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT'

  return Object.entries(AI_PERMISSIONS).map(([perm, def]) => {
    const record = records.find(r => r.permission === perm)
    const defaultValue = def.default[role as 'AI_BUYER' | 'AI_SELLER'] ?? false

    return {
      permission: perm,
      label: def.label,
      isAllowed: record ? record.isAllowed : defaultValue,
      isDefault: !record,
      expiresAt: record?.expiresAt ?? null,
    }
  })
}
