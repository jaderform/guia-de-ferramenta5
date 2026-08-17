'use client'

import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Rocket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { PerformanceChart } from '@/components/performance-chart'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

type Kpi = {
  label: string
  value: string
  delta: string
  positive: boolean
  icon: LucideIcon
}

const KPIS: Kpi[] = [
  {
    label: 'Total Gasto (Mês)',
    value: 'R$ 284.500',
    delta: '+12,4%',
    positive: true,
    icon: DollarSign,
  },
  {
    label: 'Contas Ativas',
    value: '72',
    delta: '+8 contas',
    positive: true,
    icon: Users,
  },
  {
    label: 'Campanhas Rodando',
    value: '146',
    delta: '+23',
    positive: true,
    icon: Rocket,
  },
  {
    label: 'ROAS Médio',
    value: '3,8x',
    delta: '-0,2x',
    positive: false,
    icon: TrendingUp,
  },
]

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho das suas contas e campanhas."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          const DeltaIcon = kpi.positive ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={kpi.label}>
              <CardHeader>
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {kpi.value}
                </CardTitle>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="secondary"
                  className="gap-1 font-medium"
                >
                  <DeltaIcon
                    className={
                      kpi.positive ? 'text-emerald-500' : 'text-destructive'
                    }
                  />
                  {kpi.delta}
                </Badge>
                <span className="ml-2 text-xs text-muted-foreground">
                  vs. mês anterior
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Desempenho — Últimos 7 dias</CardTitle>
            <CardDescription>
              Comparativo de cliques e conversões no período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Top Contas por Gasto</CardTitle>
            <CardDescription>Ranking do mês atual.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-1">
            {[
              { name: 'Black Friday Cluster', spend: 'R$ 45.200', pct: 100 },
              { name: 'App Install Games', spend: 'R$ 33.750', pct: 74 },
              { name: 'Escala Infoprodutos', spend: 'R$ 21.500', pct: 47 },
              { name: 'GF Performance 01', spend: 'R$ 12.400', pct: 27 },
            ].map((row) => (
              <div key={row.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.spend}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
