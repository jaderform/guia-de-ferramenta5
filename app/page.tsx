"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { AuthScreen } from "@/components/auth-screen"
import { DashboardShell } from "@/components/dashboard-shell"
import { useSession } from "@/hooks/use-session"
import { useContentStatus, useTikTokStatus } from "@/hooks/use-tiktok"

export default function Home() {
  const { user, isLoading, refresh: refreshSession } = useSession()
  const { connected, refresh } = useTikTokStatus()
  const { refresh: refreshContent } = useContentStatus()

  // Trata o retorno dos dois fluxos OAuth do TikTok no redirect:
  // - Marketing API (anuncios): retorna ?auth_code=...
  // - Content Posting v2 (organico): retorna ?code=...&scopes=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get("tiktok")
    const marketingCode = params.get("auth_code")
    const contentCode = params.get("code")
    const state = params.get("state")

    if (result === "connected") {
      toast.success("Conta TikTok conectada com sucesso")
      refresh()
      window.history.replaceState({}, "", window.location.pathname)
      return
    }
    if (result === "error") {
      const reason = params.get("reason")
      toast.error("Falha ao conectar o TikTok", { description: reason ?? undefined })
      window.history.replaceState({}, "", window.location.pathname)
      return
    }

    if (marketingCode) {
      window.history.replaceState({}, "", window.location.pathname)
      fetch("/api/tiktok/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_code: marketingCode, state }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            toast.success("Marketing API conectada com sucesso")
            refresh()
          } else {
            toast.error("Falha ao conectar anuncios", { description: data.error })
          }
        })
        .catch(() => toast.error("Erro de rede ao conectar o TikTok"))
      return
    }

    if (contentCode) {
      window.history.replaceState({}, "", window.location.pathname)
      fetch("/api/tiktok/content/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: contentCode, state }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            toast.success("Conta de conteudo conectada", {
              description: data.account?.displayName,
            })
            refreshContent()
          } else {
            toast.error("Falha ao conectar conta de conteudo", { description: data.error })
          }
        })
        .catch(() => toast.error("Erro de rede ao conectar o TikTok"))
    }
  }, [refresh, refreshContent])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuthenticated={() => refreshSession()} />
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    await refreshSession()
  }

  return (
    <DashboardShell
      onLogout={handleLogout}
      connected={connected}
      user={user}
    />
  )
}
