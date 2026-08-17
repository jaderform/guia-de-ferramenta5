'use client'

import React from 'react'
import useSWR from 'swr'
import { AlertCircle, CreditCard, RefreshCw, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdvertisers, useTikTokStatus } from '@/hooks/use-tiktok'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  const json = await response.json()
  if (!response.ok) throw new Error(json.error || 'Falha ao consultar o TikTok')
  return json
}

export function TikTokFinancePanel() {
  const { connected } = useTikTokStatus()
  const { advertisers, isLoading: advertisersLoading } = useAdvertisers(connected)
  const [selected, setSelected] = React.useState('')
  const advertiserId = selected || advertisers[0]?.advertiser_id || ''
  const { data, error, isLoading, mutate } = useSWR(
    advertiserId ? `/api/tiktok/finance?advertiser_id=${advertiserId}` : null,
    fetcher,
  )

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2"><Wallet className="size-4" /> Financeiro TikTok</CardTitle>
          <CardDescription>Saldo, transações, custos, alterações de orçamento e faturas da conta.</CardDescription>
        </div>
        <Badge variant={connected ? 'secondary' : 'outline'}>{connected ? 'Conectado' : 'Desconectado'}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!connected ? <p className="text-sm text-muted-foreground">Conecte o TikTok para consultar o financeiro.</p> : (
          <>
            <div className="flex items-center gap-2">
              <Select value={advertiserId} onValueChange={(value) => setSelected(value as string)} disabled={advertisersLoading}>
                <SelectTrigger className="max-w-sm"><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                <SelectContent>{advertisers.map((account) => <SelectItem key={account.advertiser_id} value={account.advertiser_id}>{account.name} · {account.advertiser_id}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading} aria-label="Atualizar financeiro"><RefreshCw className={isLoading ? 'size-4 animate-spin' : 'size-4'} /></Button>
            </div>
            {error ? <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="size-4" />{error.message}</div> : data ? (
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Saldo disponível" value={`${data.currency || ''} ${Number(data.balance || 0).toFixed(2)}`} />
                <Metric label="Transações" value={String(data.transactions?.length || 0)} />
                <Metric label="Custos" value={String(data.costs?.length || 0)} />
                <Metric label="Faturas" value={String(data.invoices?.length || 0)} />
              </div>
            ) : <p className="text-sm text-muted-foreground">{isLoading ? 'Consultando dados...' : 'Nenhuma conta disponível.'}</p>}
            <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground"><CreditCard className="size-4 shrink-0" /> Cartões e adição de saldo dependem do fluxo de pagamento habilitado pelo TikTok para cada Business Center; não armazenamos dados de cartão na aplicação.</div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold tabular-nums">{value}</p></div>
}
