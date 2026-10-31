const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** "2026-06-30" -> "30 Jun 2026". Dates from the API are calendar dates, so read them as UTC. */
export function formatDate(iso: string) {
  return dateFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
}
