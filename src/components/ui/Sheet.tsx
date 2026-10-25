import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Accessible drawer built on <dialog>: native focus trap, Esc to close, inert page behind.
 * Slides from the right on wide screens and up from the bottom on phones.
 */
export function Sheet({ open, onClose, title, children, footer, width = 'sm:max-w-md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; width?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      aria-label={title}
      className={`fixed m-0 p-0 bg-transparent backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:backdrop:animate-[fade-in_200ms_ease-out]
        inset-x-0 bottom-0 top-auto w-full max-w-none max-h-[88dvh]
        sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:h-dvh sm:max-h-none ${width} sm:w-full`}
    >
      <div className="flex h-full max-h-[88dvh] sm:max-h-none flex-col bg-paper rounded-t-2xl sm:rounded-none shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] motion-safe:animate-[sheet-in_300ms_var(--ease-drawer)] sm:motion-safe:animate-[drawer-in_260ms_var(--ease-drawer)]">
        <header className="flex items-center justify-between gap-4 border-b border-rule px-5 py-4">
          <h2 className="display text-2xl text-forest">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-cream hover:text-forest">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-rule px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>}
      </div>
    </dialog>
  )
}
