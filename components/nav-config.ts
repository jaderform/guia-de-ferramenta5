import {
  LayoutDashboard,
  Users,
  Rocket,
  Video,
  BarChart3,
  CreditCard,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { ViewId } from '@/lib/tiktok-data'

export type NavItem = {
  id: ViewId
  label: string
  icon: LucideIcon
  /** Item visível apenas para administradores. */
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'Gestão de Contas', icon: Users },
  { id: 'launcher', label: 'Lançador de Campanhas', icon: Rocket },
  { id: 'organic', label: 'Posts Orgânicos', icon: Video },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'billing', label: 'Minha Assinatura', icon: CreditCard },
  { id: 'admin', label: 'Administração', icon: ShieldCheck, adminOnly: true },
]
