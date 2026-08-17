import "server-only"
import { cookies } from "next/headers"
import {
  findById,
  SESSION_COOKIE,
  verifySessionToken,
  type PublicUser,
} from "@/lib/user-store"

/** Retorna o usuario logado (ou null) a partir do cookie de sessao. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  const userId = verifySessionToken(token)
  if (!userId) return null
  const user = await findById(userId)
  if (!user) return null
  const { passwordHash: _omit, ...pub } = user
  return pub
}

/** Garante que o usuario logado seja admin, senao lanca. */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    throw new Error("unauthorized")
  }
  return user
}
