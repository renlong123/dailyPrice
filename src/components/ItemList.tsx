import type { Item } from '../types'
import type { DisplayFormat } from '../utils/format'
import ItemCard from './ItemCard'

interface ItemListProps {
  items: Item[]
  loading: boolean
  displayFormat: DisplayFormat
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onAdd: () => void
}

export default function ItemList({ items, loading, displayFormat, onEdit, onDelete, onAdd }: ItemListProps) {
  // 加载中
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    )
  }

  // 空状态
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <span className="text-5xl">📝</span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">还没有任何物品记录</p>
            <p className="text-xs text-gray-400 mt-1">点击右上角「添加物品」开始记录吧</p>
          </div>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            添加第一件物品
          </button>
        </div>
      </div>
    )
  }

  // 物品列表
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            displayFormat={displayFormat}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-4 mb-2">
        共 {items.length} 件物品
      </p>
    </div>
  )
}
