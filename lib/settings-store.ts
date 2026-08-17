import "server-only"

/**
 * Credenciais das APIs do TikTok, lidas exclusivamente das variaveis de
 * ambiente do projeto. Nao ha gravacao em disco (o filesystem e somente-leitura
 * no deploy da Vercel). Para alterar os valores, edite as variaveis de ambiente
 * do projeto e faca um novo deploy.
 *
 * Os segredos NUNCA sao enviados de volta ao navegador; o painel recebe apenas
 * o status (configurado ou nao) e uma versao mascarada.
 */

export type SettingKey =
  | "tiktokAppId"
  | "tiktokAppSecret"
  | "tiktokClientKey"
  | "tiktokClientSecret"
  | "tiktokRedirectUri"

/** Mapeia cada chave para a variavel de ambiente correspondente. */
const ENV_MAP: Record<SettingKey, string> = {
  tiktokAppId: "TIKTOK_APP_ID",
  tiktokAppSecret: "TIKTOK_APP_SECRET",
  tiktokClientKey: "TIKTOK_CLIENT_KEY",
  tiktokClientSecret: "TIKTOK_CLIENT_SECRET",
  tiktokRedirectUri: "TIKTOK_REDIRECT_URI",
}

/** Quais chaves sao segredos (nao devem ser expostas nem mascaradas por inteiro). */
const SECRET_KEYS: SettingKey[] = ["tiktokAppSecret", "tiktokClientSecret"]

function envValue(key: SettingKey): string | undefined {
  const v = process.env[ENV_MAP[key]]
  return v && v.trim() ? v.trim() : undefined
}

/** Valor efetivo de uma credencial (da variavel de ambiente). */
async function resolveValue(key: SettingKey): Promise<string | undefined> {
  return envValue(key)
}

/** Todas as credenciais resolvidas de uma vez. */
export async function getResolvedSettings(): Promise<Record<SettingKey, string | undefined>> {
  const out = {} as Record<SettingKey, string | undefined>
  for (const key of Object.keys(ENV_MAP) as SettingKey[]) {
    out[key] = envValue(key)
  }
  return out
}

function maskValue(key: SettingKey, value: string): string {
  if (SECRET_KEYS.includes(key)) {
    return `${"•".repeat(8)}${value.slice(-4)}`
  }
  // Ids / redirect podem aparecer (nao sao segredos), mas encurtamos ids longos.
  if (key === "tiktokRedirectUri") return value
  if (value.length <= 8) return value
  return `${value.slice(0, 4)}${"•".repeat(6)}${value.slice(-4)}`
}

export type SettingStatus = {
  key: SettingKey
  configured: boolean
  source: "env" | "none"
  preview: string | null
}

/** Status seguro para exibir no painel (sem revelar os segredos). */
export async function getSettingsStatus(): Promise<SettingStatus[]> {
  return (Object.keys(ENV_MAP) as SettingKey[]).map((key) => {
    const value = envValue(key)
    return {
      key,
      configured: Boolean(value),
      source: value ? "env" : "none",
      preview: value ? maskValue(key, value) : null,
    }
  })
}

// ---------- Getters de conveniencia para os clientes de API ----------

export async function getMarketingCredentials() {
  const s = await getResolvedSettings()
  return {
    appId: s.tiktokAppId,
    secret: s.tiktokAppSecret,
    redirectUri: s.tiktokRedirectUri,
  }
}

export async function getContentClientCredentials() {
  const s = await getResolvedSettings()
  return {
    clientKey: s.tiktokClientKey,
    clientSecret: s.tiktokClientSecret,
    redirectUri: s.tiktokRedirectUri,
  }
}

export { resolveValue }
