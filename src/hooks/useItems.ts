import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Item, Category, ItemFormData, Stats } from '../types'
import {
  loadStore,
  addItem as storageAddItem,
  updateItem as storageUpdateItem,
  deleteItem as storageDeleteItem,
  addCategory as storageAddCategory,
  STORAGE_KEY,
} from '../utils/storage'
import { getDailyCost } from '../utils/format'

/** 始终基于全部物品计算全局统计 */
function computeStats(items: Item[]): Stats {
  const totalSpent = items.reduce((sum, item) => sum + item.price, 0)
  const itemCount = items.length

  let totalDailyCost = 0
  items.forEach((item) => {
    totalDailyCost += getDailyCost(item.price, item.purchaseDate)
  })

  const avgDailyCost = itemCount > 0 ? totalDailyCost / itemCount : 0

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    itemCount,
    avgDailyCost: Math.round(avgDailyCost * 100) / 100,
  }
}

// ========== Hook ==========
export function useItems() {
  const [allItems, setAllItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 一次性加载全部数据
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

  // 多标签页同步：监听其他标签页的 storage 变更
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        loadData()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [loadData])

  // 根据筛选条件过滤 + 排序（排序在内存中完成，不需要每次重新解析）
  const items = useMemo(() => {
    let result = allItems
    if (selectedCategory) {
      result = result.filter((i) => i.category === selectedCategory)
    }
    return [...result].sort((a, b) => {
      const da = new Date(a.purchaseDate + 'T00:00:00').getTime()
      const db = new Date(b.purchaseDate + 'T00:00:00').getTime()
      return db - da
    })
  }, [allItems, selectedCategory])

  // 统计数据始终基于全部物品（不受筛选影响）
  const stats = useMemo(() => computeStats(allItems), [allItems])

  // 添加物品：storage 返回更新后的 store，直接设入 state 避免重复解析
  const addItem = useCallback(async (formData: ItemFormData) => {
    const { item, store } = storageAddItem(formData)
    setAllItems(store.items)
    setCategories(store.categories)
    return item
  }, [])

  // 更新物品
  const updateItem = useCallback(async (id: number, formData: ItemFormData) => {
    const { store } = storageUpdateItem(id, formData)
    setAllItems(store.items)
    setCategories(store.categories)
  }, [])

  // 删除物品
  const deleteItem = useCallback(async (id: number) => {
    const { store } = storageDeleteItem(id)
    setAllItems(store.items)
    setCategories(store.categories)
  }, [])

  // 添加分类
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
    loading,
    stats,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    refresh: loadData,
  }
}
