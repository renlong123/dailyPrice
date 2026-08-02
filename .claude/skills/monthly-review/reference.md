# 数据模型参考

此文件供 SKILL.md 引用，Claude 按需 Read 以理解数据结构。

## localStorage

- Key: `daily-expense-data`
- 存储位置：浏览器 `devtools → Application → Local Storage → localhost:5173`

## 数据结构

```typescript
interface StoreData {
  items: Item[]
  categories: Category[]
  nextId: number
}

interface Item {
  id: number
  name: string          // 物品名称
  price: number         // 购买价格（元），保留两位小数
  purchaseDate: string  // ISO 日期字符串，如 "2024-01-15"
  category: string      // 分类名称
  notes: string         // 备注
}

interface Category {
  id: number
  name: string          // 分类名
  icon: string          // Emoji 图标
}
```

## 预设分类

| emoji | 名称 |
|-------|------|
| 📱 | 电子设备 |
| 👔 | 衣物 |
| 🏠 | 家居 |
| 🍔 | 食品 |
| 🚌 | 交通 |
| 🎮 | 娱乐 |
| 📦 | 其他 |

用户可自定义新分类。

## 计算公式

### 已用天数（参考 src/utils/format.ts:getDaysUsed）

```
today = new Date() 的零点
purchase = new Date(purchaseDate + 'T00:00:00') 的零点
已用天数 = max(0, floor((today - purchase) / 86400000))
```

### 日均成本（参考 src/utils/format.ts:getDailyCost）

```
日均成本 = price / 已用天数  （当天购买时 = price 自身）
```

### 当月天数

```javascript
// 获取 YYYY-MM 的实际天数
new Date(parseInt(year), parseInt(month), 0).getDate()
// 例：new Date(2026, 2, 0).getDate() → 28（2026年2月）
```

### 环比变化

```
环比变化 = 本月值 - 上月值
环比变化率 = (本月值 - 上月值) / 上月值 × 100%
```
