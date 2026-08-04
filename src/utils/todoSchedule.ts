import type { TodoTask } from '../types'

/** 获取指定日期是周几（1=周一...7=周日） */
export function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  const jsDay = d.getDay() // 0=周日
  return jsDay === 0 ? 7 : jsDay
}

/** 判断指定日期待办是否应执行 */
export function isDueOn(task: TodoTask, dateStr: string): boolean {
  // 日期范围检查（含边界）
  if (dateStr < task.startDate) return false
  if (task.endDate && dateStr > task.endDate) return false

  // 周期匹配
  if (task.scheduleType === 'weekly') {
    return task.scheduleDays.includes(getDayOfWeek(dateStr))
  }
  // monthly: 直接比较日期数字
  const dayOfMonth = parseInt(dateStr.split('-')[2], 10)
  return task.scheduleDays.includes(dayOfMonth)
}

/** 判断指定日期待办是否已完成 */
export function isCompletedOn(task: TodoTask, dateStr: string): boolean {
  return task.completedDates.includes(dateStr)
}

/** 获取今日应执行的待办列表 */
export function getTodayTasks(tasks: TodoTask[], todayStr: string): TodoTask[] {
  return tasks.filter((t) => isDueOn(t, todayStr))
}

/** 周几数字 → 中文名称 */
const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/** 生成周期描述文字 */
export function getScheduleLabel(task: TodoTask): string {
  if (task.scheduleType === 'weekly') {
    if (task.scheduleDays.length === 7) return '每天'
    const names = task.scheduleDays.map((d) => WEEKDAY_NAMES[d - 1])
    return `每周 ${names.join('、')}`
  }
  const days = task.scheduleDays.map((d) => `${d}号`)
  return `每月 ${days.join('、')}`
}

export { WEEKDAY_NAMES }
