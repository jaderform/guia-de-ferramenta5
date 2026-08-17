import { type NextRequest, NextResponse } from "next/server"
import {
  accessTokenCookieName,
  exchangeCodeForToken,
  oauthStateCookieName,
} from "@/lib/tiktok-api"

/**
 * Troca o auth_code pelo access_token quando o TikTok redireciona para a raiz
 * do app (redirect URL registrado como o dominio, sem /api/tiktok/callback).
 */
export async function POST(request: NextRequest) {
  let body: { auth_code?: string; state?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }

  const { auth_code, state } = body
  const savedState = request.cookies.get(oauthStateCookieName)?.value

  if (!auth_code) {
    return NextResponse.json({ error: "auth_code ausente" }, { status: 400 })
  }
  // A verificacao de state so acontece se ele foi gerado por este app.
  if (savedState && state && savedState !== state) {
    return NextResponse.json({ error: "state_mismatch" }, { status: 400 })
  }

  try {
    const data = await exchangeCodeForToken(auth_code)
    const res = NextResponse.json({ ok: true, advertiser_ids: data.advertiser_ids })
    res.cookies.set(accessTokenCookieName, data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    res.cookies.delete(oauthStateCookieName)
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : "exchange_failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
