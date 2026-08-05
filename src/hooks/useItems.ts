import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Item, Category, ItemFormData, Stats, SortBy } from '../types'
import {
  loadStore,
  addItem as storageAddItem,
  updateItem as storageUpdateItem,
  deleteItem as storageDeleteItem,
  addCategory as storageAddCategory,
  STORAGE_KEY,
} from '../utils/storage'
import { getDailyCost } from '../utils/format'

/** 基于使用中的物品计算统计 */
function computeStats(items: Item[]): Stats {
  const activeItems = items.filter((i) => i.status !== 'sold')
  const totalSpent = activeItems.reduce((sum, item) => sum + item.price, 0)
  const itemCount = activeItems.length

  let totalDailyCost = 0
  activeItems.forEach((item) => {
    totalDailyCost += getDailyCost(item.price, item.purchaseDate)
  })

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    itemCount,
    totalDailyCost: Math.round(totalDailyCost * 100) / 100,
  }
}

// ========== Hook ==========
export function useItems() {
  const [allItems, setAllItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showSold, setShowSold] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('dailyCost')  // 默认按每日成本降序
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    try {
      const store = loadStore()
      setAllItems(store.items)
      setCategories(store.categories)
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        loadData()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [loadData])

  // 筛选 + 排序（默认隐藏已卖出）
  const items = useMemo(() => {
    let result = allItems
    if (!showSold) {
      result = result.filter((i) => i.status !== 'sold')
    }
    if (selectedCategory) {
      result = result.filter((i) => i.category === selectedCategory)
    }

    // 排序
    const sorted = [...result]
    if (sortBy === 'purchaseDate') {
      sorted.sort((a, b) => {
        const da = new Date(a.purchaseDate + 'T00:00:00').getTime()
        const db = new Date(b.purchaseDate + 'T00:00:00').getTime()
        return db - da
      })
    } else {
      // 按每日成本降序
      sorted.sort((a, b) => {
        const costA = getDailyCost(a.price, a.purchaseDate, a.soldDate)
        const costB = getDailyCost(b.price, b.purchaseDate, b.soldDate)
        return costB - costA
      })
    }
    return sorted
  }, [allItems, selectedCategory, showSold, sortBy])

  // 统计数据始终基于使用中的物品
  const stats = useMemo(() => computeStats(allItems), [allItems])

  const addItem = useCallback(async (formData: ItemFormData) => {
    const { item, store } = storageAddItem(formData)
    setAllItems(store.items)
    setCategories(store.categories)
    return item
  }, [])

  const updateItem = useCallback(async (id: number, formData: ItemFormData) => {
    const { store } = storageUpdateItem(id, formData)
    setAllItems(store.items)
    setCategories(store.categories)
  }, [])

  const deleteItem = useCallback(async (id: number) => {
    const { store } = storageDeleteItem(id)
    setAllItems(store.items)
    setCategories(store.categories)
  }, [])

  const addCategory = useCallback(async (name: string, icon?: string) => {
    const { category, store } = storageAddCategory(name, icon)
    setAllItems(store.items)
    setCategories(store.categories)
    return category
  }, [])

  return {
    items,
    categories,
    selectedCategory,
    setSelectedCategory,
    showSold,
    setShowSold,
    sortBy,
    setSortBy,
    loading,
    stats,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    refresh: loadData,
  }
}
