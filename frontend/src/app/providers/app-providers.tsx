import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'

import { ThemeProvider } from './theme-provider'

export function AppProviders({ client, children }: { client: QueryClient; children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster richColors closeButton />
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-right" />}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
