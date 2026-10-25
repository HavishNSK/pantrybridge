import { demoScanResults } from '../data/demoPantry'
import type { PantryItem } from '../types'

export interface ScanResult {
  items: PantryItem[]
  /** true when results come from sample data rather than an image model */
  demo: boolean
}

/**
 * A ScanProvider turns a photo into candidate pantry items. A real provider must run
 * server-side so no API key reaches the browser. None is configured in this build.
 */
export interface ScanProvider {
  name: string
  scan(file: File): Promise<ScanResult>
}

export const DemoScanProvider: ScanProvider = {
  name: 'Demo mode',
  async scan() {
    await new Promise((r) => setTimeout(r, 1100))
    return { items: demoScanResults(), demo: true }
  },
}

export const scanProvider: ScanProvider = DemoScanProvider

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
