import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  onAdd: () => void
}

export default function Layout({ children, onAdd }: LayoutProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <h1 className="text-lg font-semibold text-gray-800">每日开销</h1>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加物品
        </button>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  )
}
