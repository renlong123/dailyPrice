import { useMemo } from 'react'
import type { TodoTask } from '../types'
import { getMonthCompletions, getFirstDayOfMonth, getDaysInMonth, getMonthName } from '../utils/calendarUtils'

const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六']

interface TodoCalendarProps {
  year: number
  month: number  // 0-11
  tasks: TodoTask[]
  selectedDate: string | null
  todayStr: string
  onSelectDate: (dateStr: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export default function TodoCalendar({
  year, month, tasks, selectedDate, todayStr,
  onSelectDate, onPrevMonth, onNextMonth,
}: TodoCalendarProps) {
  const completions = useMemo(
    () => getMonthCompletions(year, month, tasks),
    [year, month, tasks],
  )

  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)

  // 构建日历格子（含前导空白）
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // 补齐到 6 行
  while (cells.length < 42) cells.push(null)

  function getCircleStyle(comp: { dueCount: number; rate: number }): string {
    if (comp.dueCount === 0) return ''  // 无任务，无圈
    if (comp.rate === 1) return 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-700'
    if (comp.rate > 0) return 'ring-2 ring-emerald-400 bg-emerald-50 text-emerald-600'
    return 'ring-2 ring-orange-300 bg-orange-50 text-orange-600'
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* 月份导航 */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
        <button onClick={onPrevMonth} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {year}年 {getMonthName(month)}
        </span>
        <button onClick={onNextMonth} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 日历网格 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* 星期标题 */}
          {WEEKDAY_HEADERS.map((h) => (
            <div key={h} className="text-center text-xs font-medium text-gray-400 py-2">
              {h}
            </div>
          ))}

          {/* 日期格子 */}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} className="aspect-square" />

            const comp = completions[day - 1]
            const dateStr = comp.dateStr
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const circleStyle = getCircleStyle(comp)

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors relative
                  ${circleStyle}
                  ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50 text-primary-700' : ''}
                  ${isToday && !isSelected ? 'font-bold text-primary-600' : ''}
                  ${!circleStyle ? 'text-gray-400 hover:bg-gray-100' : 'hover:opacity-80'}
                `}
              >
                {day}
                {/* 今日小圆点 */}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 px-5 py-2 bg-white border-t border-gray-100 shrink-0 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full ring-2 ring-emerald-500 bg-emerald-100" /> 全部完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full ring-2 ring-emerald-400 bg-emerald-50" /> 部分完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full ring-2 ring-orange-300 bg-orange-50" /> 未完成
        </span>
      </div>
    </div>
  )
}
