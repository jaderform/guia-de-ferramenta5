'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { PerformanceChart } from '@/components/performance-chart'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/tiktok-data'

const CAMPAIGN_REPORT = [
  { name: 'Black Friday — Escala Q4', spend: 45200, roas: 4.6, conv: 1820 },
  { name: 'Infoprodutos — Lançamento', spend: 21500, roas: 3.9, conv: 640 },
  { name: 'App Installs — Games', spend: 33750, roas: 2.8, conv: 4210 },
  { name: 'Skincare — Retargeting', spend: 9600, roas: 5.1, conv: 380 },
  { name: 'Leads — Imobiliária', spend: 1800, roas: 1.9, conv: 92 },
]

export function ReportsView() {
  const [period, setPeriod] = useState('7d')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Analise o desempenho consolidado das suas campanhas."
        action={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as string)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download data-icon="inline-start" />
              Exportar
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Cliques x Conversões</CardTitle>
          <CardDescription>Evolução no período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceChart />
        </CardContent>
      </Card>

      <Card className="py-0">
        <div className="border-b p-4">
          <h2 className="text-base font-medium">Desempenho por Campanha</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Campanha</TableHead>
              <TableHead className="text-right">Investimento</TableHead>
              <TableHead className="text-right">Conversões</TableHead>
              <TableHead className="pr-4 text-right">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CAMPAIGN_REPORT.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="pl-4 font-medium">{row.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.spend)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.conv.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Badge variant={row.roas >= 3 ? 'secondary' : 'outline'}>
                    {row.roas.toFixed(1)}x
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
