import { useMemo } from 'react'
import type { TodoTask } from '../types'
import { getMonthCompletions, getFirstDayOfMonth, getDaysInMonth, getMonthName } from '../utils/calendarUtils'

interface TodoCalendarProps {
  year: number
  tasks: TodoTask[]
  selectedDate: string | null
  todayStr: string
  onSelectDate: (dateStr: string) => void
  onPrevYear: () => void
  onNextYear: () => void
}

const SIZE = 24
const CX = 12
const CIRCLE_R = 9
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R

function DayCell({ day, rate, dueCount, isToday, isSel, isPast }: {
  day: number; rate: number; dueCount: number; isToday: boolean; isSel: boolean; isPast: boolean
}) {
  // 无任务 或 未来日期 → 不显示圆环，只显示数字
  if (dueCount === 0 || !isPast) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
        {/* 选中背景 */}
        {isSel && (
          <circle cx={CX} cy={CX} r={CIRCLE_R + 1} fill="#dbeafe" />
        )}
        {isToday && (
          <circle cx={CX} cy={CX} r={CIRCLE_R + 1} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        )}
        <text x={CX} y={CX + 0.5} textAnchor="middle" dominantBaseline="central"
          fill="#1f2937" fontSize="9" fontWeight={isToday ? 700 : 400}>
          {day}
        </text>
      </svg>
    )
  }

  // 有任务 + 已过去 → 显示进度圆环
  let color = '#ef4444'
  let bg = '#fef2f2'
  if (rate >= 1) { color = '#10b981'; bg = '#ecfdf5' }
  else if (rate >= 0.5) { color = '#f59e0b'; bg = '#fffbeb' }

  const dashOffset = CIRCUMFERENCE * (1 - Math.max(0.05, rate))

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
      {isSel && (
        <circle cx={CX} cy={CX} r={CIRCLE_R + 1.5} fill="#dbeafe" />
      )}
      <circle cx={CX} cy={CX} r={CIRCLE_R} fill={bg} stroke="#e5e7eb" strokeWidth="1" />
      <circle
        cx={CX} cy={CX} r={CIRCLE_R}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${CX} ${CX})`}
        style={{ transition: 'stroke-dashoffset 0.3s, stroke 0.3s' }}
      />
      {isToday && !isSel && (
        <circle cx={CX} cy={CX} r={CIRCLE_R + 1} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      )}
      <text x={CX} y={CX + 0.5} textAnchor="middle" dominantBaseline="central"
        fill="#1f2937" fontSize="9" fontWeight={isToday ? 700 : 500}>
        {day}
      </text>
    </svg>
  )
}

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
    <div className="flex flex-col">
      <div className="text-xs font-semibold text-gray-600 mb-1 ml-0.5">{getMonthName(month)}</div>
      <div className="grid grid-cols-7 gap-1">
        {['日','一','二','三','四','五','六'].map((h) => (
          <div key={h} className="flex items-center justify-center">
            <span className="text-[10px] text-gray-400 w-6 text-center">{h}</span>
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day !== null ? (() => {
              const comp = completions[day - 1]
              const isToday = comp.dateStr === todayStr
              const isSel = comp.dateStr === selectedDate
              const isPast = comp.dateStr <= todayStr
              return (
                <button
                  onClick={() => onSelectDate(comp.dateStr)}
                  title={`${comp.dateStr}\n${comp.completedCount}/${comp.dueCount} 完成`}
                  className="rounded-full transition-transform hover:scale-110"
                >
                  <DayCell
                    day={day}
                    rate={comp.rate}
                    dueCount={comp.dueCount}
                    isToday={isToday}
                    isSel={isSel}
                    isPast={isPast}
                  />
                </button>
              )
            })() : <div className="w-6 h-6" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TodoCalendar({ year, tasks, selectedDate, todayStr, onSelectDate, onPrevYear, onNextYear }: TodoCalendarProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* 年份导航 */}
      <div className="flex items-center justify-center gap-4 py-3 bg-white border-b border-gray-100 shrink-0 sticky top-0">
        <button onClick={onPrevYear} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700 w-20 text-center">{year}年</span>
        <button onClick={onNextYear} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-x-6 gap-y-5 p-5">
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
      <div className="flex items-center justify-center gap-5 pb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> 全部完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> ≥50%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" /> &lt;50%
        </span>
      </div>
    </div>
  )
}
