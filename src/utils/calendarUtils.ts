import type { TodoTask } from '../types'
import { isDueOn, isCompletedOn } from './todoSchedule'

/** 获取某月的天数 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 获取某月第一天是周几（0=周日...6=周六） */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** 格式化为 YYYY-MM-DD */
export function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

/** 当月每一天的任务完成信息 */
export interface DayCompletion {
  dateStr: string
  day: number        // 几号 (1-31)
  weekday: number    // 0=周日
  dueCount: number
  completedCount: number
  rate: number       // 0-1
}

/** 生成当月的每天完成数据 */
export function getMonthCompletions(year: number, month: number, tasks: TodoTask[]): DayCompletion[] {
  const daysInMonth = getDaysInMonth(year, month)
  const result: DayCompletion[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(year, month, d)
    const date = new Date(dateStr + 'T00:00:00')
    let dueCount = 0
    let completedCount = 0

    tasks.forEach((task) => {
      if (isDueOn(task, dateStr)) {
        dueCount++
        if (isCompletedOn(task, dateStr)) {
          completedCount++
        }
      }
    })

    result.push({
      dateStr,
      day: d,
      weekday: date.getDay(),
      dueCount,
      completedCount,
      rate: dueCount > 0 ? completedCount / dueCount : 0,
    })
  }

  return result
}

/** 当月中文名称 */
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export function getMonthName(month: number): string {
  return MONTH_NAMES[month]
}
