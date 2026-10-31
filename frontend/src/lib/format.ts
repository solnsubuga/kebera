const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** "2026-06-30" -> "30 Jun 2026". Dates from the API are calendar dates, so read them as UTC. */
export function formatDate(iso: string) {
  return dateFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
}

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** A moment, in the browser's time zone: "31 Oct 2026, 14:05". */
export function formatDateTime(iso: string) {
  return dateTimeFmt.format(new Date(iso))
}
