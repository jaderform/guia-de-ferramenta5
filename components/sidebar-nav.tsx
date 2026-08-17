'use client'

import {
  ChevronsUpDown,
  LogOut,
  Settings,
  UserRound,
  LifeBuoy,
} from 'lucide-react'
import { Brand } from '@/components/brand'
import { NAV_ITEMS } from '@/components/nav-config'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ViewId } from '@/lib/tiktok-data'
import type { SessionUser } from '@/hooks/use-session'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function SidebarNav({
  activeView,
  onNavigate,
  onLogout,
  user,
}: {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  onLogout: () => void
  user: SessionUser
}) {
  const isAdmin = user.role === 'admin'
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-full flex-col gap-2 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Brand />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Plataforma
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">
              {isAdmin ? 'Conta administrador' : 'Meu acesso'}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {isAdmin ? 'Admin' : 'Ativo'}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {isAdmin
              ? 'Acesso total à plataforma e à administração de usuários.'
              : user.expiresAt
                ? `Acesso válido até ${new Date(user.expiresAt).toLocaleDateString('pt-BR')}.`
                : 'Acesso sem data de expiração.'}
          </p>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {initials(user.name) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserRound />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy />
                Suporte
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
