/** 物品状态 */
export type ItemStatus = 'active' | 'sold'

// ========== 物品 ==========
export interface Item {
  id: number
  name: string
  price: number
  purchaseDate: string  // ISO 日期字符串，如 "2024-01-15"
  category: string
  status: ItemStatus    // 使用中 / 已卖出
  sellPrice?: number    // 卖出价格（仅 status=sold 时有意义）
  notes: string
}

// 添加/编辑物品时的表单数据（不含 id）
export interface ItemFormData {
  name: string
  price: number
  purchaseDate: string
  category: string
  status: ItemStatus
  sellPrice?: number
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

// ========== 待办任务 ==========
export interface TodoTask {
  id: number
  name: string
  scheduleType: 'weekly' | 'monthly'   // 按周 / 按月
  scheduleDays: number[]               // 周：1-7（1=周一），月：1-31
  startDate: string                    // ISO 日期，有效期起始
  endDate: string | null               // null = 永不结束
  completedDates: string[]             // 已完成的日期列表
  createdAt: string                    // 创建日期
  notes: string
}

/** 添加/编辑待办时的表单数据（不含 id） */
export interface TodoFormData {
  name: string
  scheduleType: 'weekly' | 'monthly'
  scheduleDays: number[]
  startDate: string
  endDate: string | null
  notes: string
}

/** 待办统计数据 */
export interface TodoStats {
  totalTasks: number
  todayTasks: number
  todayCompleted: number
  completionRate: number  // 0-1
}
