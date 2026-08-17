"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Link2,
  Loader2,
  Send,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { useContentStatus, type ContentAccount } from "@/hooks/use-tiktok"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type PublishResult = {
  openId: string
  displayName: string
  success: boolean
  publishId?: string
  error?: string
}

function ConnectContentButton({ label = "Conectar conta de conteúdo" }: { label?: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      disabled={loading}
      onClick={() => {
        setLoading(true)
        window.location.href = "/api/tiktok/content/auth"
      }}
    >
      {loading ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        <Link2 data-icon="inline-start" />
      )}
      {label}
    </Button>
  )
}

export function OrganicView() {
  const { connected, accounts, count, refresh } = useContentStatus()

  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [privacy, setPrivacy] = useState("SELF_ONLY")
  const [disableComment, setDisableComment] = useState(false)
  const [disableDuet, setDisableDuet] = useState(false)
  const [disableStitch, setDisableStitch] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [results, setResults] = useState<PublishResult[] | null>(null)

  function toggleAccount(openId: string) {
    setSelected((prev) =>
      prev.includes(openId) ? prev.filter((id) => id !== openId) : [...prev, openId],
    )
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === accounts.length ? [] : accounts.map((a) => a.openId)))
  }

  async function disconnect(openId: string) {
    await fetch("/api/tiktok/content/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openId }),
    })
    setSelected((prev) => prev.filter((id) => id !== openId))
    refresh()
    toast.success("Conta desconectada")
  }

  async function handlePublish() {
    if (selected.length === 0) {
      toast.error("Selecione ao menos uma conta")
      return
    }
    if (!title.trim() || !videoUrl.trim()) {
      toast.error("Preencha a legenda e a URL do vídeo")
      return
    }
    setPublishing(true)
    setResults(null)
    try {
      const res = await fetch("/api/tiktok/content/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openIds: selected,
          title,
          videoUrl,
          privacyLevel: privacy,
          disableComment,
          disableDuet,
          disableStitch,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Falha ao publicar", { description: data.error })
        return
      }
      setResults(data.results)
      toast.success(`Publicação enviada: ${data.succeeded}/${data.total} contas`, {
        description: data.failed > 0 ? `${data.failed} falharam` : "Todas com sucesso",
      })
    } catch {
      toast.error("Erro de rede ao publicar")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Posts Orgânicos"
        description="Publique o mesmo vídeo em várias contas de criador ao mesmo tempo, via API oficial de conteúdo do TikTok."
      />

      {!connected ? (
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex flex-col items-start gap-4 py-8 text-center sm:items-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Video className="size-6" />
            </div>
            <div className="flex flex-col gap-1 sm:items-center">
              <p className="text-lg font-semibold">Conecte suas contas de conteúdo</p>
              <p className="max-w-md text-sm text-muted-foreground text-pretty">
                Autorize cada conta de criador/Business para publicar vídeos orgânicos e ler
                insights. Você pode conectar quantas contas quiser — uma por autorização.
              </p>
            </div>
            <ConnectContentButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Coluna de contas conectadas */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="text-base">Contas conectadas</CardTitle>
                <CardDescription>{count} conta(s) autorizada(s)</CardDescription>
              </div>
              <ConnectContentButton label="Adicionar" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {accounts.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="self-start text-sm font-medium text-primary hover:underline"
                  >
                    {selected.length === accounts.length ? "Desmarcar todas" : "Selecionar todas"}
                  </button>
                  <Separator />
                </>
              )}
              {accounts.map((account: ContentAccount) => (
                <div
                  key={account.openId}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Checkbox
                    checked={selected.includes(account.openId)}
                    onCheckedChange={() => toggleAccount(account.openId)}
                    aria-label={`Selecionar ${account.displayName}`}
                  />
                  <Avatar className="size-9">
                    <AvatarImage src={account.avatarUrl || "/placeholder.svg"} alt="" />
                    <AvatarFallback>
                      {account.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{account.displayName}</span>
                    {account.username && (
                      <span className="truncate text-xs text-muted-foreground">
                        @{account.username}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnect(account.openId)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coluna do compositor */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Compositor de publicação</CardTitle>
              <CardDescription>
                {selected.length > 0
                  ? `${selected.length} conta(s) selecionada(s)`
                  : "Selecione as contas na coluna ao lado"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="video-url">URL do vídeo</FieldLabel>
                  <Input
                    id="video-url"
                    placeholder="https://seu-dominio.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <FieldDescription>
                    O TikTok baixa o vídeo diretamente dessa URL (PULL_FROM_URL). O domínio precisa
                    estar verificado no painel do app.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="caption">Legenda</FieldLabel>
                  <Textarea
                    id="caption"
                    rows={3}
                    placeholder="Escreva a legenda do post (use #hashtags e @mencoes)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="privacy">Privacidade</FieldLabel>
                  <Select value={privacy} onValueChange={(v) => setPrivacy(v ?? "SELF_ONLY")}>
                    <SelectTrigger id="privacy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC_TO_EVERYONE">Público</SelectItem>
                      <SelectItem value="MUTUAL_FOLLOW_FRIENDS">Amigos</SelectItem>
                      <SelectItem value="FOLLOWER_OF_CREATOR">Seguidores</SelectItem>
                      <SelectItem value="SELF_ONLY">Somente eu (privado)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Contas de apps em modo sandbox só permitem publicação privada.
                  </FieldDescription>
                </Field>

                <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="c-comment" className="font-normal">
                      Desativar comentários
                    </Label>
                    <Switch
                      id="c-comment"
                      checked={disableComment}
                      onCheckedChange={setDisableComment}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="c-duet" className="font-normal">
                      Desativar Duet
                    </Label>
                    <Switch id="c-duet" checked={disableDuet} onCheckedChange={setDisableDuet} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="c-stitch" className="font-normal">
                      Desativar Stitch
                    </Label>
                    <Switch
                      id="c-stitch"
                      checked={disableStitch}
                      onCheckedChange={setDisableStitch}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={publishing || selected.length === 0}
                >
                  {publishing ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Send data-icon="inline-start" />
                  )}
                  {publishing
                    ? "Publicando..."
                    : `Publicar em ${selected.length || 0} conta(s)`}
                </Button>
              </FieldGroup>

              {results && (
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span className="text-sm font-medium">Resultado da publicação</span>
                  </div>
                  {results.map((r) => (
                    <div
                      key={r.openId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="truncate font-medium">{r.displayName}</span>
                      {r.success ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Enviado
                        </Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive">
                          <XCircle className="size-3.5" />
                          <span className="max-w-[180px] truncate">{r.error}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
