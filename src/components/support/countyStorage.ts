/** The last county chosen on Find Food Support. Stored only in this browser. */
export const SUPPORT_COUNTY_KEY = 'pantrybridge:support-county'

export function readSupportCounty(): string | null {
  try {
    return localStorage.getItem(SUPPORT_COUNTY_KEY)
  } catch {
    return null
  }
}

export function writeSupportCounty(county: string | null): void {
  try {
    if (county) localStorage.setItem(SUPPORT_COUNTY_KEY, county)
    else localStorage.removeItem(SUPPORT_COUNTY_KEY)
  } catch {
    // Storage blocked (private mode): the choice just won't be remembered.
  }
}
