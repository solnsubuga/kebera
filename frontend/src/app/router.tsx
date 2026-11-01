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
  {
    path: 'c/:token',
    lazy: async () => ({
      Component: (await import('@/features/client-portal/pages/client-request-page')).ClientRequestPage,
    }),
  },
  // The partner signs on a phone, outside the app shell, so nothing distracts from the decision.
  {
    path: 'engagements/:id/report/sign',
    lazy: async () => ({ Component: (await import('@/features/report/pages/sign-page')).SignPage }),
  },
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
          {
            path: 'design',
            lazy: async () => ({ Component: (await import('@/features/design/design-page')).DesignPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      // Ask runs full width, with the engagement header the run belongs to.
      { path: 'ask', lazy: async () => ({ Component: (await import('@/features/agent/pages/ask-page')).AskPage }) },
      {
        path: 'ask/:runId',
        lazy: async () => ({ Component: (await import('@/features/agent/pages/ask-page')).AskPage }),
      },
      // Trust runs full width on the grey ground, like the engagement screens.
      {
        path: 'trust',
        lazy: async () => ({ Component: (await import('@/features/trust/pages/trust-page')).TrustPage }),
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
          {
            path: 'risk',
            lazy: async () => ({ Component: (await import('@/features/risk/pages/risk-page')).RiskPage }),
          },
          {
            path: 'plan',
            lazy: async () => ({ Component: (await import('@/features/plan/pages/plan-page')).PlanPage }),
          },
          {
            path: 'test',
            element: <TestStageLayout />,
            children: [
              { index: true, element: <Navigate to="tests" replace /> },
              { path: 'analytics', lazy: soon('Statement and model review') },
              { path: 'tests', lazy: soon('Full-population tests') },
              { path: 'exceptions', lazy: soon('Exception triage') },
              { path: 'workpapers', lazy: soon('Workpapers') },
              {
                path: 'requests',
                lazy: async () => ({
                  Component: (await import('@/features/requests/pages/requests-page')).RequestsPage,
                }),
              },
            ],
          },
          {
            path: 'evaluate',
            lazy: async () => ({
              Component: (await import('@/features/evaluate/pages/misstatements-page')).MisstatementsPage,
            }),
          },
          {
            path: 'report',
            lazy: async () => ({ Component: (await import('@/features/report/pages/report-page')).ReportPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
