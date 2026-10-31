import { UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_HINT, ROLE_LABEL, ROLES, type Role } from '@/features/auth/types'
import { ApiError } from '@/lib/api-client'

import { useAddMember } from '../api'

export function AddMemberDialog({ firmName }: { firmName: string }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>('staff')
  const add = useAddMember()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const m = await add.mutateAsync({
        email: String(form.get('email')).trim(),
        name: String(form.get('name')).trim() || undefined,
        role,
      })
      setOpen(false)
      setRole('staff')
      toast.success(`Invited ${m.email}`, { description: 'They get an email with a link to sign in.' })
    } catch (err) {
      toast.error(err instanceof ApiError && !Array.isArray(err.detail) ? err.message : 'Check the email address')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Add person
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add someone to {firmName}</DialogTitle>
            <DialogDescription>They get an email invitation and sign in with a link.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="member-email">Email</Label>
            <Input id="member-email" name="email" type="email" required maxLength={254} autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="member-name">Name</Label>
            <Input id="member-name" name="name" maxLength={120} autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="member-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="member-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">{ROLE_HINT[role]}.</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending ? 'Inviting…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
