import { DAY_NAMES, DAYS } from '../../lib/planner'
import { round } from '../../lib/format'

/** Mon–Sun estimated protein per person, as plain CSS bars with a reference line. */
export function DailyProteinBars({ values, reference }: { values: (number | null)[]; reference: number }) {
  const max = Math.max(reference * 1.25, ...values.map((v) => v ?? 0))
  const refPct = (reference / max) * 100
  return (
    <figure>
      <div>
        <ul className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {values.map((v, i) => (
            <li key={DAYS[i]} className="flex flex-col items-center">
              <span className="num mb-1 text-xs font-semibold text-ink">{v == null ? '·' : `${round(v)} g`}</span>
              <div className="relative flex h-40 w-full items-end overflow-hidden rounded-md bg-cream ring-1 ring-inset ring-rule">
                <div aria-hidden="true" className="absolute inset-x-0 z-10 border-t-2 border-dashed border-ink/55" style={{ bottom: `${refPct}%` }} />
                {v != null && (
                  <div
                    className="w-full rounded-md bg-forest motion-safe:origin-bottom motion-safe:animate-[rise_500ms_var(--ease-out-expo)_both]"
                    style={{ height: `${Math.max(2, (v / max) * 100)}%`, animationDelay: `${i * 40}ms` }}
                  />
                )}
              </div>
              <span className="mt-1.5 text-xs font-semibold text-ink-2">
                <abbr title={DAY_NAMES[i]} className="no-underline">{DAYS[i]}</abbr>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 text-sm text-ink-2">
        Dashed line: general adult reference of about {reference} g/day. A dot means nothing is planned that day.
      </figcaption>
      <table className="sr-only">
        <caption>Estimated protein per person by day</caption>
        <tbody>
          {values.map((v, i) => (
            <tr key={DAYS[i]}>
              <th scope="row">{DAY_NAMES[i]}</th>
              <td>{v == null ? 'Nothing planned' : `${round(v)} grams`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
