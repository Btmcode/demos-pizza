"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react"
import * as React from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        duration: 4000,
        unstyled: true,
        classNames: {
          toast: "!bg-white !rounded-xl !shadow-lg !border !border-ink/8 !p-0 !overflow-hidden !min-w-[300px] !max-w-[400px]",
          title: "!font-semibold !text-ink !text-sm",
          description: "!text-ink/60 !text-xs",
          actionButton: "!bg-pink !text-white",
          cancelButton: "!bg-ink/5 !text-ink/60",
          closeButton: "!text-ink/30 hover:!text-ink",
        },
      }}
      {...props}
    />
  )
}

// Custom toast helper — modern tasarım (üst renk çizgisi + ikon)
export function modernToast(
  type: "success" | "error" | "info",
  title: string,
  description?: string
) {
  const config = {
    success: { color: "#16A34A", icon: CheckCircle2 },
    error: { color: "#FF2D8D", icon: AlertCircle },
    info: { color: "#FFC400", icon: Info },
  }
  const { color, icon: Icon } = config[type]

  toast.custom(
    () => (
      <div
        className="bg-white rounded-xl shadow-lg overflow-hidden min-w-[300px] max-w-[400px] relative"
        role="alert"
        aria-live="assertive"
      >
        {/* Üst renk çizgisi */}
        <div className="h-1" style={{ backgroundColor: color }} />

        {/* İçerik */}
        <div className="flex items-start gap-3 p-3.5">
          {/* İkon */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>

          {/* Metin */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
            {description && (
              <div className="text-ink/55 text-xs mt-0.5 leading-snug">{description}</div>
            )}
          </div>

          {/* Kapat */}
          <button
            onClick={() => toast.dismiss()}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-ink/25 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="Bildirimi kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Geri sayım çizgisi */}
        <div className="h-0.5 bg-ink/5 relative overflow-hidden">
          <div
            className="absolute inset-0 origin-left"
            style={{
              backgroundColor: color,
              animation: "toast-countdown 4s linear forwards",
            }}
          />
        </div>

        <style>{`
          @keyframes toast-countdown {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
        `}</style>
      </div>
    ),
    { duration: 4000 }
  )
}

export { Toaster }
