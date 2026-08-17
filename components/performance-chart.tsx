'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { PERFORMANCE_DATA } from '@/lib/tiktok-data'

const chartConfig = {
  cliques: {
    label: 'Cliques',
    color: 'var(--chart-1)',
  },
  conversoes: {
    label: 'Conversões',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

export function PerformanceChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={PERFORMANCE_DATA} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="fillCliques" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cliques)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-cliques)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillConversoes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-conversoes)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-conversoes)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          tickFormatter={(v: number) => `${v / 1000}k`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="cliques"
          type="monotone"
          fill="url(#fillCliques)"
          stroke="var(--color-cliques)"
          strokeWidth={2}
        />
        <Area
          dataKey="conversoes"
          type="monotone"
          fill="url(#fillConversoes)"
          stroke="var(--color-conversoes)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
