import { memo } from 'react'
import type { TodoTask } from '../types'
import { getScheduleLabel } from '../utils/todoSchedule'

interface TodoCardProps {
  task: TodoTask
  completed: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export default memo(function TodoCard({ task, completed, onToggle, onEdit, onDelete }: TodoCardProps) {
  const scheduleLabel = getScheduleLabel(task)

  return (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all group ${
        completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 勾选框 */}
        <button
          onClick={onToggle}
          className={`shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors ${
            completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
        >
          {completed && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              {scheduleLabel}
            </span>
            <span className="text-xs text-gray-400">
              {task.endDate
                ? `${task.startDate} 至 ${task.endDate}`
                : `${task.startDate} 起`}
            </span>
          </div>
          {task.notes && (
            <p className="text-xs text-gray-400 mt-1 truncate">{task.notes}</p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="编辑"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
})
