import type { Item, ItemFormData, Category } from '../types'

const STORAGE_KEY = 'daily-expense-data'

// ========== 默认分类 ==========
const defaultCategories: Category[] = [
  { id: 1, name: '电子设备', icon: '📱' },
  { id: 2, name: '衣物', icon: '👔' },
  { id: 3, name: '家居', icon: '🏠' },
  { id: 4, name: '食品', icon: '🍔' },
  { id: 5, name: '交通', icon: '🚌' },
  { id: 6, name: '娱乐', icon: '🎮' },
  { id: 7, name: '其他', icon: '📦' },
]

// ========== 数据结构 ==========
interface StoreData {
  items: Item[]
  categories: Category[]
  nextId: number
}

function loadData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as StoreData
      return {
        items: data.items || [],
        categories: data.categories && data.categories.length > 0 ? data.categories : [...defaultCategories],
        nextId: data.nextId || 1,
      }
    }
  } catch (err) {
    console.error('加载数据失败:', err)
  }
  return { items: [], categories: [...defaultCategories], nextId: 1 }
}

function saveData(data: StoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('保存数据失败:', err)
  }
}

// ========== 物品 CRUD ==========
export function getItems(category?: string): Item[] {
  const data = loadData()
  let items = [...data.items]
  if (category) {
    items = items.filter((i) => i.category === category)
  }
  items.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
  return items
}

export function addItem(item: ItemFormData): Item {
  const data = loadData()
  const newItem: Item = {
    id: data.nextId++,
    name: item.name,
    price: Number(item.price),
    purchaseDate: item.purchaseDate,
    category: item.category || '其他',
    notes: item.notes || '',
  }
  data.items.push(newItem)
  saveData(data)
  return newItem
}

export function updateItem(id: number, updates: ItemFormData): void {
  const data = loadData()
  const index = data.items.findIndex((i) => i.id === id)
  if (index === -1) throw new Error(`物品 ID ${id} 不存在`)
  data.items[index] = {
    ...data.items[index],
    name: updates.name,
    price: Number(updates.price),
    purchaseDate: updates.purchaseDate,
    category: updates.category || '其他',
    notes: updates.notes || '',
  }
  saveData(data)
}

export function deleteItem(id: number): void {
  const data = loadData()
  const index = data.items.findIndex((i) => i.id === id)
  if (index === -1) throw new Error(`物品 ID ${id} 不存在`)
  data.items.splice(index, 1)
  saveData(data)
}

// ========== 分类管理 ==========
export function getCategories(): Category[] {
  const data = loadData()
  return [...data.categories]
}

export function addCategory(name: string, icon?: string): Category {
  const data = loadData()
  const maxId = data.categories.length > 0
    ? Math.max(...data.categories.map((c) => c.id))
    : 0
  const newCategory: Category = {
    id: maxId + 1,
    name,
    icon: icon || '📌',
  }
  data.categories.push(newCategory)
  saveData(data)
  return newCategory
}
