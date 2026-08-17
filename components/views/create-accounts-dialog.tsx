"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, Layers, Loader2, Sparkles, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useBusinessCenters } from "@/hooks/use-tiktok"

type CreateResult = {
  name: string
  success: boolean
  advertiser_id?: string
  error?: string
}

const CURRENCIES = ["BRL", "USD", "EUR", "GBP", "MXN"]
const TIMEZONES = [
  "America/Sao_Paulo",
  "America/New_York",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Lisbon",
]
const AREAS = [
  { code: "BR", label: "Brasil" },
  { code: "US", label: "Estados Unidos" },
  { code: "MX", label: "México" },
  { code: "PT", label: "Portugal" },
  { code: "GB", label: "Reino Unido" },
]

export function CreateAccountsDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const { businessCenters, error: bcError, isLoading: bcLoading } = useBusinessCenters(open)

  const [quantity, setQuantity] = useState("5")
  const [namePrefix, setNamePrefix] = useState("Conta")
  const [bcId, setBcId] = useState("")
  const [currency, setCurrency] = useState("BRL")
  const [timezone, setTimezone] = useState("America/Sao_Paulo")
  const [registeredArea, setRegisteredArea] = useState("BR")
  const [licenseNo, setLicenseNo] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyCity, setCompanyCity] = useState("")
  const [companyState, setCompanyState] = useState("")
  const [companyZipCode, setCompanyZipCode] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<CreateResult[] | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const selectedBc = bcId || businessCenters[0]?.bc_id || ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setResults(null)
    const qty = Math.max(1, Math.min(50, Number(quantity) || 0))

    if (!selectedBc) {
      setFormError("Selecione um Business Center.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/tiktok/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bcId: selectedBc,
          quantity: qty,
          namePrefix,
          currency,
          timezone,
          registeredArea,
          licenseNo,
          companyName,
          companyEmail,
          companyPhone,
          companyAddress,
          companyCity,
          companyState,
          companyZipCode,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFormError(json.error || "Não foi possível criar as contas.")
        return
      }
      setResults(json.results as CreateResult[])
      if (json.created > 0) onCreated?.()
    } catch {
      setFormError("Falha de conexão ao criar as contas.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setResults(null)
      setFormError(null)
    }
  }

  const createdCount = results?.filter((r) => r.success).length ?? 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="lg" />}>
        <Layers data-icon="inline-start" />
        Criar Contas em Massa
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <DialogTitle>Criar contas de anúncio em massa</DialogTitle>
          <DialogDescription>
            Cria contas reais dentro do Business Center via API oficial do TikTok for Business.
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <strong className="font-semibold">{createdCount}</strong> de {results.length} conta(s)
              criada(s) com sucesso.
            </div>
            <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.name}
                  className="flex items-start gap-2 rounded-md border p-2 text-sm"
                >
                  {r.success ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.success ? `ID: ${r.advertiser_id}` : r.error}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Fechar</DialogClose>
              <Button onClick={() => setResults(null)}>Criar mais</Button>
            </DialogFooter>
          </div>
        ) : bcError ? (
          <Empty>
            <EmptyHeader>
              <AlertCircle className="size-8 text-destructive" />
              <EmptyTitle>Sem acesso a Business Centers</EmptyTitle>
              <EmptyDescription>
                Não foi possível listar seus Business Centers. A conta autorizada precisa ter
                acesso a um BC com permissão para criar contas. ({bcError.message})
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <form id="create-accounts-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="qty">Quantidade</FieldLabel>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="prefix">Prefixo do nome</FieldLabel>
                  <Input
                    id="prefix"
                    value={namePrefix}
                    onChange={(e) => setNamePrefix(e.target.value)}
                    placeholder="Conta"
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Business Center</FieldLabel>
                <Select
                  value={selectedBc}
                  onValueChange={(v) => setBcId(v as string)}
                  disabled={bcLoading || businessCenters.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={bcLoading ? "Carregando..." : "Selecione um BC"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {businessCenters.map((bc) => (
                        <SelectItem key={bc.bc_id} value={bc.bc_id}>
                          {bc.name} · {bc.bc_id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {!bcLoading && businessCenters.length === 0 && (
                  <FieldDescription>
                    Nenhum Business Center disponível para a conta conectada.
                  </FieldDescription>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Moeda</FieldLabel>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Fuso horário</FieldLabel>
                  <Select value={timezone} onValueChange={(v) => setTimezone(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>País de registro</FieldLabel>
                  <Select
                    value={registeredArea}
                    onValueChange={(v) => setRegisteredArea(v as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {AREAS.map((a) => (
                          <SelectItem key={a.code} value={a.code}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="license">CNPJ / Licença (opcional)</FieldLabel>
                  <Input
                    id="license"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </Field>
              </div>

              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium">Dados da empresa</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field><FieldLabel htmlFor="company-name">Nome da empresa</FieldLabel><Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required /></Field>
                  <Field><FieldLabel htmlFor="company-email">E-mail</FieldLabel><Input id="company-email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required /></Field>
                  <Field><FieldLabel htmlFor="company-phone">Telefone</FieldLabel><Input id="company-phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} required /></Field>
                  <Field><FieldLabel htmlFor="company-zip">CEP</FieldLabel><Input id="company-zip" value={companyZipCode} onChange={(e) => setCompanyZipCode(e.target.value)} required /></Field>
                  <Field className="col-span-2"><FieldLabel htmlFor="company-address">Endereço</FieldLabel><Input id="company-address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} required /></Field>
                  <Field><FieldLabel htmlFor="company-city">Cidade</FieldLabel><Input id="company-city" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} required /></Field>
                  <Field><FieldLabel htmlFor="company-state">Estado</FieldLabel><Input id="company-state" value={companyState} onChange={(e) => setCompanyState(e.target.value)} required /></Field>
                </div>
                <FieldDescription className="mt-2">Esses dados são exigidos pelo TikTok para criar contas dentro do Business Center.</FieldDescription>
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {formError}
                </div>
              )}
            </FieldGroup>
          </form>
        )}

        {!results && !bcError && (
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" form="create-accounts-form" disabled={submitting}>
              {submitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {submitting ? "Criando..." : "Criar contas"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
