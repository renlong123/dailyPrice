import type { Item, Stats, TodoTask, TodoStats } from '../types'
import { formatDate, formatMoney } from '../utils/format'
import { getDayOfWeek, WEEKDAY_NAMES, isCompletedOn } from '../utils/todoSchedule'
import { getLocalDateStr } from '../utils/todoStorage'
import ItemCard from '../components/ItemCard'

interface HomePageProps {
  stats: Stats
  recentItems: Item[]
  todayTasks: TodoTask[]
  todoStats: TodoStats
  displayFormat: 'ymd' | 'days'
  onNavigate: (page: 'expenses' | 'todos') => void
  onToggleTodo: (id: number) => Promise<void>
}

export default function HomePage({ stats, recentItems, todayTasks, todoStats, displayFormat, onNavigate, onToggleTodo }: HomePageProps) {
  const today = getLocalDateStr()
  const weekday = WEEKDAY_NAMES[getDayOfWeek(today) - 1]

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 flex flex-col gap-4">

        {/* 日期问候 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-0.5">今天</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatDate(today)} · {weekday}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-primary-600 mb-0.5">💰 总消费</p>
            <p className="text-lg font-bold text-primary-700">{formatMoney(stats.totalSpent)}</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-amber-600 mb-0.5">📦 物品数量</p>
            <p className="text-lg font-bold text-amber-700">{stats.itemCount} <span className="text-sm font-normal">件</span></p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-emerald-600 mb-0.5">📊 平均日均</p>
            <p className="text-lg font-bold text-emerald-700">{formatMoney(stats.avgDailyCost)}<span className="text-xs font-normal">/天</span></p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-emerald-600 mb-0.5">✅ 今日待办</p>
            {todoStats.todayTasks > 0 ? (
              <p className="text-lg font-bold text-emerald-700">
                {todoStats.todayCompleted}/{todoStats.todayTasks}
                <span className="text-xs font-normal ml-1">
                  ({Math.round(todoStats.completionRate * 100)}%)
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">暂无任务</p>
            )}
          </div>
        </div>

        {/* 快捷操作 + 今日待办 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 快捷操作 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">⚡ 快捷操作</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate('expenses')}
                className="flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                <span>💰</span> 记录新开销
              </button>
              <button
                onClick={() => onNavigate('todos')}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <span>✅</span> 管理待办任务
              </button>
            </div>
          </div>

          {/* 今日待办概览 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">✅ 今日待办</h3>
              <button
                onClick={() => onNavigate('todos')}
                className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            {todayTasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {todayTasks.slice(0, 3).map((task) => {
                  const completed = isCompletedOn(task, today)
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleTodo(task.id)}
                      className="flex items-center gap-2.5 text-left hover:bg-gray-50 -mx-1 px-1 py-1 rounded-lg transition-colors"
                    >
                      <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                      }`}>
                        {completed && (
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.name}
                      </span>
                    </button>
                  )
                })}
                {todayTasks.length > 3 && (
                  <p className="text-xs text-gray-400 mt-1">还有 {todayTasks.length - 3} 项任务...</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">今天没有待办任务 🎉</p>
            )}
          </div>
        </div>

        {/* 最近添加的物品 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">📝 最近添加的物品</h3>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
            >
              查看全部 →
            </button>
          </div>
          {recentItems.length > 0 ? (
            <div className="grid gap-3">
              {recentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  displayFormat={displayFormat}
                  onEdit={() => onNavigate('expenses')}
                  onDelete={() => {}}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">暂无物品记录</p>
          )}
        </div>

      </div>
    </div>
  )
}
