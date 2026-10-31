import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useMe, useSignOut, useSwitchFirm } from '../api'
import { ROLE_LABEL } from '../types'

/** The firm you're working in (a switcher when you have several), who you are, and sign out. */
export function FirmSwitcher() {
  const { data: me } = useMe()
  const switchFirm = useSwitchFirm()
  const navigate = useNavigate()
  if (!me?.firm) return null

  if (me.firms.length < 2) {
    return (
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">Firm</p>
        <p className="truncate text-sm font-medium" title={me.firm.name}>
          {me.firm.name}
        </p>
      </div>
    )
  }
  return (
    <div className="grid gap-1">
      <label htmlFor="firm-switcher" className="text-muted-foreground text-xs">
        Firm
      </label>
      <Select
        value={me.firm.id}
        onValueChange={(id) =>
          switchFirm.mutate(id, {
            onSuccess: (next) => {
              toast.success(`Now working in ${next.firm?.name ?? 'another firm'}`)
              void navigate('/')
            },
          })
        }
      >
        <SelectTrigger id="firm-switcher" size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {me.firms.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function UserMenu() {
  const { data: me } = useMe()
  const signOut = useSignOut()
  if (!me) return null
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={me.user.email}>
          {me.user.name}
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
          {me.firm && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {ROLE_LABEL[me.firm.role]}
            </Badge>
          )}
          <span className="truncate">{me.user.email}</span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        title="Sign out"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
      >
        <LogOut />
      </Button>
    </div>
  )
}
