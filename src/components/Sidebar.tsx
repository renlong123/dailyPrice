export type Page = 'home' | 'expenses' | 'todos'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { key: Page; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: '首页' },
  { key: 'expenses', icon: '💰', label: '每日开销' },
  { key: 'todos', icon: '✅', label: '每日待办' },
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-44 shrink-0 bg-white border-r border-gray-200 p-3 flex flex-col gap-1">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
        导航
      </h2>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            activePage === item.key
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  )
}
