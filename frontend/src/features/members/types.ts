// Mirrors MemberOut and AuditEventOut in app/schemas/auth.py.
import type { Role } from '@/features/auth/types'

export type Member = {
  id: string
  user_id: string
  email: string
  name: string
  role: Role
  is_active: boolean
  confirmed: boolean
  has_password: boolean
  locked: boolean
  created_at: string
  last_login_at: string | null
  link_sent: boolean
}

export type MemberCreate = { email: string; name?: string; role: Role }
export type MemberPatch = { role?: Role; is_active?: boolean; send_link?: boolean; clear_password?: boolean }

export type AuditEvent = {
  id: number
  at: string
  actor_email: string | null
  action: string
  target: string | null
  detail: Record<string, string> | null
}
