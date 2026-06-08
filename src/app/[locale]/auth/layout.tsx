export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}
