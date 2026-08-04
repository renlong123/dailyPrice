import { useState, useCallback } from 'react'
import type { TodoTask, TodoFormData, TodoStats } from '../types'
import { formatDate } from '../utils/format'
import { getDayOfWeek, WEEKDAY_NAMES } from '../utils/todoSchedule'
import { getLocalDateStr } from '../utils/todoStorage'
import TodoList from '../components/TodoList'
import TodoForm from '../components/TodoForm'
import DeleteConfirm from '../components/DeleteConfirm'
import ErrorModal from '../components/ErrorModal'

interface TodoPageProps {
  todayTasks: TodoTask[]
  loading: boolean
  todoStats: TodoStats
  addTodo: (data: TodoFormData) => Promise<TodoTask>
  updateTodo: (id: number, data: TodoFormData) => Promise<void>
  deleteTodo: (id: number) => Promise<void>
  toggleTodo: (id: number) => Promise<void>
}

export default function TodoPage({ todayTasks, loading, todoStats, addTodo, updateTodo, deleteTodo, toggleTodo }: TodoPageProps) {
  const today = getLocalDateStr()
  const weekday = WEEKDAY_NAMES[getDayOfWeek(today) - 1]

  const [formState, setFormState] = useState<{ open: boolean; task: TodoTask | null }>({ open: false, task: null })
  const [deleteTarget, setDeleteTarget] = useState<TodoTask | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = useCallback(() => setFormState({ open: true, task: null }), [])
  const handleEdit = useCallback((task: TodoTask) => setFormState({ open: true, task }), [])

  const handleSubmit = useCallback(async (formData: TodoFormData) => {
    if (formState.task) {
      await updateTodo(formState.task.id, formData)
    } else {
      await addTodo(formData)
    }
    setFormState({ open: false, task: null })
  }, [formState.task, addTodo, updateTodo])

  const handleCloseForm = useCallback(() => setFormState({ open: false, task: null }), [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteTodo(deleteTarget.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteTodo])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
      {/* 页面标题栏 */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-800">✅ 今日待办</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(today)} · {weekday}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加待办
        </button>
      </div>

      {/* 完成进度条 */}
      {!loading && todoStats.todayTasks > 0 && (
        <div className="px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              今日完成 <span className="font-semibold text-emerald-600">{todoStats.todayCompleted}</span> / {todoStats.todayTasks}
            </span>
            <span className="font-semibold text-emerald-600">
              {Math.round(todoStats.completionRate * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${todoStats.completionRate * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <TodoList
        tasks={todayTasks}
        loading={loading}
        onToggle={toggleTodo}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onAdd={handleAdd}
      />

      {/* 弹窗 */}
      {formState.open && (
        <TodoForm
          task={formState.task}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          itemName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  )
}
