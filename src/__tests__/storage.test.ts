import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  STORAGE_KEY,
  defaultCategories,
  defaultEmojis,
  DEFAULT_CATEGORY_ICON,
  loadStore,
  saveStore,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  getCategories,
  addCategory,
} from '../utils/storage'
import type { Item, ItemFormData, StoreData } from '../utils/storage'

// ==================== 测试辅助 ====================

const sampleItem: Item = {
  id: 1,
  name: 'iPhone 15 Pro',
  price: 6999,
  purchaseDate: '2024-01-15',
  category: '电子设备',
  status: 'active',
  notes: '京东购买',
}

/** 直接向 localStorage 写入一份 store 数据 */
function seedStore(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ==================== 常量 ====================
describe('默认分类常量', () => {
  it('defaultCategories 应包含 7 个预设分类', () => {
    expect(defaultCategories).toHaveLength(7)
    expect(defaultCategories[0]).toEqual({ id: 1, name: '电子设备', icon: '📱' })
    expect(defaultCategories[6]).toEqual({ id: 7, name: '其他', icon: '📦' })
  })

  it('defaultEmojis 应提取全部默认分类的图标', () => {
    expect(defaultEmojis).toEqual(['📱', '👔', '🏠', '🍔', '🚌', '🎮', '📦'])
  })

  it('DEFAULT_CATEGORY_ICON 应为 📌', () => {
    expect(DEFAULT_CATEGORY_ICON).toBe('📌')
  })

  it('STORAGE_KEY 应为 daily-expense-data', () => {
    expect(STORAGE_KEY).toBe('daily-expense-data')
  })
})

// ==================== loadStore ====================
describe('loadStore', () => {
  it('无数据时应返回默认空 store', () => {
    const store = loadStore()
    expect(store.items).toEqual([])
    expect(store.categories).toEqual(defaultCategories)
    expect(store.nextId).toBe(1)
  })

  it('有完整数据时应正确解析', () => {
    const categories = [{ id: 1, name: '电子设备', icon: '📱' }]
    seedStore({ items: [sampleItem], categories, nextId: 2 })
    const store = loadStore()
    expect(store.items).toEqual([sampleItem])
    expect(store.categories).toEqual(categories)
    expect(store.nextId).toBe(2)
  })

  it('JSON 损坏时应返回默认 store 并打印错误', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = loadStore()
    expect(store).toEqual({ items: [], categories: defaultCategories, nextId: 1 })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('items 不是数组时应回退为空数组', () => {
    seedStore({ items: 'not-array' as unknown as Item[], categories: [], nextId: 1 })
    const store = loadStore()
    expect(store.items).toEqual([])
    expect(store.nextId).toBe(1)
  })

  it('categories 为空数组时应回退为默认分类', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    const store = loadStore()
    expect(store.categories).toEqual(defaultCategories)
    expect(store.items).toEqual([sampleItem])
    expect(store.nextId).toBe(2)
  })

  it('nextId 无效（0 或负数）时应从 items 最大 id 推导', () => {
    const item2 = { ...sampleItem, id: 5 }
    seedStore({ items: [sampleItem, item2], categories: [], nextId: 0 })
    expect(loadStore().nextId).toBe(6)
  })

  it('nextId 无效且 items 为空时应回退为 1', () => {
    seedStore({ items: [], categories: [], nextId: -5 })
    expect(loadStore().nextId).toBe(1)
  })

  it('nextId 为非数字时应从 items 推导', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 'x' as unknown as number })
    expect(loadStore().nextId).toBe(2)
  })

  it('无数据时返回的分类数组应是独立副本', () => {
    const store = loadStore()
    expect(store.categories).not.toBe(defaultCategories)
    store.categories.push({ id: 99, name: '临时', icon: 'x' })
    expect(defaultCategories).toHaveLength(7)
  })
})

// ==================== saveStore ====================
describe('saveStore', () => {
  it('正常保存应返回 true 并写入 localStorage', () => {
    const data: StoreData = { items: [sampleItem], categories: defaultCategories, nextId: 2 }
    expect(saveStore(data)).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(data)
  })

  it('setItem 抛错时应返回 false 而不抛出', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(saveStore({ items: [], categories: [], nextId: 1 })).toBe(false)
  })
})

// ==================== getItems ====================
describe('getItems', () => {
  it('无分类参数时应返回全部物品并按购买日期倒序', () => {
    const older = { ...sampleItem, id: 1, purchaseDate: '2024-01-15' }
    const newer = { ...sampleItem, id: 2, purchaseDate: '2026-07-01' }
    seedStore({ items: [older, newer], categories: [], nextId: 3 })
    const items = getItems()
    expect(items.map((i) => i.id)).toEqual([2, 1])
  })

  it('传入分类参数时应只返回该分类的物品', () => {
    const electronics = { ...sampleItem, id: 1, category: '电子设备' }
    const clothes = { ...sampleItem, id: 2, name: '外套', category: '衣物' }
    seedStore({ items: [electronics, clothes], categories: [], nextId: 3 })
    const items = getItems('电子设备')
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(1)
  })

  it('无数据时应返回空数组', () => {
    expect(getItems()).toEqual([])
    expect(getItems('电子设备')).toEqual([])
  })
})

// ==================== addItem ====================
describe('addItem', () => {
  it('应正常添加物品并持久化到 localStorage', () => {
    const formData: ItemFormData = {
      name: '机械键盘',
      price: 299.5,
      purchaseDate: '2026-07-01',
      category: '电子设备',
      notes: '',
    }
    const { item, store } = addItem(formData)
    expect(item).toMatchObject({ id: 1, name: '机械键盘', price: 299.5, purchaseDate: '2026-07-01', category: '电子设备', notes: '' })
    expect(store.items).toHaveLength(1)
    expect(store.nextId).toBe(2)
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(persisted.items[0].id).toBe(1)
    expect(persisted.nextId).toBe(2)
  })

  it('价格应四舍五入到两位小数', () => {
    const { item } = addItem({ name: 'x', price: 19.999, purchaseDate: '2026-01-01', category: 'a', notes: 'b' })
    expect(item.price).toBe(20)
  })

  it('分类为空时应回退为「其他」', () => {
    const { item } = addItem({ name: 'x', price: 1, purchaseDate: '2026-01-01', category: '', notes: 'b' })
    expect(item.category).toBe('其他')
  })

  it('备注为空时应回退为空字符串', () => {
    const { item } = addItem({ name: 'x', price: 1, purchaseDate: '2026-01-01', category: 'a', notes: '' })
    expect(item.notes).toBe('')
  })

  it('连续添加时 id 应自增', () => {
    addItem({ name: 'a', price: 1, purchaseDate: '2026-01-01', category: 'a', notes: '' })
    addItem({ name: 'b', price: 2, purchaseDate: '2026-01-02', category: 'a', notes: '' })
    const items = getItems()
    expect(items).toHaveLength(2)
    expect(items.map((i) => i.id).sort()).toEqual([1, 2])
  })
})

// ==================== updateItem ====================
describe('updateItem', () => {
  it('应更新物品字段并保留原 id', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    const { store } = updateItem(1, {
      name: 'iPhone 16 Pro',
      price: 7999.999,
      purchaseDate: '2026-01-01',
      category: '手机',
      notes: '新备注',
    })
    expect(store.items[0].id).toBe(1)
    expect(store.items[0].name).toBe('iPhone 16 Pro')
    expect(store.items[0].price).toBe(8000)
    expect(store.items[0].purchaseDate).toBe('2026-01-01')
    expect(store.items[0].category).toBe('手机')
    expect(store.items[0].notes).toBe('新备注')
  })

  it('分类和备注为空时应回退默认值', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    const { store } = updateItem(1, {
      name: 'x',
      price: 1,
      purchaseDate: '2026-01-01',
      category: '',
      notes: '',
    })
    expect(store.items[0].category).toBe('其他')
    expect(store.items[0].notes).toBe('')
  })

  it('更新的结果应持久化到 localStorage', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    updateItem(1, { name: '改名', price: 10, purchaseDate: '2026-01-01', category: 'a', notes: 'n' })
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(persisted.items[0].name).toBe('改名')
  })

  it('id 不存在时应抛出错误', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    expect(() =>
      updateItem(99, { name: 'x', price: 1, purchaseDate: '2026-01-01', category: 'a', notes: '' })
    ).toThrow('物品 ID 99 不存在')
  })
})

// ==================== deleteItem ====================
describe('deleteItem', () => {
  it('应删除指定物品并持久化', () => {
    const item2 = { ...sampleItem, id: 2, name: '外套' }
    seedStore({ items: [sampleItem, item2], categories: [], nextId: 3 })
    const { store } = deleteItem(1)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(2)
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(persisted.items.map((i: Item) => i.id)).toEqual([2])
  })

  it('id 不存在时应抛出错误', () => {
    seedStore({ items: [sampleItem], categories: [], nextId: 2 })
    expect(() => deleteItem(99)).toThrow('物品 ID 99 不存在')
  })
})

// ==================== getCategories ====================
describe('getCategories', () => {
  it('无数据时应返回 7 个默认分类', () => {
    expect(getCategories()).toEqual(defaultCategories)
  })

  it('有自定义分类时应返回存储的分类', () => {
    const categories = [{ id: 1, name: '宠物', icon: '🐱' }]
    seedStore({ items: [], categories, nextId: 1 })
    expect(getCategories()).toEqual(categories)
  })
})

// ==================== addCategory ====================
describe('addCategory', () => {
  it('应新增分类，id 在默认分类之后递增', () => {
    localStorage.clear()
    const { category, store } = addCategory('宠物', '🐱')
    expect(category).toEqual({ id: 8, name: '宠物', icon: '🐱' })
    expect(store.categories).toHaveLength(8)
    expect(store.categories[7]).toEqual(category)
  })

  it('不传图标时应使用默认图标 📌', () => {
    localStorage.clear()
    const { category } = addCategory('书籍')
    expect(category.icon).toBe(DEFAULT_CATEGORY_ICON)
  })

  it('分类名重复时应抛出错误', () => {
    localStorage.clear()
    addCategory('宠物')
    expect(() => addCategory('宠物', '🐶')).toThrow('分类「宠物」已存在')
    expect(getCategories()).toHaveLength(8)
  })

  it('存储中分类为空时，loadStore 会回退默认分类，新分类 id 应从默认最大值后递增', () => {
    // loadStore 对空 categories 有防御性回退（返回 7 个默认分类），因此该路径下 id 为 8
    seedStore({ items: [], categories: [], nextId: 1 })
    const { category } = addCategory('宠物')
    expect(category.id).toBe(8)
    expect(category.name).toBe('宠物')
  })
})
