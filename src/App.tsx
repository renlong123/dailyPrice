import { useState, useCallback, useEffect } from 'react'
import { useItems } from './hooks/useItems'
import type { Item, ItemFormData } from './types'
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
  return 'ymd'
}

function saveFormat(format: DisplayFormat) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ displayFormat: format }))
  } catch { /* 存储满或隐私模式下忽略，不影响主功能 */ }
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
  } = useItems()

  // 时间展示格式
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>(loadFormat)

  useEffect(() => {
    saveFormat(displayFormat)
  }, [displayFormat])

  const toggleFormat = useCallback(() => {
    setDisplayFormat((prev) => (prev === 'ymd' ? 'days' : 'ymd'))
  }, [])

  // 表单弹窗状态 — 合并为单一状态避免不同步
  const [formState, setFormState] = useState<{ open: boolean; item: Item | null }>({ open: false, item: null })

  // 删除确认弹窗状态
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  // 错误提示
  const [error, setError] = useState<string | null>(null)

  // 打开新增表单
  const handleAdd = useCallback(() => {
    setFormState({ open: true, item: null })
  }, [])

  // 打开编辑表单
  const handleEdit = useCallback((item: Item) => {
    setFormState({ open: true, item })
  }, [])

  // 提交表单（新增或编辑）
  const handleSubmit = useCallback(async (formData: ItemFormData) => {
    if (formState.item) {
      await updateItem(formState.item.id, formData)
    } else {
      const newItem = await addItem(formData)
      // 如果添加的物品不属于当前筛选分类，自动切换到「全部」
      if (newItem && selectedCategory && newItem.category !== selectedCategory) {
        setSelectedCategory('')
      }
    }
    setFormState({ open: false, item: null })
  }, [formState.item, addItem, updateItem, selectedCategory, setSelectedCategory])

  // 关闭表单
  const handleCloseForm = useCallback(() => {
    setFormState({ open: false, item: null })
  }, [])

  // 确认删除（增加错误处理）
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteItem])

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
          selectedCategory={selectedCategory}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onAdd={handleAdd}
        />
      </div>

      {/* 新增/编辑物品弹窗 */}
      {formState.open && (
        <ItemForm
          item={formState.item}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          onAddCategory={addCategory}
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

      {/* 错误提示 */}
      {error && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xs mx-4 p-5 text-center">
            <span className="text-2xl">😞</span>
            <p className="text-sm text-gray-600 mt-2 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
