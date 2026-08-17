"use client"

import { useState } from "react"
import { KeyRound, RefreshCw, ShieldCheck, ShieldAlert, Save } from "lucide-react"
import { toast } from "sonner"
import { useAdminSettings, type SettingKey, type SettingStatus } from "@/hooks/use-admin-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type FieldDef = {
  key: SettingKey
  label: string
  placeholder: string
  secret?: boolean
  description?: string
}

const MARKETING_FIELDS: FieldDef[] = [
  {
    key: "tiktokAppId",
    label: "App ID (Marketing API)",
    placeholder: "Ex: 7xxxxxxxxxxxxxxxxx",
    description: "ID do app criado no TikTok for Business / Marketing API.",
  },
  {
    key: "tiktokAppSecret",
    label: "App Secret (Marketing API)",
    placeholder: "Cole o secret do app",
    secret: true,
  },
]

const CONTENT_FIELDS: FieldDef[] = [
  {
    key: "tiktokClientKey",
    label: "Client Key (Content Posting)",
    placeholder: "Ex: awxxxxxxxxxxxx",
    description: "Chave do app da TikTok Developers usada para postar conteúdo orgânico.",
  },
  {
    key: "tiktokClientSecret",
    label: "Client Secret (Content Posting)",
    placeholder: "Cole o client secret",
    secret: true,
  },
]

const SHARED_FIELDS: FieldDef[] = [
  {
    key: "tiktokRedirectUri",
    label: "Redirect URI",
    placeholder: "https://seudominio.com/api/tiktok/callback",
    description: "Deve ser idêntica à URL de callback cadastrada no painel do TikTok.",
  },
]

function statusFor(settings: SettingStatus[], key: SettingKey) {
  return settings.find((s) => s.key === key)
}

function SourceBadge({ status }: { status?: SettingStatus }) {
  if (!status || !status.configured) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Não configurado
      </Badge>
    )
  }
  if (status.source === "custom") {
    return <Badge className="bg-emerald-500/15 text-emerald-600">Salvo no painel</Badge>
  }
  return (
    <Badge variant="secondary" className="text-sky-600">
      Variável de ambiente
    </Badge>
  )
}

export function ApiCredentialsCard() {
  const { settings, error, isLoading, refresh } = useAdminSettings()
  const [values, setValues] = useState<Partial<Record<SettingKey, string>>>({})
  const [saving, setSaving] = useState(false)

  const allFields = [...MARKETING_FIELDS, ...CONTENT_FIELDS, ...SHARED_FIELDS]
  const configuredCount = settings.filter((s) => s.configured).length

  function setValue(key: SettingKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    const patch: Partial<Record<SettingKey, string>> = {}
    for (const field of allFields) {
      const v = values[field.key]
      if (typeof v === "string" && v.trim()) patch[field.key] = v.trim()
    }
    if (Object.keys(patch).length === 0) {
      toast.error("Preencha ao menos um campo para salvar")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success("Credenciais salvas")
        setValues({})
        refresh()
      } else {
        toast.error("Não foi possível salvar", { description: data.error })
      }
    } catch {
      toast.error("Erro de rede ao salvar credenciais")
    } finally {
      setSaving(false)
    }
  }

  async function handleClear(key: SettingKey, label: string) {
    if (!confirm(`Limpar a credencial "${label}"?`)) return
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: null }),
      })
      if (res.ok) {
        toast.success("Credencial removida")
        refresh()
      } else {
        toast.error("Não foi possível remover")
      }
    } catch {
      toast.error("Erro de rede")
    }
  }

  if (error) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>Credenciais das APIs do TikTok</CardTitle>
            <CardDescription>
              Configure as chaves de integração usadas por toda a plataforma. Os segredos ficam
              guardados no servidor e nunca são exibidos por completo.
            </CardDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refresh()}
          aria-label="Atualizar status"
        >
          <RefreshCw />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          {configuredCount === allFields.length ? (
            <ShieldCheck className="size-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="size-4 text-amber-600" />
          )}
          <span className="text-muted-foreground">
            {isLoading
              ? "Carregando status..."
              : `${configuredCount} de ${allFields.length} credenciais configuradas`}
          </span>
        </div>

        <CredentialGroup
          title="Marketing API (Anúncios)"
          fields={MARKETING_FIELDS}
          settings={settings}
          values={values}
          onChange={setValue}
          onClear={handleClear}
        />

        <Separator />

        <CredentialGroup
          title="Content Posting API (Orgânico)"
          fields={CONTENT_FIELDS}
          settings={settings}
          values={values}
          onChange={setValue}
          onClear={handleClear}
        />

        <Separator />

        <CredentialGroup
          title="Configuração compartilhada"
          fields={SHARED_FIELDS}
          settings={settings}
          values={values}
          onChange={setValue}
          onClear={handleClear}
        />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save data-icon="inline-start" />
            {saving ? "Salvando..." : "Salvar credenciais"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CredentialGroup({
  title,
  fields,
  settings,
  values,
  onChange,
  onClear,
}: {
  title: string
  fields: FieldDef[]
  settings: SettingStatus[]
  values: Partial<Record<SettingKey, string>>
  onChange: (key: SettingKey, value: string) => void
  onClear: (key: SettingKey, label: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const status = statusFor(settings, field.key)
          return (
            <Field key={field.key}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor={`cred-${field.key}`}>{field.label}</FieldLabel>
                <SourceBadge status={status} />
              </div>
              <Input
                id={`cred-${field.key}`}
                type={field.secret ? "password" : "text"}
                autoComplete="off"
                placeholder={
                  status?.configured && status.preview
                    ? `Atual: ${status.preview}`
                    : field.placeholder
                }
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              {field.description ? (
                <FieldDescription>{field.description}</FieldDescription>
              ) : null}
              {status?.source === "custom" ? (
                <button
                  type="button"
                  onClick={() => onClear(field.key, field.label)}
                  className="w-fit text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                >
                  Limpar valor salvo
                </button>
              ) : null}
            </Field>
          )
        })}
      </div>
    </div>
  )
}
