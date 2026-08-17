import { NextResponse } from "next/server"
import {
  getAdvertiserInfo,
  getAuthorizedAdvertisers,
  getStoredAccessToken,
} from "@/lib/tiktok-api"

export async function GET() {
  const token = await getStoredAccessToken()
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 })
  }

  try {
    const authorized = await getAuthorizedAdvertisers()
    const ids = authorized.list.map((a) => a.advertiser_id)
    if (ids.length === 0) {
      return NextResponse.json({ advertisers: [] })
    }

    // A API aceita ate 100 ids por chamada de advertiser/info.
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100))

    const results = await Promise.all(chunks.map((chunk) => getAdvertiserInfo(chunk)))
    const advertisers = results.flatMap((r) => r.list)

    return NextResponse.json({ advertisers })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
