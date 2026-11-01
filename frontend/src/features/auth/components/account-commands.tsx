import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useRegisterCommands, type PaletteCommand } from '@/components/command/command-context'

import { useMe, useSignOut, useSwitchFirm } from '../api'

/** Puts "Switch to <firm>" and "Sign out" in the Cmd-K palette, so the rail needs no extra menus. */
export function AccountCommands() {
  const { data: me } = useMe()
  const switchFirm = useSwitchFirm()
  const signOut = useSignOut()
  const navigate = useNavigate()

  const commands = useMemo<PaletteCommand[]>(() => {
    if (!me) return []
    const others = me.firms.filter((f) => f.id !== me.firm?.id)
    return [
      ...others.map((f) => ({
        id: `firm-${f.id}`,
        label: `Switch to ${f.name}`,
        group: 'Account',
        keywords: ['firm', 'switch'],
        run: () =>
          switchFirm.mutate(f.id, {
            onSuccess: () => {
              toast.success(`Now working in ${f.name}`)
              void navigate('/')
            },
          }),
      })),
      { id: 'sign-out', label: 'Sign out', group: 'Account', keywords: ['log out'], run: () => signOut.mutate() },
    ]
  }, [me, switchFirm, signOut, navigate])

  useRegisterCommands(commands)
  return null
}
