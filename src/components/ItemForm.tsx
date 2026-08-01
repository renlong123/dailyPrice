import { useState, useEffect, useRef } from 'react'
import type { Item, ItemFormData, Category } from '../types'

interface ItemFormProps {
  item: Item | null          // null = 新增模式，非 null = 编辑模式
  categories: Category[]
  onSubmit: (data: ItemFormData) => Promise<void>
  onClose: () => void
  onAddCategory: (name: string, icon?: string) => Promise<Category>
}

// 新分类的默认 emoji 列表
const emojiOptions = ['📱', '👔', '🏠', '🍔', '🚌', '🎮', '📦', '💊', '📚', '🎧', '💄', '⚽']

export default function ItemForm({ item, categories, onSubmit, onClose, onAddCategory }: ItemFormProps) {
  const isEdit = item !== null

  const [name, setName] = useState(item?.name || '')
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [purchaseDate, setPurchaseDate] = useState(item?.purchaseDate || new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(item?.category || (categories[0]?.name || '其他'))
  const [notes, setNotes] = useState(item?.notes || '')
  const [submitting, setSubmitting] = useState(false)

  // 新增分类
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📌')

  const nameInputRef = useRef<HTMLInputElement>(null)

  // 自动聚焦
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // 点击遮罩关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        price: priceNum,
        purchaseDate,
        category,
        notes: notes.trim(),
      })
    } catch (err) {
      console.error('保存失败:', err)
      setSubmitting(false)
    }
  }

  // 添加新分类
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    try {
      const newCat = await onAddCategory(newCatName.trim(), newCatEmoji)
      setCategory(newCat.name)
      setShowNewCategory(false)
      setNewCatName('')
      setNewCatEmoji('📌')
    } catch (err) {
      console.error('添加分类失败:', err)
    }
  }

  const isValid = name.trim() && parseFloat(price) > 0

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? '编辑物品' : '添加物品'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* 物品名称 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">物品名称</span>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：iPhone 15 Pro"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
            />
          </label>

          {/* 价格 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">价格（元）</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
              />
            </div>
          </label>

          {/* 购买日期 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">购买日期</span>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
            />
          </label>

          {/* 分类 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">分类</span>

            {/* 已有分类 */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    category === cat.name
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}

              {/* 添加新分类按钮 */}
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建
              </button>
            </div>

            {/* 新建分类面板 */}
            {showNewCategory && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg flex flex-col gap-2">
                <div className="flex gap-2">
                  {/* Emoji 选择 */}
                  <div className="flex flex-wrap gap-1">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCatEmoji(emoji)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
                          newCatEmoji === emoji ? 'bg-primary-200 ring-1 ring-primary-400' : 'hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="新分类名称"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                    className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 备注 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">备注（可选）</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：京东购买、保修2年..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
            />
          </label>

          {/* 按钮 */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-sm font-medium text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? '保存中...' : (isEdit ? '保存修改' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
