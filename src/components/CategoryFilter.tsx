import type { Category } from '../types'
import CategoryChip from './CategoryChip'

interface CategoryFilterProps {
  categories: Category[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto shrink-0">
      {/* "全部" 按钮 */}
      <button
        onClick={() => onSelect('')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
          selected === ''
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>

      {/* 分类标签 — 使用共用 CategoryChip */}
      {categories.map((cat) => (
        <CategoryChip
          key={cat.id}
          category={cat}
          selected={selected === cat.name}
          onClick={() => onSelect(cat.name)}
        />
      ))}
    </div>
  )
}
