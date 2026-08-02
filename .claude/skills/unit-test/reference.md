# 测试配置与模板参考

此文件供 SKILL.md 引用，包含配置模板和测试写法范例。

## Vitest 配置（vite.config.ts 追加）

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

## 测试初始化文件（src/test-setup.ts）

```typescript
import '@testing-library/jest-dom'
```

## 测试模板

### 纯函数测试（src/utils/format.ts）

```typescript
import { describe, it, expect } from 'vitest'
import { getDaysUsed, getDailyCost, formatMoney, formatDate, formatDaysAsYMD } from '../utils/format'

describe('getDaysUsed', () => {
  it('应该正确计算已用天数', () => {
    // 用固定日期验证：假设"今天"与购买日期差 30 天
    // 使用 vi.useFakeTimers 控制当前时间
    const days = getDaysUsed('2024-01-01')  // 会是动态结果
    expect(days).toBeGreaterThan(0)          // 基础冒烟测试
  })

  it('未来日期应返回 0', () => {
    const days = getDaysUsed('2099-12-31')
    expect(days).toBe(0)
  })

  it('当天购买应返回 0 天', () => {
    // 使用 vi.setSystemTime 固定今天
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15'))
    expect(getDaysUsed('2026-07-15')).toBe(0)
    vi.useRealTimers()
  })
})

describe('formatMoney', () => {
  it('整数金额应保留两位小数', () => {
    expect(formatMoney(100)).toBe('¥100.00')
  })

  it('小数金额应正确格式化', () => {
    expect(formatMoney(99.5)).toBe('¥99.50')
  })

  it('大金额应有千分位', () => {
    expect(formatMoney(12345.67)).toBe('¥12,345.67')
  })

  it('零元应正确显示', () => {
    expect(formatMoney(0)).toBe('¥0.00')
  })
})
```

### 带 Mock 的 localStorage 测试（src/utils/storage.ts）

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { loadStore, addItem, getCategories } from '../utils/storage'

// 每次测试前清空 localStorage
beforeEach(() => {
  localStorage.clear()
})

describe('loadStore', () => {
  it('无数据时应返回默认空 store', () => {
    const store = loadStore()
    expect(store.items).toEqual([])
    expect(store.categories.length).toBe(7) // 默认 7 个分类
    expect(store.nextId).toBe(1)
  })

  it('有数据时应正确加载', () => {
    const mockData = {
      items: [{ id: 1, name: '测试', price: 100, purchaseDate: '2026-01-01', category: '其他', notes: '' }],
      categories: [{ id: 1, name: '测试分类', icon: '📌' }],
      nextId: 2,
    }
    localStorage.setItem('daily-expense-data', JSON.stringify(mockData))
    const store = loadStore()
    expect(store.items.length).toBe(1)
    expect(store.nextId).toBe(2)
  })
})

describe('addItem', () => {
  it('应正确添加物品并返回新 item', () => {
    const { item, store } = addItem({
      name: '新物品',
      price: 99.9,
      purchaseDate: '2026-07-01',
      category: '电子设备',
      notes: '测试备注',
    })
    expect(item.id).toBe(1)
    expect(item.name).toBe('新物品')
    expect(item.price).toBe(99.9)
    expect(store.items.length).toBe(1)
  })
})
```

### React 组件测试（src/components/ItemCard.tsx）

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ItemCard } from '../components/ItemCard'

// 组件测试需要提供完整的 props
describe('ItemCard', () => {
  it('应正确渲染物品信息', () => {
    const item = {
      id: 1,
      name: '测试物品',
      price: 100,
      purchaseDate: '2026-01-15',
      category: '电子设备',
      notes: '测试备注',
    }
    render(<ItemCard item={item} onEdit={() => {}} onDelete={() => {}} getCategoryIcon={() => '📱'} />)
    expect(screen.getByText('测试物品')).toBeInTheDocument()
    expect(screen.getByText(/¥100/)).toBeInTheDocument()
  })
})
```

## 常用断言速查

| 断言 | 用途 |
|------|------|
| `expect(x).toBe(y)` | 严格相等 |
| `expect(x).toEqual(y)` | 深度相等（对象/数组） |
| `expect(x).toBeGreaterThan(n)` | 大于 |
| `expect(x).toBeLessThan(n)` | 小于 |
| `expect(x).toContain(val)` | 数组包含 |
| `expect(fn).toThrow()` | 函数抛异常 |
| `expect(el).toBeInTheDocument()` | DOM 存在该元素 |
| `expect(el).toHaveTextContent(t)` | DOM 包含该文本 |
