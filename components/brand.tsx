import { Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Brand({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Rocket className="size-4" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">
            Guia de Ferramenta
          </span>
          <span className="text-[11px] text-muted-foreground">
            TikTok Ads Automation
          </span>
        </div>
      )}
    </div>
  )
}
