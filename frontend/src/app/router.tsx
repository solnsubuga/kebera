import { createBrowserRouter, type RouteObject } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { NotFoundPage } from '@/pages/not-found'

// Each page is its own chunk, loaded when first visited.
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/engagements/pages/engagements-page')).EngagementsPage,
        }),
      },
      {
        path: 'engagements/:id',
        lazy: async () => ({
          Component: (await import('@/features/engagements/pages/engagement-page')).EngagementPage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
