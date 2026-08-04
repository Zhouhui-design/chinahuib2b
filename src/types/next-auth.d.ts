import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    isAI?: boolean
    ownerId?: string
  }

  interface Session {
    user: {
      id: string
      role?: string
      isAI?: boolean
      ownerId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    isAI?: boolean
    ownerId?: string
  }
}
