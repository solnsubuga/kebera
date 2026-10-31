// Mirrors app/schemas/auth.py in the backend.
export const ROLES = ['partner', 'manager', 'staff'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = { partner: 'Partner', manager: 'Manager', staff: 'Staff' }
export const ROLE_HINT: Record<Role, string> = {
  partner: 'Everything, including signing engagements and managing people',
  manager: 'Opens engagements and moves them between phases',
  staff: 'Sees the firm’s engagements',
}

export type Permission = 'engagements.read' | 'engagements.write' | 'engagements.sign' | 'members.manage' | 'audit.read'

export type FirmRef = { id: string; name: string; role: Role }

export type Me = {
  user: { id: string; email: string; name: string }
  firm: FirmRef | null
  firms: FirmRef[]
  permissions: Permission[]
  password_step: 'set' | 'enter' | null
}

export type AuthOptions = { signup: boolean; link_minutes: number }
