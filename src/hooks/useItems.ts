import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Item, Category, ItemFormData, Stats } from '../types'
import {
  getItems,
  addItem as storageAddItem,
  updateItem as storageUpdateItem,
  deleteItem as storageDeleteItem,
  getCategories,
  addCategory as storageAddCategory,
} from '../utils/storage'
import { getDaysUsed } from '../utils/format'

function computeStats(items: Item[]): Stats {
  const totalSpent = items.reduce((sum, item) => sum + item.price, 0)
  const itemCount = items.length

  let totalDailyCost = 0
  items.forEach((item) => {
    const days = getDaysUsed(item.purchaseDate)
    if (days > 0) {
      totalDailyCost += item.price / days
    }
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
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 加载数据
  const loadData = useCallback(() => {
    try {
      const itemsData = getItems(selectedCategory || undefined)
      const categoriesData = getCategories()
      setItems(itemsData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 添加物品
  const addItem = useCallback(async (formData: ItemFormData) => {
    const newItem = storageAddItem(formData)
    loadData()
    return newItem
  }, [loadData])

  // 更新物品
  const updateItem = useCallback(async (id: number, formData: ItemFormData) => {
    storageUpdateItem(id, formData)
    loadData()
  }, [loadData])

  // 删除物品
  const deleteItem = useCallback(async (id: number) => {
    storageDeleteItem(id)
    loadData()
  }, [loadData])

  // 添加分类
  const addCategory = useCallback(async (name: string, icon?: string) => {
    const newCat = storageAddCategory(name, icon)
    loadData()
    return newCat
  }, [loadData])

  // 统计数据（从 items 计算得出）
  const stats = useMemo(() => computeStats(items), [items])

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
