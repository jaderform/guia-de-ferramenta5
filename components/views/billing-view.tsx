'use client'

import { Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PLANS, formatCurrency } from '@/lib/tiktok-data'
import { cn } from '@/lib/utils'

const CURRENT_PLAN = 'pro'

export function BillingView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Minha Assinatura"
        description="Gerencie seu plano e faça upgrade para escalar mais contas."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Plano atual: Pro</CardTitle>
            <CardDescription>
              Renova em 12 de setembro de 2026 · {formatCurrency(497)}/mês
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            Ativo
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contas utilizadas</span>
              <span className="font-medium tabular-nums">72 / 100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: '72%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === CURRENT_PLAN
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.featured && 'ring-2 ring-primary',
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-end gap-1 pt-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    /mês
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-pretty">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={
                    isCurrent ? 'outline' : plan.featured ? 'default' : 'secondary'
                  }
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() =>
                    toast.success(`Plano ${plan.name} selecionado`, {
                      description: 'Você será redirecionado para o checkout.',
                    })
                  }
                >
                  {isCurrent ? 'Plano atual' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
