import { createContext, use, useEffect, useId } from 'react'

export type PaletteCommand = {
  id: string
  label: string
  /** Heading the command sits under, such as "This engagement". Defaults to "Actions". */
  group?: string
  /** Extra words that should find it. */
  keywords?: string[]
  /** A key hint shown at the right, such as "R". */
  hint?: string
  run: () => void
}

type CommandState = {
  open: boolean
  setOpen: (open: boolean) => void
  register: (owner: string, commands: PaletteCommand[]) => void
  unregister: (owner: string) => void
}

export const CommandContext = createContext<CommandState | null>(null)

export function useCommandPalette() {
  const ctx = use(CommandContext)
  if (!ctx) throw new Error('useCommandPalette needs <CommandProvider>')
  return { open: ctx.open, setOpen: ctx.setOpen }
}

/**
 * Add commands to the Cmd-K palette while the calling screen is mounted.
 * Pass a memoised array: the palette re-registers whenever its identity changes.
 */
export function useRegisterCommands(commands: PaletteCommand[]) {
  const ctx = use(CommandContext)
  const owner = useId()
  useEffect(() => {
    if (!ctx) return
    ctx.register(owner, commands)
    return () => ctx.unregister(owner)
    // register and unregister are stable, so re-run only when the commands change
  }, [owner, commands])
}
