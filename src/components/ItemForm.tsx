import { useState, useEffect, useRef } from 'react'
import type { Item, ItemFormData, Category } from '../types'
import { defaultEmojis, itemIconOptions, DEFAULT_ITEM_ICON } from '../utils/storage'
import Modal from './Modal'
import CategoryChip from './CategoryChip'

interface ItemFormProps {
  item: Item | null
  categories: Category[]
  onSubmit: (data: ItemFormData) => Promise<void>
  onClose: () => void
  onAddCategory: (name: string, icon?: string) => Promise<Category>
}

/** 获取本地日期字符串（YYYY-MM-DD），不受 UTC 时区影响 */
function getLocalDateStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ItemForm({ item, categories, onSubmit, onClose, onAddCategory }: ItemFormProps) {
  const isEdit = item !== null

  const [icon, setIcon] = useState(item?.icon || DEFAULT_ITEM_ICON)
  const [name, setName] = useState(item?.name || '')
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [purchaseDate, setPurchaseDate] = useState(item?.purchaseDate || getLocalDateStr())
  const [category, setCategory] = useState(item?.category || (categories[0]?.name || '其他'))
  const [status, setStatus] = useState<'active' | 'sold'>(item?.status || 'active')
  const [sellPrice, setSellPrice] = useState(item?.sellPrice != null ? String(item.sellPrice) : '')
  const [soldDate, setSoldDate] = useState(item?.soldDate || getLocalDateStr())
  const [notes, setNotes] = useState(item?.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 新增分类
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📌')
  const [addingCat, setAddingCat] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null)

  // 自动聚焦
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('请输入物品名称')
      return
    }

    const priceNum = parseFloat(price)

    // 拒绝非数字、非正数、科学计数法
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('请输入有效的价格')
      return
    }
    // 拒绝科学计数法（如 1e5）—— 这些不应被视为有效价格
    if (/[eE]/.test(price)) {
      setError('价格格式不正确，请输入数字')
      return
    }

    setSubmitting(true)
    try {
      const sellPriceNum = status === 'sold' && sellPrice ? parseFloat(sellPrice) : undefined
      if (status === 'sold' && sellPrice && (isNaN(sellPriceNum!) || sellPriceNum! <= 0)) {
        setError('请输入有效的卖出价格')
        return
      }

      await onSubmit({
        name: name.trim(),
        icon,
        price: Math.round(priceNum * 100) / 100,
        purchaseDate,
        category,
        status,
        sellPrice: sellPriceNum != null ? Math.round(sellPriceNum * 100) / 100 : undefined,
        soldDate: status === 'sold' ? soldDate : undefined,
        notes: notes.trim(),
      })
    } catch (err) {
      console.error('保存失败:', err)
      setError(err instanceof Error ? err.message : '保存失败，请重试')
      setSubmitting(false)
    }
  }

  // 添加新分类
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setAddingCat(true)
    try {
      const newCat = await onAddCategory(newCatName.trim(), newCatEmoji)
      setCategory(newCat.name)
      setShowNewCategory(false)
      setNewCatName('')
      setNewCatEmoji('📌')
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加分类失败')
    } finally {
      setAddingCat(false)
    }
  }

  const isValid = name.trim().length > 0 && parseFloat(price) > 0 && !/[eE]/.test(price)

  return (
    <Modal onClose={onClose}>
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
          {/* 错误提示 */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          {/* 图标选择 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">图标</span>
            <div className="flex flex-wrap gap-1">
              {itemIconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${
                    icon === emoji ? 'bg-primary-200 ring-2 ring-primary-400' : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

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

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  selected={category === cat.name}
                  onClick={() => setCategory(cat.name)}
                />
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
                <div className="flex flex-wrap gap-1">
                  {defaultEmojis.map((emoji) => (
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
                    disabled={!newCatName.trim() || addingCat}
                    className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingCat ? '添加中...' : '添加'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 物品状态 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">状态</span>
            <div className="flex gap-2">
              {(['active', 'sold'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === s
                      ? s === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'active' ? '🟢 使用中' : '🔴 已卖出'}
                </button>
              ))}
            </div>
          </div>

          {/* 卖出价格 + 卖出日期（仅已卖出时显示） */}
          {status === 'sold' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">卖出价格（元）</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">卖出日期</span>
                  <input
                    type="date"
                    value={soldDate}
                    onChange={(e) => setSoldDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
                  />
                </label>
              </div>
            </>
          )}

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
    </Modal>
  )
}
