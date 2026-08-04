import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const input = credentials.email as string
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: input },
              { username: input }
            ]
          }
        })
        
        if (!user || !user.password) return null
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        
        if (!user.isActive) {
          throw new Error("Account is deactivated due to inactivity")
        }
        
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
        
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          isAI: user.isAI,
          ownerId: user.ownerId,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.isAI = (user as any).isAI
        token.ownerId = (user as any).ownerId
      }
      // Ensure id is always present (token.sub is the JWT standard subject field)
      if (!token.id && token.sub) {
        token.id = token.sub as string
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Use token.id first (custom), fall back to token.sub (JWT standard)
        const userId = (token.id || token.sub) as string | undefined
        if (userId) {
          session.user.id = userId
        }
        if (token.role) {
          session.user.role = token.role as string
        }
        if (token.isAI !== undefined) {
          session.user.isAI = token.isAI as boolean
        }
        if (token.ownerId) {
          session.user.ownerId = token.ownerId as string
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      try {
        const urlStr = String(url || '')
        let urlPath: string

        if (urlStr.startsWith('http')) {
          urlPath = new URL(urlStr).pathname
        } else {
          urlPath = urlStr
        }

        if (urlPath.startsWith('/admin') || urlPath.startsWith('/seller')) {
          return urlStr
        }

        const localeDashboardMatch = urlPath.match(/^\/([a-z]{2})\/(admin|seller)(\/.*)?$/)
        if (localeDashboardMatch) {
          return urlStr
        }

        return '/'
      } catch (error) {
        console.error('[Auth] Redirect callback error:', error)
        return '/'
      }
    }
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'x2xhub_fallback_secret_32chars_long_enough',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export const auth = () => getServerSession(authOptions)
