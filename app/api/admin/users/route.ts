import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createUser, listUsers } from "@/lib/user-store"

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }
  const users = await listUsers()
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: string
    name?: string
    password?: string
    durationDays?: number | null
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Informe e-mail e senha" }, { status: 400 })
  }
  if (body.password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres" }, { status: 400 })
  }

  try {
    const user = await createUser({
      email: body.email,
      name: body.name ?? "",
      password: body.password,
      durationDays: body.durationDays ?? null,
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar usuário" },
      { status: 400 },
    )
  }
}
