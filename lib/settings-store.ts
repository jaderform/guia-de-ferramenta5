import "server-only"
import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * Armazena as credenciais das APIs do TikTok configuradas pelo admin.
 * Baseado em arquivo JSON (.data/settings.json), no mesmo padrao do user-store.
 *
 * Prioridade de leitura: valor salvo pelo admin > variavel de ambiente.
 * Os segredos NUNCA sao enviados de volta ao navegador; o painel recebe
 * apenas o status (configurado/origem) e uma versao mascarada.
 */

export type SettingKey =
  | "tiktokAppId"
  | "tiktokAppSecret"
  | "tiktokClientKey"
  | "tiktokClientSecret"
  | "tiktokRedirectUri"

type StoredSettings = Partial<Record<SettingKey, string>>

const DATA_DIR = path.join(process.cwd(), ".data")
const DATA_FILE = path.join(DATA_DIR, "settings.json")

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

async function readStored(): Promise<StoredSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(raw) as StoredSettings
  } catch {
    return {}
  }
}

async function writeStored(settings: StoredSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2), "utf8")
}

function envValue(key: SettingKey): string | undefined {
  const v = process.env[ENV_MAP[key]]
  return v && v.trim() ? v.trim() : undefined
}

/** Valor efetivo de uma credencial: salvo pelo admin, senao a env var. */
async function resolveValue(key: SettingKey): Promise<string | undefined> {
  const stored = await readStored()
  const custom = stored[key]?.trim()
  return custom || envValue(key)
}

/** Todas as credenciais resolvidas de uma vez. */
export async function getResolvedSettings(): Promise<Record<SettingKey, string | undefined>> {
  const stored = await readStored()
  const out = {} as Record<SettingKey, string | undefined>
  for (const key of Object.keys(ENV_MAP) as SettingKey[]) {
    const custom = stored[key]?.trim()
    out[key] = custom || envValue(key)
  }
  return out
}

/** Salva os valores enviados pelo admin. Campos vazios sao ignorados; null limpa. */
export async function saveSettings(patch: Partial<Record<SettingKey, string | null>>): Promise<void> {
  const stored = await readStored()
  for (const key of Object.keys(ENV_MAP) as SettingKey[]) {
    if (!(key in patch)) continue
    const value = patch[key]
    if (value === null) {
      delete stored[key]
    } else if (typeof value === "string" && value.trim()) {
      stored[key] = value.trim()
    }
  }
  await writeStored(stored)
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
  source: "custom" | "env" | "none"
  preview: string | null
}

/** Status seguro para exibir no painel (sem revelar os segredos). */
export async function getSettingsStatus(): Promise<SettingStatus[]> {
  const stored = await readStored()
  return (Object.keys(ENV_MAP) as SettingKey[]).map((key) => {
    const custom = stored[key]?.trim()
    const env = envValue(key)
    const value = custom || env
    return {
      key,
      configured: Boolean(value),
      source: custom ? "custom" : env ? "env" : "none",
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
