import { createBrowserRouter, type RouteObject } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { NotFoundPage } from '@/pages/not-found'

// Each page is its own chunk, loaded when first visited.
export const routes: RouteObject[] = [
  // Signed out
  {
    path: 'signin',
    lazy: async () => ({ Component: (await import('@/features/auth/pages/sign-in-page')).SignInPage }),
  },
  {
    path: 'signin/password',
    lazy: async () => ({ Component: (await import('@/features/auth/pages/password-page')).PasswordPage }),
  },
  {
    path: 'auth/verify', // the link in sign-in emails
    lazy: async () => ({ Component: (await import('@/features/auth/pages/verify-page')).VerifyPage }),
  },
  // Signed in, inside a firm
  {
    element: <RequireAuth />,
    children: [
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
          {
            path: 'people',
            lazy: async () => ({ Component: (await import('@/features/members/pages/members-page')).MembersPage }),
          },
          {
            path: 'audit',
            lazy: async () => ({ Component: (await import('@/features/members/pages/audit-page')).AuditPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
