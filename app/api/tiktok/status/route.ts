import { NextResponse } from "next/server"
import { getStoredAccessToken } from "@/lib/tiktok-api"

export async function GET() {
  const token = await getStoredAccessToken()
  return NextResponse.json({ connected: Boolean(token) })
}
