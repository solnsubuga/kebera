import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'

import { AppShell, ContentLayout } from '@/components/layout/app-shell'
import { EngagementLayout, TestStageLayout } from '@/components/layout/engagement-layout'
import { ComingSoon } from '@/pages/coming-soon'
import { NotFoundPage } from '@/pages/not-found'

// Each page is its own chunk, loaded when first visited.
// A screen still being built uses soon('Title'): replace that one line with your page's lazy import.
/** A lazy route that shows ComingSoon. Swap it for your page's lazy import. */
const soon = (title: string) => async () => ({ Component: () => <ComingSoon title={title} /> })

export const routes: RouteObject[] = [
  // Client answers requests on a phone, outside the firm's app.
  { path: 'c/:token', lazy: soon('Client requests') },
  {
    element: <AppShell />,
    children: [
      {
        element: <ContentLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/engagements-page')).EngagementsPage,
            }),
          },
          { path: 'inbox', lazy: soon('Inbox') },
          { path: 'reviews', lazy: soon('My reviews') },
          { path: 'library', lazy: soon('Library') },
          { path: 'trust', lazy: soon('Trust') },
          { path: 'ask', lazy: soon('Ask') },
          { path: 'ask/:runId', lazy: soon('Run') },
          {
            path: 'design',
            lazy: async () => ({ Component: (await import('@/features/design/design-page')).DesignPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: 'engagements/:id',
        element: <EngagementLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/engagement-page')).EngagementPage,
            }),
          },
          {
            path: 'accept',
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/accept-page')).AcceptPage,
            }),
          },
          {
            path: 'connect',
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/connect-page')).ConnectPage,
            }),
          },
          {
            path: 'understand',
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/understand-page')).UnderstandPage,
            }),
          },
          {
            path: 'materiality',
            lazy: async () => ({
              Component: (await import('@/features/engagements/pages/materiality-page')).MaterialityPage,
            }),
          },
          { path: 'risk', lazy: soon('Risks to assertions') },
          { path: 'plan', lazy: soon('Audit plan') },
          {
            path: 'test',
            element: <TestStageLayout />,
            children: [
              { index: true, element: <Navigate to="tests" replace /> },
              { path: 'analytics', lazy: soon('Statement and model review') },
              { path: 'tests', lazy: soon('Full-population tests') },
              { path: 'exceptions', lazy: soon('Exception triage') },
              { path: 'workpapers', lazy: soon('Workpapers') },
              { path: 'requests', lazy: soon('Client requests') },
            ],
          },
          { path: 'evaluate', lazy: soon('Evaluate misstatements') },
          { path: 'report', lazy: soon('Letter and opinion draft') },
          { path: 'report/sign', lazy: soon('Partner sign-off') },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
