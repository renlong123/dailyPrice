import type { Item, ItemFormData, Category } from '../types'

export const STORAGE_KEY = 'daily-expense-data'

// ========== 默认分类 ==========
export const defaultCategories: Category[] = [
  { id: 1, name: '电子设备', icon: '📱' },
  { id: 2, name: '衣物', icon: '👔' },
  { id: 3, name: '家居', icon: '🏠' },
  { id: 4, name: '食品', icon: '🍔' },
  { id: 5, name: '交通', icon: '🚌' },
  { id: 6, name: '娱乐', icon: '🎮' },
  { id: 7, name: '其他', icon: '📦' },
]

/** 默认分类的 emoji 列表，供 ItemForm 使用 */
export const defaultEmojis = defaultCategories.map((c) => c.icon)

/** 新增分类的默认图标 */
export const DEFAULT_CATEGORY_ICON = '📌'

// ========== 数据结构 ==========
export interface StoreData {
  items: Item[]
  categories: Category[]
  nextId: number
}

/** 一次性加载整个 store，避免多次 JSON.parse */
export function loadStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as StoreData
      return {
        items: Array.isArray(data.items)
          ? data.items.map((i: Item) => ({ ...i, status: i.status || 'active' }))
          : [],
        categories: Array.isArray(data.categories) && data.categories.length > 0
          ? data.categories
          : [...defaultCategories],
        nextId: typeof data.nextId === 'number' && data.nextId > 0
          ? data.nextId
          : (Array.isArray(data.items) && data.items.length > 0
            ? Math.max(...data.items.map((i) => i.id)) + 1
            : 1),
      }
    }
  } catch (err) {
    console.error('加载数据失败:', err)
  }
  return { items: [], categories: [...defaultCategories], nextId: 1 }
}

/** 保存 store，返回是否成功 */
export function saveStore(data: StoreData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (err) {
    console.error('保存数据失败:', err)
    return false
  }
}

// ========== 物品 CRUD ==========

export function getItems(category?: string): Item[] {
  const store = loadStore()
  let items = store.items
  if (category) {
    items = items.filter((i) => i.category === category)
  }
  items.sort((a, b) => {
    const da = new Date(a.purchaseDate + 'T00:00:00').getTime()
    const db = new Date(b.purchaseDate + 'T00:00:00').getTime()
    return db - da
  })
  return items
}

export function addItem(item: ItemFormData): { item: Item; store: StoreData } {
  const store = loadStore()
  const status = item.status || 'active'
  const newItem: Item = {
    id: store.nextId++,
    name: item.name,
    price: Math.round(Number(item.price) * 100) / 100,
    purchaseDate: item.purchaseDate,
    category: item.category || '其他',
    status,
    sellPrice: status === 'sold' && item.sellPrice != null ? Math.round(Number(item.sellPrice) * 100) / 100 : undefined,
    soldDate: status === 'sold' ? (item.soldDate || undefined) : undefined,
    notes: item.notes || '',
  }
  store.items.push(newItem)
  saveStore(store)
  return { item: newItem, store }
}

export function updateItem(id: number, updates: ItemFormData): { store: StoreData } {
  const store = loadStore()
  const index = store.items.findIndex((i) => i.id === id)
  if (index === -1) throw new Error(`物品 ID ${id} 不存在`)
  const status = updates.status || 'active'
  store.items[index] = {
    ...store.items[index],
    name: updates.name,
    price: Math.round(Number(updates.price) * 100) / 100,
    purchaseDate: updates.purchaseDate,
    category: updates.category || '其他',
    status,
    sellPrice: status === 'sold' && updates.sellPrice != null ? Math.round(Number(updates.sellPrice) * 100) / 100 : undefined,
    soldDate: status === 'sold' ? (updates.soldDate || undefined) : undefined,
    notes: updates.notes || '',
  }
  saveStore(store)
  return { store }
}

export function deleteItem(id: number): { store: StoreData } {
  const store = loadStore()
  const index = store.items.findIndex((i) => i.id === id)
  if (index === -1) throw new Error(`物品 ID ${id} 不存在`)
  store.items.splice(index, 1)
  saveStore(store)
  return { store }
}

// ========== 分类管理 ==========

export function getCategories(): Category[] {
  const store = loadStore()
  return store.categories
}

export function addCategory(name: string, icon?: string): { category: Category; store: StoreData } {
  const store = loadStore()

  // 检查分类名是否已存在（按名称去重）
  const existing = store.categories.find((c) => c.name === name)
  if (existing) {
    throw new Error(`分类「${name}」已存在`)
  }

  const maxId = store.categories.length > 0
    ? Math.max(...store.categories.map((c) => c.id))
    : 0
  const newCategory: Category = {
    id: maxId + 1,
    name,
    icon: icon || DEFAULT_CATEGORY_ICON,
  }
  store.categories.push(newCategory)
  saveStore(store)
  return { category: newCategory, store }
}
