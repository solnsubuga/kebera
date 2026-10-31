import { Command } from 'cmdk'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Dialog as DialogPrimitive, VisuallyHidden } from 'radix-ui'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { useTheme } from '@/app/providers/theme-context'
import { NAV } from '@/app/nav'
import { Kbd } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'

import { CommandContext, type PaletteCommand } from './command-context'

/** Holds the palette's open state and the commands screens register, and binds Cmd-K / Ctrl-K. */
export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [registry, setRegistry] = useState<Record<string, PaletteCommand[]>>({})

  const register = useCallback(
    (owner: string, commands: PaletteCommand[]) => setRegistry((r) => ({ ...r, [owner]: commands })),
    [],
  )
  const unregister = useCallback(
    (owner: string) =>
      setRegistry((r) => {
        const next = { ...r }
        delete next[owner]
        return next
      }),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo(() => ({ open, setOpen, register, unregister }), [open, register, unregister])
  const commands = useMemo(() => Object.values(registry).flat(), [registry])

  return (
    <CommandContext value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} />
    </CommandContext>
  )
}

const itemClass =
  'flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-3 text-sm text-ink data-[selected=true]:bg-fill [&_svg]:size-4 [&_svg]:text-ink-muted'

function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: PaletteCommand[]
}) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState('')

  const run = (fn: () => void) => {
    onOpenChange(false)
    setQuery('')
    fn()
  }

  const groups = useMemo(() => {
    const out = new Map<string, PaletteCommand[]>()
    for (const c of commands) out.set(c.group ?? 'Actions', [...(out.get(c.group ?? 'Actions') ?? []), c])
    return [...out]
  }, [commands])

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setQuery('')
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/25" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="bg-sheet shadow-card data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] fixed top-[14vh] left-1/2 z-50 w-[calc(100%-32px)] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-[18px] ring-1 ring-black/5"
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Ask {BRAND} or jump to a screen</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <Command label={`Ask ${BRAND}`} loop>
            <div className="border-rule-soft flex items-center gap-3 border-b px-4">
              <Sparkles className="text-link size-4 shrink-0" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={`Ask ${BRAND}, or type a screen`}
                className="placeholder:text-ink-muted h-14 flex-1 bg-transparent text-[15px] outline-none"
              />
              <Kbd>esc</Kbd>
            </div>
            <Command.List className="[&_[cmdk-group-heading]]:text-ink-muted max-h-[min(420px,60vh)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold">
              {!query.trim() && (
                <Command.Empty className="text-ink-muted px-3 py-6 text-center text-sm">
                  No screen matches.
                </Command.Empty>
              )}
              {query.trim() && (
                <Command.Group heading={`Ask ${BRAND}`} forceMount>
                  <Command.Item
                    value={`__ask ${query}`}
                    forceMount
                    onSelect={() => run(() => void navigate(`/ask?q=${encodeURIComponent(query.trim())}`))}
                    className={itemClass}
                  >
                    <Sparkles className="!text-link" />
                    <span className="min-w-0 flex-1 truncate">Run “{query.trim()}”</span>
                    <span className="text-ink-muted text-xs">a run with a plan, steps and a receipt</span>
                  </Command.Item>
                </Command.Group>
              )}
              {groups.map(([heading, items]) => (
                <Command.Group key={heading} heading={heading}>
                  {items.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`${c.label} ${c.id}`}
                      keywords={c.keywords}
                      onSelect={() => run(c.run)}
                      className={itemClass}
                    >
                      <ArrowRight />
                      <span className="flex-1">{c.label}</span>
                      {c.hint && <Kbd>{c.hint}</Kbd>}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              <Command.Group heading="Go to">
                {NAV.map(({ to, label, icon: Icon }) => (
                  <Command.Item
                    key={to}
                    value={`Go to ${label}`}
                    onSelect={() => run(() => void navigate(to))}
                    className={itemClass}
                  >
                    <Icon />
                    {label}
                  </Command.Item>
                ))}
                <Command.Item
                  value="Go to Design system"
                  onSelect={() => run(() => void navigate('/design'))}
                  className={itemClass}
                >
                  <ArrowRight />
                  Design system
                </Command.Item>
              </Command.Group>
              <Command.Group heading="Settings">
                {(['light', 'dark', 'system'] as const)
                  .filter((t) => t !== theme)
                  .map((t) => (
                    <Command.Item
                      key={t}
                      value={`Theme ${t}`}
                      onSelect={() => run(() => setTheme(t))}
                      className={itemClass}
                    >
                      <ArrowRight />
                      {t === 'system' ? 'Match system appearance' : `Use ${t} appearance`}
                    </Command.Item>
                  ))}
              </Command.Group>
            </Command.List>
            <div className="border-rule-soft text-ink-muted flex items-center gap-4 border-t px-4 py-2 text-xs">
              <span>
                <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
              </span>
              <span>
                <Kbd>↵</Kbd> open
              </span>
              <span className="ml-auto">Every ask becomes a run you can check.</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
