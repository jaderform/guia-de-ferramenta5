import { NextResponse } from "next/server"
import { accessTokenCookieName } from "@/lib/tiktok-api"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(accessTokenCookieName)
  return res
}
