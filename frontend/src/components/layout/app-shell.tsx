import { Outlet } from 'react-router'

import { CommandProvider } from '@/components/command'

import { Rail } from './rail'

/** Rail at the left, the screen on a white sheet at the right, and the Cmd-K palette over both. */
export function AppShell() {
  return (
    <CommandProvider>
      <div className="flex min-h-svh flex-col md:h-svh md:flex-row md:overflow-hidden">
        <Rail />
        <main className="bg-sheet flex min-w-0 flex-1 flex-col md:overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </CommandProvider>
  )
}

/** A padded, centred column for list and overview screens. Engagement screens run full width instead. */
export function ContentLayout() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <Outlet />
    </div>
  )
}
