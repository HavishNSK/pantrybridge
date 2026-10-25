import { Undo2 } from 'lucide-react'
import type { Ref } from 'react'

/** Bottom toast with an Undo action, sitting where the shared Toaster does. */
export function UndoToast({ message, onUndo, onDismiss, undoRef, rootRef }: { message: string | null; onUndo: () => void; onDismiss: () => void; undoRef?: Ref<HTMLButtonElement>; rootRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={rootRef} role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-6">
      {message && (
        <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg bg-ink py-2 pl-4 pr-2 text-sm font-medium text-cream shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] motion-safe:animate-[rise_260ms_var(--ease-out-expo)] on-dark">
          <span className="min-w-0 truncate">{message}</span>
          <button ref={undoRef} type="button" onClick={onUndo} className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 font-bold text-leaf hover:bg-white/10">
            <Undo2 size={16} aria-hidden="true" />
            Undo
          </button>
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className="grid size-10 place-items-center rounded-md text-cream/70 hover:bg-white/10 hover:text-cream">
            <span aria-hidden="true" className="text-lg leading-none">&times;</span>
          </button>
        </div>
      )}
    </div>
  )
}
