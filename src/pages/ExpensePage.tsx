import { useState, useCallback } from 'react'
import type { Item, ItemFormData, Category, Stats } from '../types'
import type { DisplayFormat } from '../utils/format'
import StatsBar from '../components/StatsBar'
import ItemList from '../components/ItemList'
import ItemForm from '../components/ItemForm'
import CategoryFilter from '../components/CategoryFilter'
import DeleteConfirm from '../components/DeleteConfirm'

interface ExpensePageProps {
  items: Item[]
  categories: Category[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  loading: boolean
  stats: Stats
  displayFormat: DisplayFormat
  onToggleFormat: () => void
  showSold: boolean
  setShowSold: (show: boolean) => void
  addItem: (data: ItemFormData) => Promise<Item>
  updateItem: (id: number, data: ItemFormData) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  addCategory: (name: string, icon?: string) => Promise<Category>
}

export default function ExpensePage({
  items, categories, selectedCategory, setSelectedCategory, loading, stats,
  displayFormat, onToggleFormat, showSold, setShowSold,
  addItem, updateItem, deleteItem, addCategory,
}: ExpensePageProps) {
  const [formState, setFormState] = useState<{ open: boolean; item: Item | null }>({ open: false, item: null })
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  const handleAdd = useCallback(() => setFormState({ open: true, item: null }), [])
  const handleEdit = useCallback((item: Item) => setFormState({ open: true, item }), [])

  const handleSubmit = useCallback(async (formData: ItemFormData) => {
    if (formState.item) {
      await updateItem(formState.item.id, formData)
    } else {
      const newItem = await addItem(formData)
      if (newItem && selectedCategory && newItem.category !== selectedCategory) {
        setSelectedCategory('')
      }
    }
    setFormState({ open: false, item: null })
  }, [formState.item, addItem, updateItem, selectedCategory, setSelectedCategory])

  const handleCloseForm = useCallback(() => setFormState({ open: false, item: null }), [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    await deleteItem(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteTarget, deleteItem])

  return (
    <>
      <StatsBar stats={stats} displayFormat={displayFormat} onToggleFormat={onToggleFormat}
        showSold={showSold} onToggleSold={() => setShowSold(!showSold)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* 页面标题栏 */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">💰 物品列表</h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加物品
          </button>
        </div>
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        <ItemList
          items={items} loading={loading} displayFormat={displayFormat}
          selectedCategory={selectedCategory}
          onEdit={handleEdit} onDelete={setDeleteTarget} onAdd={handleAdd}
        />
      </div>
      {formState.open && (
        <ItemForm
          item={formState.item} categories={categories}
          onSubmit={handleSubmit} onClose={handleCloseForm} onAddCategory={addCategory}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          itemName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
