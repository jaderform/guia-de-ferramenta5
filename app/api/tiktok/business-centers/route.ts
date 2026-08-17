import { NextResponse } from "next/server"
import { getBusinessCenters, getStoredAccessToken } from "@/lib/tiktok-api"

export async function GET() {
  const token = await getStoredAccessToken()
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 })
  }

  try {
    const businessCenters = await getBusinessCenters()
    return NextResponse.json({ businessCenters })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
