import "server-only"
import { promises as fs } from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

/**
 * Store de usuarios simples baseado em arquivo JSON.
 * Funciona no preview do v0 e em uma instancia persistente.
 * Em producao serverless recomenda-se trocar por um banco de dados.
 */

export type UserRole = "admin" | "user"

export type StoredUser = {
  id: string
  email: string
  name: string
  role: UserRole
  passwordHash: string
  status: "active" | "suspended"
  /** Data ISO de expiracao do acesso. null = sem expiracao. */
  expiresAt: string | null
  createdAt: string
}

export type PublicUser = Omit<StoredUser, "passwordHash">

const DATA_DIR = path.join(process.cwd(), ".data")
const DATA_FILE = path.join(DATA_DIR, "users.json")

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "jaderform@gmail.com").toLowerCase()
// Senha inicial do admin. Pode ser trocada depois pelo proprio painel.
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD ?? "Admin0596#"

const SESSION_SECRET =
  process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "v0-tiktok-suite-dev-secret-change-me"

// ---------- Hash de senha (scrypt) ----------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const derived = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":")
  if (!salt || !key) return false
  const derived = crypto.scryptSync(password, salt, 64).toString("hex")
  const a = Buffer.from(key, "hex")
  const b = Buffer.from(derived, "hex")
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// ---------- Persistencia ----------

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8")
}

/** Garante que o admin exista, criando-o na primeira execucao. */
async function ensureSeed(users: StoredUser[]): Promise<StoredUser[]> {
  if (users.some((u) => u.email === ADMIN_EMAIL)) return users
  const admin: StoredUser = {
    id: crypto.randomUUID(),
    email: ADMIN_EMAIL,
    name: "Administrador",
    role: "admin",
    passwordHash: hashPassword(ADMIN_INITIAL_PASSWORD),
    status: "active",
    expiresAt: null,
    createdAt: new Date().toISOString(),
  }
  const next = [admin, ...users]
  await writeAll(next)
  return next
}

function toPublic(u: StoredUser): PublicUser {
  const { passwordHash: _omit, ...rest } = u
  return rest
}

/** True se o acesso esta valido (ativo e nao expirado). */
export function isAccessValid(u: StoredUser | PublicUser): boolean {
  if (u.status !== "active") return false
  if (u.role === "admin") return true
  if (!u.expiresAt) return true
  return new Date(u.expiresAt).getTime() > Date.now()
}

// ---------- Operacoes ----------

export async function listUsers(): Promise<PublicUser[]> {
  const users = await ensureSeed(await readAll())
  return users.map(toPublic)
}

export async function findByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await ensureSeed(await readAll())
  return users.find((u) => u.email === email.toLowerCase())
}

export async function findById(id: string): Promise<StoredUser | undefined> {
  const users = await ensureSeed(await readAll())
  return users.find((u) => u.id === id)
}

export async function createUser(input: {
  email: string
  name: string
  password: string
  durationDays: number | null
}): Promise<PublicUser> {
  const users = await ensureSeed(await readAll())
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email === email)) {
    throw new Error("Já existe um usuário com esse e-mail")
  }
  const expiresAt =
    input.durationDays && input.durationDays > 0
      ? new Date(Date.now() + input.durationDays * 86_400_000).toISOString()
      : null
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim() || email,
    role: "user",
    passwordHash: hashPassword(input.password),
    status: "active",
    expiresAt,
    createdAt: new Date().toISOString(),
  }
  await writeAll([...users, user])
  return toPublic(user)
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, "status" | "expiresAt" | "name">> & { password?: string },
): Promise<PublicUser | undefined> {
  const users = await ensureSeed(await readAll())
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return undefined
  const current = users[idx]
  if (current.role === "admin" && patch.status === "suspended") {
    throw new Error("Não é possível suspender o administrador")
  }
  const updated: StoredUser = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.expiresAt !== undefined ? { expiresAt: patch.expiresAt } : {}),
    ...(patch.password ? { passwordHash: hashPassword(patch.password) } : {}),
  }
  users[idx] = updated
  await writeAll(users)
  return toPublic(updated)
}

/** Estende a validade em N dias a partir de agora (ou do vencimento atual, se maior). */
export async function extendUser(id: string, days: number): Promise<PublicUser | undefined> {
  const user = await findById(id)
  if (!user) return undefined
  const base =
    user.expiresAt && new Date(user.expiresAt).getTime() > Date.now()
      ? new Date(user.expiresAt).getTime()
      : Date.now()
  const expiresAt = new Date(base + days * 86_400_000).toISOString()
  return updateUser(id, { expiresAt })
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await ensureSeed(await readAll())
  const target = users.find((u) => u.id === id)
  if (!target) return false
  if (target.role === "admin") throw new Error("Não é possível excluir o administrador")
  await writeAll(users.filter((u) => u.id !== id))
  return true
}

// ---------- Sessao (cookie assinado) ----------

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString("base64url")
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId: string
    }
    return data.userId
  } catch {
    return null
  }
}

export const SESSION_COOKIE = "tt_session"
