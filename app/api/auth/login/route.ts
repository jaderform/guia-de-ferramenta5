import { type NextRequest, NextResponse } from "next/server"
import {
  createSessionToken,
  findByEmail,
  isAccessValid,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/user-store"

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string
    password?: string
  }
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha" }, { status: 400 })
  }

  const user = await findByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 })
  }

  if (!isAccessValid(user)) {
    const reason =
      user.status !== "active"
        ? "Seu acesso foi suspenso. Fale com o administrador."
        : "Seu acesso expirou. Fale com o administrador para renovar."
    return NextResponse.json({ error: reason }, { status: 403 })
  }

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expiresAt: user.expiresAt,
    },
  })
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
