import { BookOpen, Folder, Inbox, ListChecks, ShieldCheck } from 'lucide-react'

/** The rail's main links. The palette offers the same list under "Go to". */
export const NAV = [
  { to: '/', label: 'Engagements', icon: Folder, end: true, match: /^\/($|engagements)/ },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/reviews', label: 'My reviews', icon: ListChecks },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/trust', label: 'Trust', icon: ShieldCheck },
] as const
