import type { ReactNode } from 'react'
import type { Page } from './Sidebar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
  activePage: Page
  onNavigate: (page: Page) => void
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <h1 className="text-lg font-semibold text-gray-800">每日开销</h1>
        </div>
      </header>

      {/* 主体：侧边栏 + 内容 */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
