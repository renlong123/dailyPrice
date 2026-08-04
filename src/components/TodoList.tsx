import type { TodoTask } from '../types'
import { getLocalDateStr } from '../utils/todoStorage'
import { isCompletedOn } from '../utils/todoSchedule'
import TodoCard from './TodoCard'

interface TodoListProps {
  tasks: TodoTask[]
  loading: boolean
  onToggle: (id: number) => void
  onEdit: (task: TodoTask) => void
  onDelete: (task: TodoTask) => void
  onAdd: () => void
}

export default function TodoList({ tasks, loading, onToggle, onEdit, onDelete, onAdd }: TodoListProps) {
  const today = getLocalDateStr()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <span className="text-5xl">🗓️</span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">今天没有待办任务</p>
            <p className="text-xs text-gray-400 mt-1">
              点击右上角「添加待办」创建一个循环任务吧
            </p>
          </div>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            添加待办
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TodoCard
            key={task.id}
            task={task}
            completed={isCompletedOn(task, today)}
            onToggle={() => onToggle(task.id)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
      </div>
    </div>
  )
}
