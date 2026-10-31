/** The `next` path to go to after signing in: only paths inside the app, never another site. */
export function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : undefined
}
