'use client'

import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Rocket, TrendingUp, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Brand } from '@/components/brand'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

const HIGHLIGHTS = [
  {
    icon: Rocket,
    title: 'Disparo em massa',
    description: 'Publique uma campanha em dezenas de contas em segundos.',
  },
  {
    icon: Zap,
    title: 'Publicação orgânica em lote',
    description: 'Suba vídeos para várias contas de uma só vez.',
  },
  {
    icon: TrendingUp,
    title: 'Relatórios de performance',
    description: 'Acompanhe ROAS, conversões e gastos em tempo real.',
  },
]

export function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Login efetuado com sucesso')
        onAuthenticated()
      } else {
        setErrorMsg(data.error ?? 'Não foi possível entrar')
      }
    } catch {
      setErrorMsg('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 40%)',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Rocket className="size-4" />
          </div>
          <span className="text-sm font-semibold">Guia de Ferramenta</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
              Automação avançada para escalar no TikTok Ads.
            </h1>
            <p className="max-w-md text-sm text-primary-foreground/80 text-pretty">
              Gerencie Business Centers, dispare campanhas e publique conteúdo
              orgânico em escala — tudo em uma plataforma.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-sm text-primary-foreground/75">
                      {item.description}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-primary-foreground/70">
          <ShieldCheck className="size-3.5" />
          Conexão segura via API oficial do TikTok for Business.
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <Brand />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">
              Entre com as credenciais fornecidas pelo administrador.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível entrar</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </FieldGroup>
          </form>

          <p className="text-center text-xs text-muted-foreground text-pretty">
            Não possui acesso? Solicite uma conta ao administrador da plataforma.
          </p>
        </div>
      </div>
    </div>
  )
}
