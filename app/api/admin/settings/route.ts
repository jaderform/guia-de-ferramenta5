import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getSettingsStatus } from "@/lib/settings-store"

export const runtime = "nodejs"

/** GET: status seguro das credenciais (sem revelar segredos). Somente admin. */
export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const status = await getSettingsStatus()
  return NextResponse.json({ settings: status })
}
