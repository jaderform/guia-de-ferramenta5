"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MousePointerClick,
  Rocket,
  ShoppingCart,
  Target,
  UploadCloud,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { ConnectTikTokBanner } from "@/components/connect-tiktok"
import { useAdvertisers, useTikTokStatus } from "@/hooks/use-tiktok"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { INTERESTS } from "@/lib/tiktok-data"
import { cn } from "@/lib/utils"

const STEPS = [
  { title: "Configuração", description: "Nome, orçamento e objetivo" },
  { title: "Criativo", description: "Mídia, texto e segmentação" },
  { title: "Distribuição", description: "Selecionar contas" },
]

const OBJECTIVES = [
  { value: "CONVERSIONS", label: "Conversão", icon: Target },
  { value: "TRAFFIC", label: "Tráfego", icon: MousePointerClick },
  { value: "PRODUCT_SALES", label: "Vendas no Catálogo", icon: ShoppingCart },
]

const AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
const GENDERS = ["Todos", "Feminino", "Masculino"]

export function CampaignLauncherView() {
  const { connected, isLoading: statusLoading } = useTikTokStatus()
  const { advertisers, isLoading: accountsLoading } = useAdvertisers(connected)

  const [step, setStep] = useState(0)
  const [publishing, setPublishing] = useState(false)

  const [name, setName] = useState("")
  const [budget, setBudget] = useState("150")
  const [objective, setObjective] = useState<string[]>(["CONVERSIONS"])

  const [fileName, setFileName] = useState<string | null>(null)
  const [adText, setAdText] = useState("")
  const [gender, setGender] = useState<string[]>(["Todos"])
  const [ages, setAges] = useState<string[]>(["18-24", "25-34"])
  const [interests, setInterests] = useState<string[]>(["Moda e Beleza"])

  const [selected, setSelected] = useState<string[]>([])

  const activeAccounts = useMemo(
    () => advertisers.filter((a) => a.status === "STATUS_ENABLE"),
    [advertisers],
  )
  const allSelected = activeAccounts.length > 0 && selected.length === activeAccounts.length

  function toggleAccount(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleAll() {
    setSelected(allSelected ? [] : activeAccounts.map((a) => a.advertiser_id))
  }

  async function handlePublish() {
    if (!name.trim()) {
      toast.error("Informe o nome da campanha antes de publicar.")
      setStep(0)
      return
    }
    if (selected.length === 0) {
      toast.error("Selecione ao menos uma conta de anúncio.")
      return
    }
    const budgetValue = Number(budget)
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      toast.error("Informe um orçamento diário válido.")
      setStep(0)
      return
    }

    setPublishing(true)
    try {
      const res = await fetch("/api/tiktok/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_ids: selected,
          campaign_name: name.trim(),
          objective_type: objective[0],
          budget_mode: "BUDGET_MODE_DAY",
          budget: budgetValue,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Falha ao publicar campanhas")
        return
      }
      if (data.failed > 0) {
        toast.warning(`${data.succeeded} de ${data.total} campanhas criadas`, {
          description: `${data.failed} conta(s) falharam. Verifique permissões e saldo.`,
        })
      } else {
        toast.success("Campanhas criadas com sucesso", {
          description: `"${name}" publicada em ${data.succeeded} conta(s).`,
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro de rede ao publicar")
    } finally {
      setPublishing(false)
    }
  }

  if (!statusLoading && !connected) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Lançador de Campanhas"
          description="Configure uma campanha e publique simultaneamente em várias contas."
        />
        <ConnectTikTokBanner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <PageHeader
        title="Lançador de Campanhas"
        description="Configure uma campanha e publique simultaneamente em dezenas de contas."
      />

      {/* Stepper */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={s.title} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(i)}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    current && "border-primary text-primary",
                    !done && !current && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !current && !done && "text-muted-foreground",
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className="mx-1 hidden h-px flex-1 bg-border sm:block" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Configuração da Campanha</CardTitle>
            <CardDescription>Defina as informações básicas de veiculação.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="camp-name">Nome da Campanha</FieldLabel>
                <Input
                  id="camp-name"
                  placeholder="Ex: Black Friday — Escala Q4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="camp-budget">Orçamento Diário</FieldLabel>
                <InputGroup className="max-w-xs">
                  <InputGroupAddon>
                    <InputGroupText>R$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="camp-budget"
                    type="number"
                    min={10}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>/ dia por conta</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel>Objetivo</FieldLabel>
                <ToggleGroup
                  value={objective}
                  onValueChange={(v) => v.length && setObjective(v)}
                  variant="outline"
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  {OBJECTIVES.map((o) => {
                    const Icon = o.icon
                    return (
                      <ToggleGroupItem
                        key={o.value}
                        value={o.value}
                        className="h-auto flex-col items-start gap-1 p-3"
                      >
                        <Icon className="size-4" />
                        <span className="text-sm font-medium">{o.label}</span>
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Criativo</CardTitle>
              <CardDescription>Envie a mídia e escreva o texto do anúncio.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="media">Mídia (vídeo ou imagem)</FieldLabel>
                  <label
                    htmlFor="media"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="size-5" />
                    </div>
                    <span className="text-sm font-medium">
                      {fileName ?? "Arraste ou clique para enviar"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      MP4, MOV, JPG ou PNG · até 500MB
                    </span>
                    <input
                      id="media"
                      type="file"
                      accept="video/*,image/*"
                      className="sr-only"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    />
                  </label>
                </Field>

                <Field>
                  <FieldLabel htmlFor="ad-text">Texto do anúncio</FieldLabel>
                  <Textarea
                    id="ad-text"
                    rows={3}
                    placeholder="Escreva a copy que aparecerá no anúncio..."
                    value={adText}
                    onChange={(e) => setAdText(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Segmentação de Público</CardTitle>
              <CardDescription>Idade, gênero e interesses.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Gênero</FieldLabel>
                  <ToggleGroup
                    value={gender}
                    onValueChange={(v) => v.length && setGender(v)}
                    variant="outline"
                  >
                    {GENDERS.map((g) => (
                      <ToggleGroupItem key={g} value={g}>
                        {g}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>

                <Field>
                  <FieldLabel>Faixa etária</FieldLabel>
                  <ToggleGroup
                    multiple
                    value={ages}
                    onValueChange={setAges}
                    variant="outline"
                    className="flex-wrap"
                  >
                    {AGE_RANGES.map((a) => (
                      <ToggleGroupItem key={a} value={a}>
                        {a}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>

                <Field>
                  <FieldLabel>Interesses</FieldLabel>
                  <ToggleGroup
                    multiple
                    value={interests}
                    onValueChange={setInterests}
                    variant="outline"
                    className="flex-wrap"
                  >
                    {INTERESTS.map((it) => (
                      <ToggleGroupItem key={it} value={it}>
                        {it}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <Card className="py-0">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-2.5">
              <Checkbox id="select-all" checked={allSelected} onCheckedChange={toggleAll} />
              <FieldLabel htmlFor="select-all" className="cursor-pointer">
                Selecionar todas as contas ativas
              </FieldLabel>
            </div>
            <Badge variant="secondary">{selected.length} selecionada(s)</Badge>
          </div>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {accountsLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : activeAccounts.length === 0 ? (
              <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                Nenhuma conta ativa autorizada. Autorize contas no portal do TikTok for Business.
              </p>
            ) : (
              activeAccounts.map((account) => {
                const checked = selected.includes(account.advertiser_id)
                return (
                  <label
                    key={account.advertiser_id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      checked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/50",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleAccount(account.advertiser_id)}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{account.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {account.advertiser_id} · {account.currency}
                      </span>
                    </div>
                    <Users className="size-4 shrink-0 text-muted-foreground" />
                  </label>
                )
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-md md:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium">{name.trim() || "Nova campanha"}</span>
            <span className="text-xs text-muted-foreground">
              R$ {Number(budget) || 0}/dia · {selected.length} conta(s)
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || publishing}
            >
              <ArrowLeft data-icon="inline-start" />
              Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={() => setStep((s) => s + 1)}>
                Próximo
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button size="lg" onClick={handlePublish} disabled={publishing}>
                {publishing ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Rocket data-icon="inline-start" />
                )}
                Publicar em Massa nas Contas Selecionadas
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
