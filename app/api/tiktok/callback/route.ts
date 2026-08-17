import { type NextRequest, NextResponse } from "next/server"
import {
  accessTokenCookieName,
  exchangeCodeForToken,
  oauthStateCookieName,
} from "@/lib/tiktok-api"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const authCode = searchParams.get("auth_code") ?? searchParams.get("code")
  const returnedState = searchParams.get("state")
  const savedState = request.cookies.get(oauthStateCookieName)?.value

  const redirectTo = (params: Record<string, string>) => {
    const url = new URL("/", origin)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return url
  }

  if (!authCode) {
    return NextResponse.redirect(redirectTo({ tiktok: "error", reason: "missing_code" }))
  }
  if (!returnedState || returnedState !== savedState) {
    return NextResponse.redirect(redirectTo({ tiktok: "error", reason: "state_mismatch" }))
  }

  try {
    const data = await exchangeCodeForToken(authCode)
    const res = NextResponse.redirect(redirectTo({ tiktok: "connected" }))
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
    const reason = err instanceof Error ? err.message : "exchange_failed"
    return NextResponse.redirect(redirectTo({ tiktok: "error", reason }))
  }
}
