import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { SiteFooter, SiteHeader } from '@/components/site-header'
import { TooltipProvider } from '@/components/ui/tooltip'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'POKÉBRUTAL — 新粗野主义宝可梦图鉴' },
      {
        name: 'description',
        content:
          '一个用 TanStack Start + shadcn Registry 协议 + neobrutalism 组件搭出来的宝可梦图鉴。',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
      },
      // 字体走 Google Fonts CDN。neobrutalism 官方推荐 Archivo Black + Space Grotesk
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body className="bg-grid min-h-screen">
        {/* Tooltip 是 Base UI 的受控浮层，需要 Provider 包在最外层 */}
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
