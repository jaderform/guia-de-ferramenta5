import { NextResponse } from "next/server"
import { getAdvertiserFinance, getStoredAccessToken } from "@/lib/tiktok-api"

export async function GET(request: Request) {
  const token = await getStoredAccessToken()
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 401 })
  const advertiserId = new URL(request.url).searchParams.get("advertiser_id")
  if (!advertiserId) return NextResponse.json({ error: "advertiser_id é obrigatório" }, { status: 400 })
  try {
    return NextResponse.json(await getAdvertiserFinance(advertiserId, token))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao consultar financeiro" }, { status: 502 })
  }
}
