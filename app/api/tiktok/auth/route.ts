import { NextResponse } from "next/server"
import { buildAuthUrl, oauthStateCookieName } from "@/lib/tiktok-api"

export async function GET() {
  try {
    const state = crypto.randomUUID()
    const url = await buildAuthUrl(state)
    const res = NextResponse.redirect(url)
    res.cookies.set(oauthStateCookieName, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    })
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
