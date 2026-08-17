"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  Users2,
  UserCheck,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { ApiCredentialsCard } from "@/components/views/api-credentials-card"
import { CreateUserDialog } from "@/components/views/create-user-dialog"
import { useAdminUsers, type AdminUser } from "@/hooks/use-admin-users"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDate(iso: string | null) {
  if (!iso) return "Sem expiração"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function daysLeft(iso: string | null) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function accessBadge(user: AdminUser) {
  if (user.role === "admin") {
    return <Badge className="bg-primary/15 text-primary">Admin</Badge>
  }
  if (user.status === "suspended") {
    return <Badge variant="destructive">Suspenso</Badge>
  }
  const left = daysLeft(user.expiresAt)
  if (left !== null && left <= 0) {
    return <Badge variant="destructive">Expirado</Badge>
  }
  if (left !== null && left <= 7) {
    return (
      <Badge variant="secondary" className="text-amber-600">
        Expira em {left}d
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-emerald-600">
      Ativo
    </Badge>
  )
}

export function AdminView() {
  const { users, error, isLoading, refresh } = useAdminUsers()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
    )
  }, [users, query])

  const stats = useMemo(() => {
    const clients = users.filter((u) => u.role === "user")
    const active = clients.filter(
      (u) => u.status === "active" && (daysLeft(u.expiresAt) ?? 1) > 0,
    )
    const expiringSoon = clients.filter((u) => {
      const left = daysLeft(u.expiresAt)
      return u.status === "active" && left !== null && left > 0 && left <= 7
    })
    return { total: clients.length, active: active.length, expiring: expiringSoon.length }
  }, [users])

  async function action(id: string, body: Record<string, unknown>, okMsg: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(okMsg)
        refresh()
      } else {
        toast.error("Ação falhou", { description: data.error })
      }
    } catch {
      toast.error("Erro de rede")
    }
  }

  async function removeUser(id: string, email: string) {
    if (!confirm(`Excluir o acesso de ${email}? Esta ação não pode ser desfeita.`)) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success("Usuário excluído")
        refresh()
      } else {
        toast.error("Não foi possível excluir", { description: data.error })
      }
    } catch {
      toast.error("Erro de rede")
    }
  }

  async function resetPassword(id: string) {
    const pwd = prompt("Nova senha (mínimo 6 caracteres):")
    if (!pwd) return
    if (pwd.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres")
      return
    }
    action(id, { action: "setPassword", password: pwd }, "Senha atualizada")
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Administração" description="Gerencie o acesso dos usuários." />
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              Apenas o administrador pode ver esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Administração"
        description="Crie acessos, defina a validade e gerencie os usuários da plataforma."
        action={
          <>
            <Button variant="outline" size="icon" onClick={() => refresh()} aria-label="Atualizar">
              <RefreshCw />
            </Button>
            <CreateUserDialog onCreated={refresh} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users2} label="Total de usuários" value={stats.total} />
        <StatCard icon={UserCheck} label="Ativos" value={stats.active} tone="emerald" />
        <StatCard icon={Clock} label="Expiram em 7 dias" value={stats.expiring} tone="amber" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nome ou e-mail"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[60px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{accessBadge(user)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === "admin" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" aria-label="Ações">
                                  <MoreHorizontal />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    action(user.id, { action: "extend", days: 30 }, "Validade +30 dias")
                                  }
                                >
                                  Estender +30 dias
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    action(user.id, { action: "extend", days: 90 }, "Validade +90 dias")
                                  }
                                >
                                  Estender +90 dias
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    action(
                                      user.id,
                                      { action: "setExpiry", expiresAt: null },
                                      "Acesso vitalício definido",
                                    )
                                  }
                                >
                                  Sem expiração
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => resetPassword(user.id)}>
                                  Redefinir senha
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                {user.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      action(user.id, { action: "suspend" }, "Usuário suspenso")
                                    }
                                  >
                                    Suspender acesso
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      action(user.id, { action: "activate" }, "Usuário reativado")
                                    }
                                  >
                                    Reativar acesso
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => removeUser(user.id, user.email)}
                                >
                                  Excluir usuário
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ApiCredentialsCard />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users2
  label: string
  value: number
  tone?: "emerald" | "amber"
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-primary"
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className={`size-5 ${toneClass}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}
