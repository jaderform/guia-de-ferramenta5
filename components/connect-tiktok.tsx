"use client"

import { Link2, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export function ConnectTikTokButton({
  variant = "default",
  size = "default",
  label = "Conectar conta TikTok",
}: {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading}
      onClick={() => {
        setLoading(true)
        window.location.href = "/api/tiktok/auth"
      }}
    >
      {loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Link2 data-icon="inline-start" />}
      {label}
    </Button>
  )
}

export function ConnectTikTokBanner() {
  return (
    <Card className="border-primary/30 bg-accent/40">
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium">Conecte sua conta oficial do TikTok</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Autorize o acesso via API oficial para carregar suas contas de anúncio e criar
              campanhas de verdade.
            </p>
          </div>
        </div>
        <ConnectTikTokButton />
      </CardContent>
    </Card>
  )
}
