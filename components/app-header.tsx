'use client'

import { Bell, ChevronRight, Menu } from 'lucide-react'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { ConnectTikTokButton } from '@/components/connect-tiktok'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { VIEW_LABELS, type ViewId } from '@/lib/tiktok-data'
import type { SessionUser } from '@/hooks/use-session'

const NOTIFICATIONS = [
  {
    title: '32 contas criadas com sucesso',
    time: 'há 5 minutos',
  },
  {
    title: 'Campanha "Black Friday" publicada em 18 contas',
    time: 'há 1 hora',
  },
  {
    title: 'Limite de orçamento atingido em ACC-100486',
    time: 'há 3 horas',
  },
]

export function AppHeader({
  activeView,
  onNavigate,
  onLogout,
  connected = false,
  user,
}: {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  onLogout: () => void
  connected?: boolean
  user: SessionUser
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon-sm" className="md:hidden" />
          }
        >
          <Menu />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarNav
            activeView={activeView}
            onNavigate={onNavigate}
            onLogout={onLogout}
            user={user}
          />
        </SheetContent>
      </Sheet>

      <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-sm">
        <span className="hidden text-muted-foreground sm:inline">
          Guia de Ferramenta
        </span>
        <ChevronRight className="hidden size-3.5 text-muted-foreground sm:inline" />
        <span className="font-medium text-foreground">
          {VIEW_LABELS[activeView]}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {connected ? (
          <Badge variant="secondary" className="hidden gap-1.5 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            TikTok conectado
          </Badge>
        ) : (
          <ConnectTikTokButton size="sm" variant="outline" label="Conectar TikTok" />
        )}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative"
                aria-label="Notificações"
              />
            }
          >
            <Bell />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-primary ring-2 ring-background" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {NOTIFICATIONS.map((n) => (
                <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2">
                  <span className="text-sm font-medium text-foreground">
                    {n.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {n.time}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
