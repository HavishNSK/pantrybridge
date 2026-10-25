import { Camera, ImageUp, RefreshCw, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { Button } from '../ui/Button'
import { ACCEPTED_TYPES } from '../../lib/vision'
import { fileSize } from './scanDraft'

const ACCEPT = [...ACCEPTED_TYPES, '.heic', '.heif'].join(',')

/** Drag-and-drop zone plus file and camera inputs, with a preview once a photo is chosen. */
export function PhotoDrop({ file, previewUrl, error, onFile, onRemove }: { file: File | null; previewUrl: string | null; error: string | null; onFile: (f: File) => void; onRemove: () => void }) {
  const uid = useId()
  const pickRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const errId = `${uid}-err`
  const [dragging, setDragging] = useState(false)
  const [previewFailed, setPreviewFailed] = useState<string | null>(null)

  const take = (list: FileList | null) => {
    const f = list?.[0]
    if (f) onFile(f)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    take(e.dataTransfer.files)
  }
  const dragProps = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    onDragEnter: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
    },
    onDrop,
  }

  const inputs = (
    <>
      <input
        ref={pickRef}
        type="file"
        accept={ACCEPT}
        hidden
        tabIndex={-1}
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        tabIndex={-1}
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
    </>
  )

  const errorMsg = error && (
    <p id={errId} role="alert" className="mt-3 rounded-lg bg-terracotta-wash px-3 py-2 text-[15px] font-medium text-terracotta-ink">
      {error}
    </p>
  )

  if (file && previewUrl) {
    const broken = previewFailed === previewUrl
    return (
      <div {...dragProps} className={`rounded-lg ${dragging ? 'ring-2 ring-forest ring-offset-2' : ''}`}>
        {inputs}
        <div className="grid place-items-center overflow-hidden rounded-lg bg-cream ring-1 ring-inset ring-rule">
          {broken ? (
            <p className="px-6 py-16 text-center text-ink-2">Your photo is ready, but this browser can't show a preview of this file type.</p>
          ) : (
            <img src={previewUrl} alt="Your pantry photo" onError={() => setPreviewFailed(previewUrl)} className="max-h-[420px] w-full object-contain" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="mr-auto min-w-0 truncate text-sm text-ink-2">
            <span className="font-semibold text-ink">{file.name}</span> <span className="num">· {fileSize(file.size)}</span>
          </p>
          <Button variant="secondary" size="sm" icon={<RefreshCw size={16} />} onClick={() => pickRef.current?.click()} aria-describedby={error ? errId : undefined}>
            Replace photo
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={onRemove}>Remove photo</Button>
        </div>
        {errorMsg}
      </div>
    )
  }

  return (
    <div>
      {inputs}
      <div
        {...dragProps}
        className={`flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? 'border-forest bg-leaf-wash' : 'border-rule-strong bg-cream hover:border-forest'
        }`}
      >
        <ImageUp size={40} strokeWidth={1.6} className="pointer-events-none text-leaf-ink" aria-hidden="true" />
        <p className="pointer-events-none display text-2xl text-forest">{dragging ? 'Drop your photo here' : 'Add a photo of your shelf'}</p>
        <p className="pointer-events-none max-w-sm text-[15px] text-ink-2">Drag a photo here, or choose one. JPG, PNG, WebP or HEIC, up to 10 MB.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button icon={<ImageUp size={18} />} onClick={() => pickRef.current?.click()} aria-describedby={error ? errId : undefined}>Choose a photo</Button>
          <Button variant="secondary" icon={<Camera size={18} />} onClick={() => camRef.current?.click()}>Take a photo</Button>
        </div>
      </div>
      {errorMsg}
    </div>
  )
}
