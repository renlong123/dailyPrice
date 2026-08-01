/**
 * 计算从购买日期到今天的天数
 */
export function getDaysUsed(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  purchase.setHours(0, 0, 0, 0)
  const diffMs = today.getTime() - purchase.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * 将已用天数格式化为「X年Y月Z天」的字符串
 */
export function formatDaysAsYMD(purchaseDate: string): string {
  const purchase = new Date(purchaseDate)
  const today = new Date()

  let years = today.getFullYear() - purchase.getFullYear()
  let months = today.getMonth() - purchase.getMonth()
  let days = today.getDate() - purchase.getDate()

  // 日期的借位处理
  if (days < 0) {
    months--
    // 获取上个月的天数
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
