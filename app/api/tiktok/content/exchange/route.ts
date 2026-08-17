import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  contentStateCookieName,
  exchangeContentCode,
  fetchUserInfo,
  saveConnectedAccount,
} from "@/lib/tiktok-content"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { code, state } = await request.json()
    if (!code) {
      return NextResponse.json({ error: "code ausente" }, { status: 400 })
    }

    const store = await cookies()
    const expectedState = store.get(contentStateCookieName)?.value
    if (expectedState && state && expectedState !== state) {
      return NextResponse.json({ error: "state invalido" }, { status: 400 })
    }

    const redirectUri = store.get("tiktok_content_redirect")?.value
    if (!redirectUri) {
      return NextResponse.json(
        { error: "redirect_uri da sessao nao encontrado" },
        { status: 400 },
      )
    }

    const token = await exchangeContentCode(code, redirectUri)
    const user = await fetchUserInfo(token.access_token)

    await saveConnectedAccount({
      openId: token.open_id,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      username: user.username,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    })

    store.delete(contentStateCookieName)
    store.delete("tiktok_content_redirect")

    return NextResponse.json({ ok: true, account: { openId: token.open_id, displayName: user.display_name } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no token exchange"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
