import { type NextRequest, NextResponse } from "next/server"
import {
  createCampaign,
  getCampaigns,
  getStoredAccessToken,
  type CreateCampaignPayload,
} from "@/lib/tiktok-api"

export async function GET(request: NextRequest) {
  const token = await getStoredAccessToken()
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 401 })

  const advertiserId = new URL(request.url).searchParams.get("advertiser_id")
  if (!advertiserId) {
    return NextResponse.json({ error: "advertiser_id obrigatorio" }, { status: 400 })
  }

  try {
    const data = await getCampaigns(advertiserId)
    return NextResponse.json({ campaigns: data.list ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Cria a mesma campanha em varias contas de anuncio de uma vez.
 * Body: { advertiser_ids: string[], campaign_name, objective_type, budget_mode, budget? }
 */
export async function POST(request: NextRequest) {
  const token = await getStoredAccessToken()
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 401 })

  let body: {
    advertiser_ids?: string[]
    campaign_name?: string
    objective_type?: string
    budget_mode?: CreateCampaignPayload["budget_mode"]
    budget?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }

  const { advertiser_ids, campaign_name, objective_type, budget_mode, budget } = body

  if (!Array.isArray(advertiser_ids) || advertiser_ids.length === 0) {
    return NextResponse.json({ error: "Selecione ao menos uma conta" }, { status: 400 })
  }
  if (!campaign_name || !objective_type || !budget_mode) {
    return NextResponse.json({ error: "Campos obrigatorios ausentes" }, { status: 400 })
  }
  if (budget_mode !== "BUDGET_MODE_INFINITE") {
    if (typeof budget !== "number" || !Number.isFinite(budget) || budget <= 0) {
      return NextResponse.json({ error: "Orcamento invalido" }, { status: 400 })
    }
  }

  // Dispara a criacao em todas as contas selecionadas em paralelo.
  const results = await Promise.all(
    advertiser_ids.map(async (advertiserId) => {
      try {
        const payload: CreateCampaignPayload = {
          advertiser_id: advertiserId,
          campaign_name,
          objective_type,
          budget_mode,
          ...(budget_mode !== "BUDGET_MODE_INFINITE" ? { budget } : {}),
        }
        const data = await createCampaign(payload)
        return { advertiser_id: advertiserId, success: true, campaign_id: data.campaign_id }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido"
        return { advertiser_id: advertiserId, success: false, error: message }
      }
    }),
  )

  const succeeded = results.filter((r) => r.success).length
  return NextResponse.json({
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  })
}
