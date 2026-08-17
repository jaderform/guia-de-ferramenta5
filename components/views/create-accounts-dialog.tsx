'use client'

import { useState } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUSINESS_CENTERS, PROFILES } from '@/lib/tiktok-data'

export function CreateAccountsDialog({
  onCreate,
}: {
  onCreate: (input: { quantity: number; bcId: string; profile: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('10')
  const [bcId, setBcId] = useState(BUSINESS_CENTERS[0].id)
  const [profile, setProfile] = useState(PROFILES[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = Math.max(1, Math.min(200, Number(quantity) || 0))
    onCreate({ quantity: qty, bcId, profile })
    setOpen(false)
    setQuantity('10')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <Layers data-icon="inline-start" />
        Criar Contas em Massa
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <DialogTitle>Criar contas de anúncio em massa</DialogTitle>
          <DialogDescription>
            Defina quantas contas deseja gerar e vincule ao Business Center e ao
            perfil desejado.
          </DialogDescription>
        </DialogHeader>

        <form id="create-accounts-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="qty">Quantidade de contas</FieldLabel>
              <Input
                id="qty"
                type="number"
                min={1}
                max={200}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Business Center</FieldLabel>
              <Select value={bcId} onValueChange={(v) => setBcId(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {BUSINESS_CENTERS.map((bc) => (
                      <SelectItem key={bc.id} value={bc.id}>
                        {bc.name} · {bc.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Perfil a vincular</FieldLabel>
              <Select
                value={profile}
                onValueChange={(v) => setProfile(v as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROFILES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button type="submit" form="create-accounts-form">
            Criar contas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
