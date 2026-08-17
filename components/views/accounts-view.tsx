"use client"

import { useMemo, useState } from "react"
import { AlertCircle, RefreshCw, Search } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ConnectTikTokBanner } from "@/components/connect-tiktok"
import { useAdvertisers, useTikTokStatus } from "@/hooks/use-tiktok"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function AccountsView() {
  const { connected, isLoading: statusLoading } = useTikTokStatus()
  const { advertisers, error, isLoading, refresh } = useAdvertisers(connected)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return advertisers
    return advertisers.filter(
      (a) => a.name.toLowerCase().includes(q) || a.advertiser_id.toLowerCase().includes(q),
    )
  }, [advertisers, query])

  const activeCount = advertisers.filter((a) => a.status === "STATUS_ENABLE").length

  const header = (
    <PageHeader
      title="Gestão de Contas"
      description="Contas de anúncio autorizadas via API oficial do TikTok for Business."
      action={
        connected ? (
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw data-icon="inline-start" />
            Atualizar
          </Button>
        ) : undefined
      }
    />
  )

  if (!statusLoading && !connected) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <ConnectTikTokBanner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Contas autorizadas", value: advertisers.length },
          { label: "Contas ativas", value: activeCount },
          {
            label: "Moedas",
            value: new Set(advertisers.map((a) => a.currency)).size || "—",
          },
          {
            label: "Saldo total",
            value: advertisers.length
              ? formatMoney(
                  advertisers.reduce((s, a) => s + (a.balance ?? 0), 0),
                  advertisers[0]?.currency ?? "USD",
                )
              : "—",
          },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-xl font-semibold tabular-nums">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nome ou ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {filtered.length} conta(s)
          </span>
        </div>

        {error ? (
          <div className="p-6">
            <Empty>
              <EmptyHeader>
                <AlertCircle className="size-8 text-destructive" />
                <EmptyTitle>Não foi possível carregar as contas</EmptyTitle>
                <EmptyDescription>{error.message}</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" onClick={() => refresh()}>
                <RefreshCw data-icon="inline-start" />
                Tentar novamente
              </Button>
            </Empty>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : advertisers.length === 0 ? (
          <div className="p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nenhuma conta autorizada</EmptyTitle>
                <EmptyDescription>
                  Autorize contas de anúncio no portal do TikTok for Business para vê-las aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Nome da Conta</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fuso</TableHead>
                <TableHead className="pr-4 text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((account) => {
                const active = account.status === "STATUS_ENABLE"
                return (
                  <TableRow key={account.advertiser_id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {account.role || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {account.advertiser_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={active ? "secondary" : "outline"} className="gap-1.5">
                        <span
                          className={
                            active
                              ? "size-1.5 rounded-full bg-emerald-500"
                              : "size-1.5 rounded-full bg-muted-foreground"
                          }
                        />
                        {active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {account.timezone || "—"}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-medium tabular-nums">
                      {formatMoney(account.balance ?? 0, account.currency || "USD")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
