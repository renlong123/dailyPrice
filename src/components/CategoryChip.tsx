import type { Category } from '../types'

interface CategoryChipProps {
  category: Category
  selected: boolean
  onClick: () => void
}

/** 共用分类标签，CategoryFilter 和 ItemForm 统一使用 */
export default function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        selected
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </button>
  )
}
