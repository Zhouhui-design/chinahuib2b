import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { invalidateSellerCaches } from "@/lib/cache"

const boothCustomizationSchema = z.object({
  boothName: z.string().min(2).max(100).optional(),
  boothTheme: z.enum(['light', 'dark', 'vibrant', 'modern', 'classic', 'minimal']).optional(),
  boothLayout: z.enum(['grid', 'list', 'featured', 'showcase', 'gallery']).optional(),
  boothColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  boothBgImage: z.string().url().optional().nullable(),
  boothAccentImage: z.string().url().optional().nullable(),
  boothFont: z.string().optional(),
  boothAnimations: z.boolean().optional(),
  booth3DPreview: z.boolean().optional(),
  boothTags: z.array(z.string().max(20)).max(10).optional(),
  boothCategories: z.array(z.string()).optional(),
  isCustomizable: z.boolean().optional(),
})

const presetThemes = {
  light: {
    name: 'Light',
    background: '#ffffff',
    text: '#1f2937',
    accent: '#3b82f6',
    border: '#e5e7eb',
    description: 'Clean and professional light theme'
  },
  dark: {
    name: 'Dark',
    background: '#0f172a',
    text: '#f8fafc',
    accent: '#60a5fa',
    border: '#334155',
    description: 'Modern dark theme for a sleek look'
  },
  vibrant: {
    name: 'Vibrant',
    background: '#fef3c7',
    text: '#78350f',
    accent: '#f59e0b',
    border: '#fcd34d',
    description: 'Bold and colorful theme'
  },
  modern: {
    name: 'Modern',
    background: '#f8fafc',
    text: '#0f172a',
    accent: '#6366f1',
    border: '#e2e8f0',
    description: 'Contemporary design with clean lines'
  },
  classic: {
    name: 'Classic',
    background: '#fffbeb',
    text: '#292524',
    accent: '#b45309',
    border: '#d6d3d1',
    description: 'Timeless elegant theme'
  },
  minimal: {
    name: 'Minimal',
    background: '#fafafa',
    text: '#171717',
    accent: '#a3a3a3',
    border: '#e5e5e5',
    description: 'Simple and understated design'
  }
}

const presetLayouts = {
  grid: { name: 'Grid', description: 'Classic product grid layout' },
  list: { name: 'List', description: 'Compact list view' },
  featured: { name: 'Featured', description: 'Featured products prominently displayed' },
  showcase: { name: 'Showcase', description: 'Showcase style with large images' },
  gallery: { name: 'Gallery', description: 'Image gallery focused presentation' }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const customization = {
      boothName: (seller as any).boothName || null,
      boothTheme: (seller as any).boothTheme || 'modern',
      boothLayout: (seller as any).boothLayout || 'grid',
      boothColor: (seller as any).boothColor || '#6366f1',
      boothBgImage: (seller as any).boothBgImage || null,
      boothAccentImage: (seller as any).boothAccentImage || null,
      boothFont: (seller as any).boothFont || null,
      boothAnimations: (seller as any).boothAnimations || false,
      booth3DPreview: (seller as any).booth3DPreview || false,
      boothTags: (seller as any).boothTags || [],
      boothCategories: (seller as any).boothCategories || [],
      isCustomizable: (seller as any).isCustomizable || false
    }

    return NextResponse.json({
      customization,
      presetThemes,
      presetLayouts,
      preview: generatePreviewSettings(customization)
    })

  } catch (error) {
    console.error('Get booth customization error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booth customization' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = boothCustomizationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data

    const updatedSeller = await prisma.sellerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(updateData.boothName !== undefined && { boothName: updateData.boothName }),
        ...(updateData.boothTheme !== undefined && { boothTheme: updateData.boothTheme }),
        ...(updateData.boothLayout !== undefined && { boothLayout: updateData.boothLayout }),
        ...(updateData.boothColor !== undefined && { boothColor: updateData.boothColor }),
        ...(updateData.boothBgImage !== undefined && { boothBgImage: updateData.boothBgImage }),
        ...(updateData.boothAccentImage !== undefined && { boothAccentImage: updateData.boothAccentImage }),
        ...(updateData.boothFont !== undefined && { boothFont: updateData.boothFont }),
        ...(updateData.boothAnimations !== undefined && { boothAnimations: updateData.boothAnimations }),
        ...(updateData.booth3DPreview !== undefined && { booth3DPreview: updateData.booth3DPreview }),
        ...(updateData.boothTags !== undefined && { boothTags: updateData.boothTags }),
        ...(updateData.boothCategories !== undefined && { boothCategories: updateData.boothCategories }),
        ...(updateData.isCustomizable !== undefined && { isCustomizable: updateData.isCustomizable }),
      }
    })

    // Invalidate seller caches so store/exhibition pages pick up the new
    // booth background/accent images immediately.
    await invalidateSellerCaches(seller.id, seller.storeSlug || undefined)

    const customization = {
      boothName: (updatedSeller as any).boothName,
      boothTheme: (updatedSeller as any).boothTheme,
      boothLayout: (updatedSeller as any).boothLayout,
      boothColor: (updatedSeller as any).boothColor,
      boothBgImage: (updatedSeller as any).boothBgImage,
      boothAccentImage: (updatedSeller as any).boothAccentImage,
      boothFont: (updatedSeller as any).boothFont,
      boothAnimations: (updatedSeller as any).boothAnimations,
      booth3DPreview: (updatedSeller as any).booth3DPreview,
      boothTags: (updatedSeller as any).boothTags,
      boothCategories: (updatedSeller as any).boothCategories,
      isCustomizable: (updatedSeller as any).isCustomizable
    }

    return NextResponse.json({
      success: true,
      message: 'Booth customization updated successfully',
      customization,
      preview: generatePreviewSettings(customization)
    })

  } catch (error) {
    console.error('Update booth customization error:', error)
    return NextResponse.json(
      { error: 'Failed to update booth customization' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action, preset } = body

    if (action === 'apply_preset') {
      const theme = presetThemes[preset as keyof typeof presetThemes]

      if (!theme) {
        return NextResponse.json(
          { error: 'Invalid preset theme' },
          { status: 400 }
        )
      }

      const updatedSeller = await prisma.sellerProfile.update({
        where: { userId: session.user.id },
        data: {
          boothTheme: preset,
          boothColor: theme.accent
        }
      })

      // Invalidate seller caches so store/exhibition pages pick up the new theme.
      await invalidateSellerCaches(seller.id, seller.storeSlug || undefined)

      return NextResponse.json({
        success: true,
        message: `Applied ${preset} preset successfully`,
        customization: {
          boothTheme: (updatedSeller as any).boothTheme,
          boothColor: (updatedSeller as any).boothColor
        }
      })
    }

    if (action === 'reset') {
      const updatedSeller = await prisma.sellerProfile.update({
        where: { userId: session.user.id },
        data: {
          boothTheme: 'modern',
          boothLayout: 'grid',
          boothColor: '#6366f1',
          boothBgImage: null,
          boothAccentImage: null,
          boothFont: null,
          boothAnimations: false,
          booth3DPreview: false,
          boothTags: []
        }
      })

      // Invalidate seller caches so store/exhibition pages pick up the reset.
      await invalidateSellerCaches(seller.id, seller.storeSlug || undefined)

      return NextResponse.json({
        success: true,
        message: 'Reset to default settings',
        customization: {
          boothTheme: (updatedSeller as any).boothTheme,
          boothLayout: (updatedSeller as any).boothLayout,
          boothColor: (updatedSeller as any).boothColor
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Booth preset action error:', error)
    return NextResponse.json(
      { error: 'Failed to apply preset' },
      { status: 500 }
    )
  }
}

function generatePreviewSettings(seller: any) {
  const theme = presetThemes[(seller.boothTheme as keyof typeof presetThemes) || 'modern']

  return {
    cssVariables: {
      '--booth-bg': seller.boothBgImage || theme.background,
      '--booth-text': theme.text,
      '--booth-accent': seller.boothColor || theme.accent,
      '--booth-border': theme.border,
      '--booth-font': seller.boothFont || 'Inter, system-ui, sans-serif'
    },
    layout: seller.boothLayout || 'grid',
    animations: seller.boothAnimations || false,
    enable3D: seller.booth3DPreview || false
  }
}
