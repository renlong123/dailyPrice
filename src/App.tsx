import { useState, useCallback, useEffect } from 'react'
import { useItems } from './hooks/useItems'
import type { Item, ItemFormData, Category } from './types'
import type { DisplayFormat } from './utils/format'
import Layout from './components/Layout'
import StatsBar from './components/StatsBar'
import ItemList from './components/ItemList'
import ItemForm from './components/ItemForm'
import CategoryFilter from './components/CategoryFilter'
import DeleteConfirm from './components/DeleteConfirm'

const SETTINGS_KEY = 'daily-expense-settings'

function loadFormat(): DisplayFormat {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const settings = JSON.parse(raw)
      if (settings.displayFormat === 'days' || settings.displayFormat === 'ymd') {
        return settings.displayFormat
      }
    }
  } catch { /* ignore */ }
  return 'ymd' // 默认：按年月日展示
}

function saveFormat(format: DisplayFormat) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ displayFormat: format }))
}

export default function App() {
  const {
    items,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    stats,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    refresh,
  } = useItems()

  // 时间展示格式
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>(loadFormat)

  useEffect(() => {
    saveFormat(displayFormat)
  }, [displayFormat])

  const toggleFormat = useCallback(() => {
    setDisplayFormat((prev) => (prev === 'ymd' ? 'days' : 'ymd'))
  }, [])

  // 表单弹窗状态
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  // 删除确认弹窗状态
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  // 打开新增表单
  const handleAdd = useCallback(() => {
    setEditingItem(null)
    setShowForm(true)
  }, [])

  // 打开编辑表单
  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item)
    setShowForm(true)
  }, [])

  // 提交表单（新增或编辑）
  const handleSubmit = useCallback(async (formData: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, formData)
    } else {
      await addItem(formData)
    }
    setShowForm(false)
    setEditingItem(null)
  }, [editingItem, addItem, updateItem])

  // 关闭表单
  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingItem(null)
  }, [])

  // 确认删除
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteItem(deleteTarget.id)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteItem])

  // 处理新建分类
  const handleAddCategory = useCallback(async (name: string, icon?: string) => {
    return await addCategory(name, icon)
  }, [addCategory])

  return (
    <Layout onAdd={handleAdd}>
      {/* 左侧统计栏 */}
      <StatsBar stats={stats} displayFormat={displayFormat} onToggleFormat={toggleFormat} />

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 分类筛选 */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* 物品列表 */}
        <ItemList
          items={items}
          loading={loading}
          displayFormat={displayFormat}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onAdd={handleAdd}
        />
      </div>

      {/* 新增/编辑物品弹窗 */}
      {showForm && (
        <ItemForm
          item={editingItem}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <DeleteConfirm
          itemName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Layout>
  )
}
