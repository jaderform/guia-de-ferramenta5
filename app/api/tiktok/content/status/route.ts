import { NextResponse } from "next/server"
import { fetchPublishStatus, getConnectedAccounts } from "@/lib/tiktok-content"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { openId, publishId } = await request.json()
    const accounts = await getConnectedAccounts()
    const account = accounts.find((a) => a.openId === openId)
    if (!account) {
      return NextResponse.json({ error: "Conta nao encontrada" }, { status: 404 })
    }
    const data = await fetchPublishStatus(account, publishId)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao consultar status"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
