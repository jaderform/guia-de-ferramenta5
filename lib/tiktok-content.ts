import "server-only"
import { cookies } from "next/headers"
import { getContentClientCredentials } from "@/lib/settings-store"
import { resolveRedirectUri } from "@/lib/redirect-uri"

/**
 * Cliente server-side para o TikTok Content Posting API / Login Kit (OAuth v2).
 * Fluxo separado da Marketing API: usa client_key/client_secret e autoriza
 * UMA conta de criador por vez. Guardamos uma lista de contas conectadas.
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 */

const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/"
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
export const OPEN_API_BASE = "https://open.tiktokapis.com/v2"

const ACCOUNTS_COOKIE = "tiktok_content_accounts"
const OAUTH_STATE_COOKIE = "tiktok_content_state"

export const contentStateCookieName = OAUTH_STATE_COOKIE

// Escopos suportados pelo app (os mesmos da URL fornecida pelo usuario).
export const CONTENT_SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.list",
  "video.insights",
  "video.publish",
  "video.upload",
]

/**
 * Le as credenciais do Content Posting. Prioriza o que o admin salvou no
 * painel, com fallback para as variaveis de ambiente.
 */
export async function getContentCredentials() {
  const { clientKey, clientSecret, redirectUri } = await getContentClientCredentials()
  if (!clientKey || !clientSecret) {
    throw new Error("TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET nao configurados")
  }
  return { clientKey, clientSecret, redirectUri }
}

async function resolveContentRedirectUri(explicit?: string) {
  const { redirectUri } = await getContentCredentials()
  const value = explicit ?? redirectUri
  return resolveRedirectUri(value)
}

/** Monta a URL de autorizacao v2 (client_key). */
export async function buildContentAuthUrl(state: string, redirectUri: string) {
  const { clientKey } = await getContentCredentials()
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: CONTENT_SCOPES.join(","),
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

export async function getConfiguredRedirectUri() {
  return resolveContentRedirectUri()
}

export type ContentTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  open_id: string
  scope: string
}

/** Troca o code do OAuth v2 por access_token + refresh_token. */
export async function exchangeContentCode(code: string, redirectUri: string) {
  const { clientKey, clientSecret } = await getContentCredentials()
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error) {
    throw new Error(json.error_description || json.error)
  }
  return json as ContentTokenResponse
}

/** Renova o access_token usando o refresh_token. */
export async function refreshContentToken(refreshToken: string) {
  const { clientKey, clientSecret } = await getContentCredentials()
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error) {
    throw new Error(json.error_description || json.error)
  }
  return json as ContentTokenResponse
}

// --- Persistencia das contas conectadas -------------------------------------

export type ConnectedAccount = {
  openId: string
  displayName: string
  avatarUrl?: string
  username?: string
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
}

/** Versao publica (sem tokens) enviada ao cliente. */
export type PublicAccount = {
  openId: string
  displayName: string
  avatarUrl?: string
  username?: string
}

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const store = await cookies()
  const raw = store.get(ACCOUNTS_COOKIE)?.value
  if (!raw) return []
  try {
    return JSON.parse(raw) as ConnectedAccount[]
  } catch {
    return []
  }
}

export function toPublicAccount(a: ConnectedAccount): PublicAccount {
  return {
    openId: a.openId,
    displayName: a.displayName,
    avatarUrl: a.avatarUrl,
    username: a.username,
  }
}

export async function saveConnectedAccount(account: ConnectedAccount) {
  const store = await cookies()
  const accounts = await getConnectedAccounts()
  const next = accounts.filter((a) => a.openId !== account.openId)
  next.push(account)
  store.set(ACCOUNTS_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function removeConnectedAccount(openId: string) {
  const store = await cookies()
  const accounts = await getConnectedAccounts()
  const next = accounts.filter((a) => a.openId !== openId)
  if (next.length) {
    store.set(ACCOUNTS_COOKIE, JSON.stringify(next), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  } else {
    store.delete(ACCOUNTS_COOKIE)
  }
}

/** Garante um token valido, renovando se necessario. */
async function ensureValidToken(account: ConnectedAccount): Promise<string> {
  if (Date.now() < account.expiresAt - 60_000) return account.accessToken
  const refreshed = await refreshContentToken(account.refreshToken)
  const updated: ConnectedAccount = {
    ...account,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
  }
  await saveConnectedAccount(updated)
  return updated.accessToken
}

// --- Chamadas a Open API -----------------------------------------------------

type UserInfo = {
  open_id: string
  display_name: string
  avatar_url?: string
  username?: string
}

/** Busca dados basicos do usuario recem autorizado. */
export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const url = new URL(`${OPEN_API_BASE}/user/info/`)
  url.searchParams.set("fields", "open_id,display_name,avatar_url,username")
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error && json.error.code !== "ok") {
    throw new Error(json.error.message || "Falha ao buscar dados do usuario")
  }
  return json.data.user as UserInfo
}

/** Consulta as informacoes do criador antes de publicar (limites, privacidade). */
export async function queryCreatorInfo(account: ConnectedAccount) {
  const token = await ensureValidToken(account)
  const res = await fetch(`${OPEN_API_BASE}/post/publish/creator_info/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error && json.error.code !== "ok") {
    throw new Error(json.error.message || "Falha ao consultar creator info")
  }
  return json.data as {
    creator_username: string
    creator_nickname: string
    privacy_level_options: string[]
    max_video_post_duration_sec: number
  }
}

export type PublishVideoInput = {
  title: string
  videoUrl: string
  privacyLevel: string
  disableComment?: boolean
  disableDuet?: boolean
  disableStitch?: boolean
}

/**
 * Publica um video via PULL_FROM_URL (o TikTok baixa o video da URL informada).
 * Retorna o publish_id para consultar status posteriormente.
 */
export async function publishVideo(account: ConnectedAccount, input: PublishVideoInput) {
  const token = await ensureValidToken(account)
  const res = await fetch(`${OPEN_API_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: input.title,
        privacy_level: input.privacyLevel,
        disable_comment: input.disableComment ?? false,
        disable_duet: input.disableDuet ?? false,
        disable_stitch: input.disableStitch ?? false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: input.videoUrl,
      },
    }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error && json.error.code !== "ok") {
    throw new Error(json.error.message || "Falha ao publicar video")
  }
  return json.data as { publish_id: string }
}

/** Consulta o status de uma publicacao. */
export async function fetchPublishStatus(account: ConnectedAccount, publishId: string) {
  const token = await ensureValidToken(account)
  const res = await fetch(`${OPEN_API_BASE}/post/publish/status/fetch/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ publish_id: publishId }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error && json.error.code !== "ok") {
    throw new Error(json.error.message || "Falha ao consultar status")
  }
  return json.data as { status: string; fail_reason?: string; publicaly_available_post_id?: string[] }
}

/** Lista videos publicados da conta (para insights). */
export async function listVideos(account: ConnectedAccount) {
  const token = await ensureValidToken(account)
  const res = await fetch(`${OPEN_API_BASE}/video/list/?fields=id,title,like_count,comment_count,share_count,view_count,create_time`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ max_count: 20 }),
    cache: "no-store",
  })
  const json = await res.json()
  if (json.error && json.error.code !== "ok") {
    throw new Error(json.error.message || "Falha ao listar videos")
  }
  return json.data as {
    videos: {
      id: string
      title: string
      like_count: number
      comment_count: number
      share_count: number
      view_count: number
      create_time: number
    }[]
  }
}
