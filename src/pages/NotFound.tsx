import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Section'

export function NotFound() {
  return (
    <EmptyState title="That page isn't on the shelf" action={<ButtonLink to="/">Back to overview</ButtonLink>}>
      The link may be old. Everything else is right where you left it.
    </EmptyState>
  )
}
