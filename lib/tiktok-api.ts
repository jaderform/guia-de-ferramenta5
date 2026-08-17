import "server-only"
import { cookies } from "next/headers"

/**
 * Cliente server-side para a API oficial do TikTok for Business (Marketing API v1.3).
 * Documentacao: https://business-api.tiktok.com/portal/docs
 */

export const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api/v1.3"
const TIKTOK_AUTH_PORTAL = "https://business-api.tiktok.com/portal/auth"

const ACCESS_TOKEN_COOKIE = "tiktok_access_token"
const OAUTH_STATE_COOKIE = "tiktok_oauth_state"

export function getAppCredentials() {
  const appId = process.env.TIKTOK_APP_ID
  const secret = process.env.TIKTOK_APP_SECRET
  const redirectUri = process.env.TIKTOK_REDIRECT_URI
  if (!appId || !secret) {
    throw new Error("TIKTOK_APP_ID e TIKTOK_APP_SECRET nao configurados")
  }
  return { appId, secret, redirectUri }
}

/**
 * Considera valido apenas um redirect URI "limpo" (http/https e sem uma URL
 * aninhada dentro dele). Isso evita quebrar o fluxo caso a env var tenha sido
 * preenchida com a URL de autorizacao inteira do painel por engano.
 */
function sanitizeRedirectUri(value?: string) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined
    // Se contem redirect_uri aninhado, foi colada a URL de autorizacao inteira.
    if (url.searchParams.has("redirect_uri") || value.includes("portal/auth")) {
      return undefined
    }
    return value
  } catch {
    return undefined
  }
}

/** Monta a URL de autorizacao do portal do TikTok. */
export function buildAuthUrl(state: string) {
  const { appId, redirectUri } = getAppCredentials()
  const params = new URLSearchParams({
    app_id: appId,
    state,
  })
  const cleanRedirect = sanitizeRedirectUri(redirectUri)
  if (cleanRedirect) params.set("redirect_uri", cleanRedirect)
  return `${TIKTOK_AUTH_PORTAL}?${params.toString()}`
}

export const oauthStateCookieName = OAUTH_STATE_COOKIE
export const accessTokenCookieName = ACCESS_TOKEN_COOKIE

/** Troca o auth_code recebido no callback por um access_token de longa duracao. */
export async function exchangeCodeForToken(authCode: string) {
  const { appId, secret } = getAppCredentials()
  const res = await fetch(`${TIKTOK_API_BASE}/oauth2/access_token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, secret, auth_code: authCode }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.message || "Falha ao trocar auth_code por access_token")
  }
  return json.data as {
    access_token: string
    advertiser_ids: string[]
    scope: number[]
  }
}

/** Le o access token guardado no cookie httpOnly. */
export async function getStoredAccessToken() {
  const store = await cookies()
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

/** Chamada autenticada generica a API do TikTok. */
export async function tiktokFetch<T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST"
    query?: Record<string, string>
    body?: unknown
    accessToken?: string
  } = {},
): Promise<T> {
  const { method = "GET", query, body, accessToken } = options
  const token = accessToken ?? (await getStoredAccessToken())
  if (!token) {
    throw new Error("Sem access token do TikTok. Conecte a conta primeiro.")
  }

  const url = new URL(`${TIKTOK_API_BASE}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Access-Token": token,
      "Content-Type": "application/json",
    },
    body: method === "POST" && body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.message || `Erro na API do TikTok (code ${json.code})`)
  }
  return json.data as T
}

/** Lista as contas de anuncio autorizadas para o app. */
export async function getAuthorizedAdvertisers(accessToken?: string) {
  const { appId, secret } = getAppCredentials()
  return tiktokFetch<{ list: { advertiser_id: string; advertiser_name: string }[] }>(
    "/oauth2/advertiser/get/",
    { query: { app_id: appId, secret }, accessToken },
  )
}

/** Detalhes das contas (nome, moeda, status, saldo). */
export async function getAdvertiserInfo(advertiserIds: string[], accessToken?: string) {
  return tiktokFetch<{ list: TikTokAdvertiser[] }>("/advertiser/info/", {
    query: {
      advertiser_ids: JSON.stringify(advertiserIds),
      fields: JSON.stringify([
        "advertiser_id",
        "name",
        "status",
        "currency",
        "balance",
        "timezone",
        "role",
      ]),
    },
    accessToken,
  })
}

/** Lista campanhas de uma conta de anuncio. */
export async function getCampaigns(advertiserId: string, accessToken?: string) {
  return tiktokFetch<{ list: TikTokCampaign[]; page_info: { total_number: number } }>(
    "/campaign/get/",
    { query: { advertiser_id: advertiserId, page_size: "50" }, accessToken },
  )
}

/** Cria uma campanha em uma conta de anuncio. */
export async function createCampaign(payload: CreateCampaignPayload, accessToken?: string) {
  return tiktokFetch<{ campaign_id: string }>("/campaign/create/", {
    method: "POST",
    body: payload,
    accessToken,
  })
}

export type TikTokAdvertiser = {
  advertiser_id: string
  name: string
  status: string
  currency: string
  balance: number
  timezone: string
  role: string
}

export type TikTokCampaign = {
  campaign_id: string
  campaign_name: string
  objective_type: string
  budget: number
  budget_mode: string
  operation_status: string
}

export type CreateCampaignPayload = {
  advertiser_id: string
  campaign_name: string
  objective_type: string
  budget_mode: "BUDGET_MODE_DAY" | "BUDGET_MODE_TOTAL" | "BUDGET_MODE_INFINITE"
  budget?: number
}
