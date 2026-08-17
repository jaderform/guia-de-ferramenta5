"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
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
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DURATIONS = [
  { value: "30", label: "30 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
  { value: "180", label: "180 dias" },
  { value: "365", label: "1 ano" },
  { value: "0", label: "Sem expiração" },
]

export function CreateUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [duration, setDuration] = useState("30")
  const [loading, setLoading] = useState(false)

  function reset() {
    setName("")
    setEmail("")
    setPassword("")
    setDuration("30")
  }

  async function handleCreate() {
    if (!email || !password) {
      toast.error("Informe e-mail e senha")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          durationDays: Number(duration),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success("Usuário criado", { description: email })
        reset()
        setOpen(false)
        onCreated()
      } else {
        toast.error("Não foi possível criar", { description: data.error })
      }
    } catch {
      toast.error("Erro de rede ao criar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus data-icon="inline-start" />
            Novo usuário
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar acesso de usuário</DialogTitle>
          <DialogDescription>
            Defina as credenciais e por quanto tempo o usuário poderá usar a plataforma.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="u-name">Nome</FieldLabel>
            <Input
              id="u-name"
              placeholder="Nome do cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="u-email">E-mail</FieldLabel>
            <Input
              id="u-email"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="u-password">Senha</FieldLabel>
            <Input
              id="u-password"
              type="text"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldDescription>
              Compartilhe essa senha com o usuário. Ele poderá usá-la para entrar.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="u-duration">Validade do acesso</FieldLabel>
            <Select value={duration} onValueChange={(v) => setDuration(v ?? "30")}>
              <SelectTrigger id="u-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Criando..." : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
