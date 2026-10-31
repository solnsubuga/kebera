import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { AppProviders } from '@/app/providers/app-providers'
import { makeQueryClient } from '@/app/query-client'
import { router } from '@/app/router'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders client={makeQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
