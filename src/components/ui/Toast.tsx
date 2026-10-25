import { CheckCircle2, Info } from 'lucide-react'
import { create } from 'zustand'

interface ToastState {
  toasts: { id: number; text: string; tone: 'success' | 'info' }[]
  push: (text: string, tone?: 'success' | 'info') => void
}

let id = 0
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (text, tone = 'success') => {
    const t = { id: ++id, text, tone }
    set((s) => ({ toasts: [...s.toasts.slice(-2), t] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) })), 3200)
  },
}))

export const toast = (text: string, tone?: 'success' | 'info') => useToast.getState().push(text, tone)

export function Toaster() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] lg:bottom-6 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-cream shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] motion-safe:animate-[rise_260ms_var(--ease-out-expo)]">
          {t.tone === 'success' ? <CheckCircle2 size={17} className="text-leaf" /> : <Info size={17} className="text-leaf" />}
          {t.text}
        </div>
      ))}
    </div>
  )
}
