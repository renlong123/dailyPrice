/**
 * 安全解析日期字符串为本地时间的 Date 对象
 * 'YYYY-MM-DD' 默认被 JS 解析为 UTC 午夜，加 'T00:00:00' 强制本地时区
 */
function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/** 获取今天的本地日期零点 */
function getTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * 计算从购买日期到今天的天数
 */
export function getDaysUsed(purchaseDate: string): number {
  const purchase = parseLocalDate(purchaseDate)
  const today = getTodayLocal()
  const diffMs = today.getTime() - purchase.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * 计算日均成本（当天购买时 = 物品价格）
 */
export function getDailyCost(price: number, purchaseDate: string): number {
  const days = getDaysUsed(purchaseDate)
  return days > 0 ? price / days : price
}

/**
 * 格式化日期为中文
 */
export function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化金额
 * 先用 Math.round 消除浮点精度问题，再用 toLocaleString 展示千分位
 */
export function formatMoney(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return `¥${rounded.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 将已用天数格式化为「X年Y月Z天」的字符串
 * 与 getDaysUsed 使用相同的日期解析方式，确保一致性
 */
export function formatDaysAsYMD(purchaseDate: string): string {
  const purchase = parseLocalDate(purchaseDate)
  const today = getTodayLocal()

  // 未来日期：返回 0天（与 getDaysUsed 的 Math.max(0, ...) 保持一致）
  if (purchase.getTime() > today.getTime()) {
    return '0天'
  }

  let years = today.getFullYear() - purchase.getFullYear()
  let months = today.getMonth() - purchase.getMonth()
  let days = today.getDate() - purchase.getDate()

  // 日期的借位处理
  if (days < 0) {
    months--
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  // 构建展示字符串
  const parts: string[] = []
  if (years > 0) parts.push(`${years}年`)
  if (months > 0) parts.push(`${months}个月`)
  if (days > 0 || parts.length === 0) parts.push(`${days}天`)

  return parts.join('')
}

/** 展示格式类型 */
export type DisplayFormat = 'days' | 'ymd'
