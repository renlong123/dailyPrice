import { useState, useEffect, useCallback, useMemo } from 'react'
import type { TodoTask, TodoFormData, TodoStats } from '../types'
import {
  loadTodoStore,
  addTodo as storageAddTodo,
  updateTodo as storageUpdateTodo,
  deleteTodo as storageDeleteTodo,
  toggleTodoComplete as storageToggleComplete,
  isTaskActiveToday,
  getLocalDateStr,
  TODO_STORAGE_KEY,
} from '../utils/todoStorage'

function computeTodoStats(tasks: TodoTask[]): TodoStats {
  const todayTasks = tasks.filter(isTaskActiveToday)
  const todayCompleted = todayTasks.filter((t) => t.completedDates.includes(getLocalDateStr()))

  return {
    totalTasks: tasks.length,
    todayTasks: todayTasks.length,
    todayCompleted: todayCompleted.length,
    completionRate: todayTasks.length > 0 ? todayCompleted.length / todayTasks.length : 0,
  }
}

// ========== Hook ==========
export function useTodos() {
  const [allTasks, setAllTasks] = useState<TodoTask[]>([])
  const [loading, setLoading] = useState(true)

  // 一次性加载全部数据
  const loadData = useCallback(() => {
    try {
      const store = loadTodoStore()
      setAllTasks(store.tasks)
    } catch (err) {
      console.error('加载待办数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 多标签页同步
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TODO_STORAGE_KEY && e.newValue) {
        loadData()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [loadData])

  // 今日待办列表
  const todayTasks = useMemo(() => allTasks.filter(isTaskActiveToday), [allTasks])

  // 统计数据
  const todoStats = useMemo(() => computeTodoStats(allTasks), [allTasks])

  // 添加待办
  const addTodo = useCallback(async (formData: TodoFormData) => {
    const { task, store } = storageAddTodo(formData)
    setAllTasks(store.tasks)
    return task
  }, [])

  // 更新待办
  const updateTodo = useCallback(async (id: number, formData: TodoFormData) => {
    const { store } = storageUpdateTodo(id, formData)
    setAllTasks(store.tasks)
  }, [])

  // 删除待办
  const deleteTodo = useCallback(async (id: number) => {
    const { store } = storageDeleteTodo(id)
    setAllTasks(store.tasks)
  }, [])

  // 切换完成状态（默认今天，可指定日期）
  const toggleTodo = useCallback(async (id: number, dateStr?: string) => {
    const date = dateStr || getLocalDateStr()
    const { store } = storageToggleComplete(id, date)
    setAllTasks(store.tasks)
  }, [])

  return {
    allTasks,
    todayTasks,
    loading,
    todoStats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refresh: loadData,
  }
}
