import { useMemo } from 'react'
import type { TodoTask } from '../types'
import { getMonthCompletions, getFirstDayOfMonth, getDaysInMonth, getMonthName } from '../utils/calendarUtils'

interface TodoCalendarProps {
  year: number
  tasks: TodoTask[]
  selectedDate: string | null
  todayStr: string
  onSelectDate: (dateStr: string) => void
}

const CIRCLE_R = 5.5
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R  // ≈ 34.56

function RingCell({ rate, dueCount, isToday }: { rate: number; dueCount: number; isToday: boolean }) {
  // 无任务：浅灰空心圈
  if (dueCount === 0) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="block">
        <circle cx="8" cy="8" r={CIRCLE_R} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      </svg>
    )
  }

  // 颜色：绿 ≥100%，黄 ≥50%，红 >0%
  let color = '#ef4444'  // red
  if (rate >= 1) color = '#10b981'      // green
  else if (rate >= 0.5) color = '#f59e0b'  // yellow

  const dashOffset = CIRCUMFERENCE * (1 - Math.max(0.05, rate))  // min 5% visible if >0

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="block">
      {/* 背景圈 */}
      <circle cx="8" cy="8" r={CIRCLE_R} fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
      {/* 进度弧 */}
      <circle
        cx="8" cy="8" r={CIRCLE_R}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 8 8)"
        style={{ transition: 'stroke-dashoffset 0.3s, stroke 0.3s' }}
      />
      {/* 今日标记 */}
      {isToday && (
        <circle cx="8" cy="8" r="2" fill="#3b82f6" />
      )}
    </svg>
  )
}

/** 单月迷你日历 */
function MonthBlock({
  year, month, tasks, todayStr, selectedDate, onSelectDate,
}: {
  year: number; month: number; tasks: TodoTask[]
  todayStr: string; selectedDate: string | null
  onSelectDate: (d: string) => void
}) {
  const completions = useMemo(
    () => getMonthCompletions(year, month, tasks),
    [year, month, tasks],
  )
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="flex flex-col items-center">
      {/* 月份名 */}
      <div className="text-xs font-medium text-gray-500 mb-1">{getMonthName(month)}</div>
      {/* 星期头 */}
      <div className="grid grid-cols-7 gap-px mb-0.5">
        {['日','一','二','三','四','五','六'].map((h) => (
          <div key={h} className="w-4 text-center text-[10px] text-gray-300 leading-tight">{h}</div>
        ))}
      </div>
      {/* 日期格 */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div key={i} className="w-4 h-4 flex items-center justify-center">
            {day !== null && (() => {
              const comp = completions[day - 1]
              const isToday = comp.dateStr === todayStr
              const isSel = comp.dateStr === selectedDate
              return (
                <button
                  onClick={() => onSelectDate(comp.dateStr)}
                  title={`${comp.dateStr}\n${comp.completedCount}/${comp.dueCount} 完成`}
                  className={`rounded-full transition-all hover:scale-125 ${
                    isSel ? 'ring-1 ring-primary-400 ring-offset-0' : ''
                  }`}
                >
                  <RingCell rate={comp.rate} dueCount={comp.dueCount} isToday={isToday} />
                </button>
              )
            })()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TodoCalendar({ year, tasks, selectedDate, todayStr, onSelectDate }: TodoCalendarProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{year}年</div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-4 max-w-2xl mx-auto">
        {Array.from({ length: 12 }, (_, m) => (
          <MonthBlock
            key={m}
            year={year}
            month={m}
            tasks={tasks}
            todayStr={todayStr}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> 全部完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> ≥50%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" /> &lt;50%
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="none" stroke="#e5e7eb" strokeWidth="1"/></svg>
          无任务
        </span>
      </div>
    </div>
  )
}
