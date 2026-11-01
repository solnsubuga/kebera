import { useEffect, useRef } from 'react'

type ListKeysOptions = {
  /** How many rows the list has. */
  count: number
  /** The selected row. */
  index: number
  onIndexChange: (index: number) => void
  /**
   * Extra single-key actions on the selected row, for example
   * { r: markRight, w: markWrong, e: escalate, ' ': openEvidence }.
   */
  keys?: Record<string, (index: number) => void>
  /** Turn the bindings off, for example while a form on the page is open. */
  enabled?: boolean
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

/**
 * Keyboard-first triage: J and K (or the arrow keys) move through a list, other keys act on the
 * selected row. Keys are ignored while typing, with a modifier held, or while a dialog is open.
 */
export function useListKeys({ count, index, onIndexChange, keys = {}, enabled = true }: ListKeysOptions) {
  const latest = useRef({ count, index, onIndexChange, keys })
  useEffect(() => {
    latest.current = { count, index, onIndexChange, keys }
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (document.querySelector('[role="dialog"][data-state="open"]')) return
      const { count, index, onIndexChange, keys } = latest.current
      if (count === 0) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === 'j' || key === 'ArrowDown') {
        e.preventDefault()
        onIndexChange(Math.min(count - 1, index + 1))
      } else if (key === 'k' || key === 'ArrowUp') {
        e.preventDefault()
        onIndexChange(Math.max(0, index - 1))
      } else if (keys[key]) {
        e.preventDefault()
        keys[key](index)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
