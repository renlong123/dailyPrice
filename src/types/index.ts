// ========== 物品 ==========
export interface Item {
  id: number
  name: string
  price: number
  purchaseDate: string // ISO 日期字符串，如 "2024-01-15"
  category: string
  notes: string
}

// 添加/编辑物品时的表单数据（不含 id）
export interface ItemFormData {
  name: string
  price: number
  purchaseDate: string
  category: string
  notes: string
}

// ========== 分类 ==========
export interface Category {
  id: number
  name: string
  icon: string
}

// ========== 统计数据 ==========
export interface Stats {
  totalSpent: number    // 总消费金额
  itemCount: number     // 物品总数
  avgDailyCost: number  // 平均日均成本
}
