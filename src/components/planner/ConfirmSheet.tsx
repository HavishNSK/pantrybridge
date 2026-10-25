import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'

export function ConfirmSheet({ open, title, children, confirmLabel, onConfirm, onClose }: { open: boolean; title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Keep my week</Button>
          <Button onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </div>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink-2">{children}</div>
    </Sheet>
  )
}
