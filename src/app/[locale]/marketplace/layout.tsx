type Props = {
  children: React.ReactNode
}

/**
 * Marketplace metadata now lives in ./page.tsx (a Server Component).
 * This layout is kept as a pass-through.
 *
 * 历史背景：page.tsx 曾是 Client Component，无法导出 metadata，才需要此
 * layout 兜底 canonical（否则 /de/marketplace 会声明 canonical /en）。
 */
export default function MarketplaceLayout({ children }: Props) {
  return <>{children}</>
}
