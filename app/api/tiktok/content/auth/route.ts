import { NextResponse } from "next/server"
import {
  buildContentAuthUrl,
  contentStateCookieName,
  getConfiguredRedirectUri,
} from "@/lib/tiktok-content"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    // O redirect precisa bater exatamente com o registrado no painel do TikTok.
    const configured = await getConfiguredRedirectUri()
    const origin = new URL(request.url).origin
    const redirectUri = configured ?? origin

    const state = crypto.randomUUID()
    const authUrl = await buildContentAuthUrl(state, redirectUri)

    const res = NextResponse.redirect(authUrl)
    res.cookies.set(contentStateCookieName, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    })
    // Guarda o redirect usado para reutilizar exatamente no token exchange.
    res.cookies.set("tiktok_content_redirect", redirectUri, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    })
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao iniciar OAuth"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
