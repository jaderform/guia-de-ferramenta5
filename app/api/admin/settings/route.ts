import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getSettingsStatus, saveSettings, type SettingKey } from "@/lib/settings-store"

export const runtime = "nodejs"

const VALID_KEYS: SettingKey[] = [
  "tiktokAppId",
  "tiktokAppSecret",
  "tiktokClientKey",
  "tiktokClientSecret",
  "tiktokRedirectUri",
]

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

/** POST: salva as credenciais enviadas pelo admin. Somente admin. */
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const patch: Partial<Record<SettingKey, string | null>> = {}
  for (const key of VALID_KEYS) {
    if (!(key in body)) continue
    const value = body[key]
    if (value === null) {
      patch[key] = null
    } else if (typeof value === "string") {
      // String vazia é ignorada (nao sobrescreve); use null para limpar.
      if (value.trim()) patch[key] = value
    }
  }

  await saveSettings(patch)
  const status = await getSettingsStatus()
  return NextResponse.json({ ok: true, settings: status })
}
