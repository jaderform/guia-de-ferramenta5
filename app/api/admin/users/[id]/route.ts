import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { deleteUser, extendUser, updateUser } from "@/lib/user-store"

/**
 * Acoes sobre um usuario:
 * PATCH  { action: "suspend" | "activate" | "extend" | "setPassword" | "setExpiry", ... }
 * DELETE remove o usuario.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = (await req.json().catch(() => ({}))) as {
    action?: string
    days?: number
    password?: string
    expiresAt?: string | null
  }

  try {
    let result
    switch (body.action) {
      case "suspend":
        result = await updateUser(id, { status: "suspended" })
        break
      case "activate":
        result = await updateUser(id, { status: "active" })
        break
      case "extend":
        result = await extendUser(id, body.days ?? 30)
        break
      case "setPassword":
        if (!body.password || body.password.length < 6) {
          return NextResponse.json({ error: "Senha muito curta" }, { status: 400 })
        }
        result = await updateUser(id, { password: body.password })
        break
      case "setExpiry":
        result = await updateUser(id, { expiresAt: body.expiresAt ?? null })
        break
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
    if (!result) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json({ user: result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro" },
      { status: 400 },
    )
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 })
  }
  const { id } = await ctx.params
  try {
    const ok = await deleteUser(id)
    if (!ok) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro" },
      { status: 400 },
    )
  }
}
