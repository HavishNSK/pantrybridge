import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Holds the chosen photo and its object URL. The previous URL is revoked when the photo
 * is replaced or removed, and the current one when the component unmounts.
 */
export function usePhoto(): [{ file: File; url: string } | null, (file: File | null) => void] {
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null)
  const current = useRef<string | null>(null)

  const set = useCallback((file: File | null) => {
    if (current.current) URL.revokeObjectURL(current.current)
    const url = file ? URL.createObjectURL(file) : null
    current.current = url
    setPhoto(file && url ? { file, url } : null)
  }, [])

  useEffect(
    () => () => {
      if (current.current) URL.revokeObjectURL(current.current)
      current.current = null
    },
    [],
  )

  return [photo, set]
}
