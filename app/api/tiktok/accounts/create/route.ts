import { NextResponse } from "next/server"
import { createAdvertiserAccount, getStoredAccessToken } from "@/lib/tiktok-api"

const MAX_ACCOUNTS = 50

type Body = {
  bcId?: string
  quantity?: number
  namePrefix?: string
  currency?: string
  timezone?: string
  registeredArea?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export async function POST(request: Request) {
  const token = await getStoredAccessToken()
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }

  const {
    bcId,
    quantity,
    namePrefix = "Conta",
    currency = "BRL",
    timezone = "America/Sao_Paulo",
    registeredArea = "BR",
    contactName,
    contactEmail,
    contactPhone,
  } = body

  if (!bcId) {
    return NextResponse.json({ error: "Selecione um Business Center" }, { status: 400 })
  }

  // Validacao server-side da quantidade (inteiro entre 1 e MAX_ACCOUNTS).
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ACCOUNTS) {
    return NextResponse.json(
      { error: `Quantidade deve ser um inteiro entre 1 e ${MAX_ACCOUNTS}` },
      { status: 400 },
    )
  }

  const prefix = String(namePrefix).trim().slice(0, 60) || "Conta"
  const stamp = new Date().toISOString().slice(0, 10)

  // Cria em sequencia para respeitar rate limits e capturar o erro de cada conta.
  const results: Array<{
    name: string
    success: boolean
    advertiser_id?: string
    error?: string
  }> = []

  for (let i = 1; i <= qty; i++) {
    const name = qty === 1 ? prefix : `${prefix} ${stamp} #${String(i).padStart(2, "0")}`
    try {
      const data = await createAdvertiserAccount({
        bcId,
        name,
        currency,
        timezone,
        registeredArea,
        contactName: contactName?.trim() || undefined,
        contactEmail: contactEmail?.trim() || undefined,
        contactPhone: contactPhone?.trim() || undefined,
      })
      const accountId = data.advertiser_id ?? data.oa_id ?? data.id
      results.push({ name, success: true, advertiser_id: accountId })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      results.push({ name, success: false, error: message })
    }
  }

  const created = results.filter((r) => r.success).length
  return NextResponse.json({ created, total: qty, results })
}
