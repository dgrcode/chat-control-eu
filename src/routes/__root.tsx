import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'

import { TooltipProvider } from '#/components/ui/tooltip.tsx'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Chat Control Vote Record',
      },
      {
        name: 'description',
        content:
          'A source-grounded record of European Parliament votes concerning EU Chat Control proposals.',
      },
      { name: 'theme-color', content: '#f7f5f0' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootDocument,
  component: AppShell,
})

function AppShell() {
  return (
    <TooltipProvider>
      <header className="site-header">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <Link to="/" className="brand-mark" aria-label="Chat Control Vote Record home">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-paper shadow-sm">
              <ShieldCheck className="size-4" strokeWidth={2.25} />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-none tracking-tight">
                Chat Control
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-muted-foreground">
                Vote record
              </span>
            </span>
          </Link>
          <div className="text-right text-xs leading-relaxed text-muted-foreground">
            <span className="block font-medium text-foreground">European Parliament</span>
            <span>2021–2026 · 7 material votes</span>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-border bg-card/50">
        <div className="page-shell grid gap-4 py-8 text-xs leading-relaxed text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-2xl">
            Vote directions are normalized ballot by ballot. “Not recorded present”
            does not establish a person’s physical absence or the reason they did not vote.
          </p>
          <p>Source-grounded · No motive inferred</p>
        </div>
      </footer>
    </TooltipProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
