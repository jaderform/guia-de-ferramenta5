'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { SidebarNav } from '@/components/sidebar-nav'
import { AccountsView } from '@/components/views/accounts-view'
import { AdminView } from '@/components/views/admin-view'
import { BillingView } from '@/components/views/billing-view'
import { CampaignLauncherView } from '@/components/views/campaign-launcher-view'
import { DashboardView } from '@/components/views/dashboard-view'
import { OrganicView } from '@/components/views/organic-view'
import { ReportsView } from '@/components/views/reports-view'
import type { ViewId } from '@/lib/tiktok-data'
import type { SessionUser } from '@/hooks/use-session'

export function DashboardShell({
  onLogout,
  connected = false,
  user,
}: {
  onLogout: () => void
  connected?: boolean
  user: SessionUser
}) {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const isAdmin = user.role === 'admin'

  // Impede que um usuario comum acesse a view admin.
  const safeView: ViewId = activeView === 'admin' && !isAdmin ? 'dashboard' : activeView

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border md:block">
        <SidebarNav
          activeView={safeView}
          onNavigate={setActiveView}
          onLogout={onLogout}
          user={user}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <AppHeader
          activeView={safeView}
          onNavigate={setActiveView}
          onLogout={onLogout}
          connected={connected}
          user={user}
        />
        <main className="flex-1 p-4 md:p-6">
          {safeView === 'dashboard' && <DashboardView />}
          {safeView === 'accounts' && <AccountsView />}
          {safeView === 'launcher' && <CampaignLauncherView />}
          {safeView === 'organic' && <OrganicView />}
          {safeView === 'reports' && <ReportsView />}
          {safeView === 'billing' && <BillingView />}
          {safeView === 'admin' && isAdmin && <AdminView />}
        </main>
      </div>
    </div>
  )
}
