import { useState, useCallback } from 'react'
import type { TodoTask, TodoFormData, TodoStats } from '../types'
import { formatDate } from '../utils/format'
import { getDayOfWeek, WEEKDAY_NAMES, isDueOn } from '../utils/todoSchedule'
import { getLocalDateStr } from '../utils/todoStorage'
import TodoList from '../components/TodoList'
import TodoForm from '../components/TodoForm'
import TodoCalendar from '../components/TodoCalendar'
import TodoDayModal from '../components/TodoDayModal'
import DeleteConfirm from '../components/DeleteConfirm'
import ErrorModal from '../components/ErrorModal'

type ViewMode = 'list' | 'calendar'

interface TodoPageProps {
  allTasks: TodoTask[]
  todayTasks: TodoTask[]
  loading: boolean
  todoStats: TodoStats
  addTodo: (data: TodoFormData) => Promise<TodoTask>
  updateTodo: (id: number, data: TodoFormData) => Promise<void>
  deleteTodo: (id: number) => Promise<void>
  toggleTodo: (id: number, dateStr?: string) => Promise<void>
}

export default function TodoPage({ allTasks, todayTasks, loading, todoStats, addTodo, updateTodo, deleteTodo, toggleTodo }: TodoPageProps) {
  const today = getLocalDateStr()
  const weekday = WEEKDAY_NAMES[getDayOfWeek(today) - 1]

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [formState, setFormState] = useState<{ open: boolean; task: TodoTask | null }>({ open: false, task: null })
  const [deleteTarget, setDeleteTarget] = useState<TodoTask | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 日历状态
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())  // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  // 日历导航
  const prevMonth = () => setCalMonth((m) => m === 0 ? (setCalYear((y) => y - 1), 11) : m - 1)
  const nextMonth = () => setCalMonth((m) => m === 11 ? (setCalYear((y) => y + 1), 0) : m + 1)
  const goToday = () => {
    const d = new Date()
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
  }

  // 选中日期的任务
  const selectedTasks = selectedDate
    ? allTasks.filter((t) => isDueOn(t, selectedDate))
    : []

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
      {/* 页面标题栏 */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-800">✅ 每日待办</h2>
          {/* 视图切换 */}
          <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              今日列表
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'calendar' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              日历视图
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'calendar' && (
            <button
              onClick={goToday}
              className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              今天
            </button>
          )}
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
      </div>

      {viewMode === 'list' ? (
        <>
          {/* 今日进度条 */}
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

          <div className="text-xs text-gray-400 px-5 py-2">
            {formatDate(today)} · {weekday}
          </div>

          <TodoList
            tasks={todayTasks}
            loading={loading}
            onToggle={toggleTodo}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onAdd={handleAdd}
          />
        </>
      ) : (
        <TodoCalendar
          year={calYear}
          month={calMonth}
          tasks={allTasks}
          selectedDate={selectedDate}
          todayStr={today}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
      )}

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

      {/* 日期详情弹窗 */}
      {selectedDate && (
        <TodoDayModal
          dateStr={selectedDate}
          tasks={selectedTasks}
          onToggle={(id) => toggleTodo(id, selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
