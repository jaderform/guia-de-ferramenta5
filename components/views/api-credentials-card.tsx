"use client"

import { KeyRound, RefreshCw, ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useAdminSettings, type SettingKey, type SettingStatus } from "@/hooks/use-admin-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type FieldDef = {
  key: SettingKey
  label: string
  envVar: string
  description?: string
}

const MARKETING_FIELDS: FieldDef[] = [
  {
    key: "tiktokAppId",
    label: "App ID (Marketing API)",
    envVar: "TIKTOK_APP_ID",
    description: "ID do app criado no TikTok for Business / Marketing API.",
  },
  {
    key: "tiktokAppSecret",
    label: "App Secret (Marketing API)",
    envVar: "TIKTOK_APP_SECRET",
    description: "Secret do app da Marketing API.",
  },
]

const CONTENT_FIELDS: FieldDef[] = [
  {
    key: "tiktokClientKey",
    label: "Client Key (Content Posting)",
    envVar: "TIKTOK_CLIENT_KEY",
    description: "Chave do app da TikTok Developers usada para postar conteúdo orgânico.",
  },
  {
    key: "tiktokClientSecret",
    label: "Client Secret (Content Posting)",
    envVar: "TIKTOK_CLIENT_SECRET",
    description: "Client secret do app de Content Posting.",
  },
]

const SHARED_FIELDS: FieldDef[] = [
  {
    key: "tiktokRedirectUri",
    label: "Redirect URI",
    envVar: "TIKTOK_REDIRECT_URI",
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
        Não configurada
      </Badge>
    )
  }
  return <Badge className="bg-emerald-500/15 text-emerald-600">Configurada</Badge>
}

export function ApiCredentialsCard() {
  const { settings, error, isLoading, refresh } = useAdminSettings()

  const allFields = [...MARKETING_FIELDS, ...CONTENT_FIELDS, ...SHARED_FIELDS]
  const configuredCount = settings.filter((s) => s.configured).length

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
              As chaves de integração são lidas das variáveis de ambiente do projeto. Adicione ou
              atualize os valores em Configurações do projeto → Environment Variables e faça um novo
              deploy para aplicá-las.
            </CardDescription>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => refresh()} aria-label="Atualizar status">
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
              : `${configuredCount} de ${allFields.length} variáveis configuradas`}
          </span>
        </div>

        <CredentialGroup title="Marketing API (Anúncios)" fields={MARKETING_FIELDS} settings={settings} />

        <Separator />

        <CredentialGroup title="Content Posting API (Orgânico)" fields={CONTENT_FIELDS} settings={settings} />

        <Separator />

        <CredentialGroup title="Configuração compartilhada" fields={SHARED_FIELDS} settings={settings} />
      </CardContent>
    </Card>
  )
}

function CredentialGroup({
  title,
  fields,
  settings,
}: {
  title: string
  fields: FieldDef[]
  settings: SettingStatus[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const status = statusFor(settings, field.key)
          return (
            <div key={field.key} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{field.label}</span>
                <SourceBadge status={status} />
              </div>

              <EnvVarChip name={field.envVar} />

              {status?.configured && status.preview ? (
                <p className="font-mono text-xs text-muted-foreground">Valor atual: {status.preview}</p>
              ) : null}

              {field.description ? (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EnvVarChip({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(name)
      setCopied(true)
      toast.success(`Copiado: ${name}`)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-fit items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Copiar nome da variável ${name}`}
    >
      {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
      {name}
    </button>
  )
}
