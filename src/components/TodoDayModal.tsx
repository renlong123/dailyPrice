import type { TodoTask } from '../types'
import { formatDate } from '../utils/format'
import { isCompletedOn, getScheduleLabel, WEEKDAY_NAMES, getDayOfWeek } from '../utils/todoSchedule'
import Modal from './Modal'

interface TodoDayModalProps {
  dateStr: string
  tasks: TodoTask[]        // 当天应执行的任务
  onToggle: (id: number) => Promise<void>
  onClose: () => void
}

export default function TodoDayModal({ dateStr, tasks, onToggle, onClose }: TodoDayModalProps) {
  const weekday = WEEKDAY_NAMES[getDayOfWeek(dateStr) - 1]
  const completedCount = tasks.filter((t) => isCompletedOn(t, dateStr)).length

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 max-h-[80vh] flex flex-col">
        {/* 标题 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {formatDate(dateStr)} · {weekday}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {tasks.length > 0
                ? `已完成 ${completedCount} / ${tasks.length} 项`
                : '当天无待办任务'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 任务列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-3xl">🎉</span>
              <p className="text-sm mt-2">这一天没有待办任务</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const completed = isCompletedOn(task, dateStr)
                return (
                  <button
                    key={task.id}
                    onClick={() => onToggle(task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                      completed
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {completed && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{getScheduleLabel(task)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
