import type { TodoTask, TodoFormData } from '../types'

export const TODO_STORAGE_KEY = 'daily-expense-todos'

// ========== 辅助函数 ==========

/** 获取本地日期字符串 "YYYY-MM-DD" */
export function getLocalDateStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 判断某个待办今天是否应该执行 */
export function isTaskActiveToday(task: TodoTask): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = getLocalDateStr()

  // 检查日期范围
  if (task.startDate > todayStr) return false
  if (task.endDate && task.endDate < todayStr) return false

  // 检查循环规则
  if (task.scheduleType === 'weekly') {
    // JS getDay(): 0=周日, 转为 1=周一 ... 7=周日
    const jsDay = today.getDay()
    const monday = jsDay === 0 ? 7 : jsDay
    return task.scheduleDays.includes(monday)
  } else {
    const dayOfMonth = today.getDate()
    return task.scheduleDays.includes(dayOfMonth)
  }
}

// ========== 数据结构 ==========
interface TodoStoreData {
  tasks: TodoTask[]
  nextId: number
}

export function loadTodoStore(): TodoStoreData {
  try {
    const raw = localStorage.getItem(TODO_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as TodoStoreData
      return {
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        nextId: typeof data.nextId === 'number' && data.nextId > 0
          ? data.nextId
          : (Array.isArray(data.tasks) && data.tasks.length > 0
            ? Math.max(...data.tasks.map((t) => t.id)) + 1
            : 1),
      }
    }
  } catch (err) {
    console.error('加载待办数据失败:', err)
  }
  return { tasks: [], nextId: 1 }
}

export function saveTodoStore(data: TodoStoreData): boolean {
  try {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (err) {
    console.error('保存待办数据失败:', err)
    return false
  }
}

// ========== 待办 CRUD ==========

export function getTodos(): TodoTask[] {
  const store = loadTodoStore()
  return store.tasks.sort((a, b) => {
    const da = new Date(a.createdAt + 'T00:00:00').getTime()
    const db = new Date(b.createdAt + 'T00:00:00').getTime()
    return db - da
  })
}

export function addTodo(formData: TodoFormData): { task: TodoTask; store: TodoStoreData } {
  const store = loadTodoStore()
  const newTask: TodoTask = {
    id: store.nextId++,
    name: formData.name,
    scheduleType: formData.scheduleType,
    scheduleDays: [...formData.scheduleDays].sort((a, b) => a - b),
    startDate: formData.startDate,
    endDate: formData.endDate || null,
    completedDates: [],
    createdAt: getLocalDateStr(),
    notes: formData.notes || '',
  }
  store.tasks.push(newTask)
  saveTodoStore(store)
  return { task: newTask, store }
}

export function updateTodo(id: number, formData: TodoFormData): { store: TodoStoreData } {
  const store = loadTodoStore()
  const index = store.tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error(`待办 ID ${id} 不存在`)
  store.tasks[index] = {
    ...store.tasks[index],
    name: formData.name,
    scheduleType: formData.scheduleType,
    scheduleDays: [...formData.scheduleDays].sort((a, b) => a - b),
    startDate: formData.startDate,
    endDate: formData.endDate || null,
    notes: formData.notes || '',
  }
  saveTodoStore(store)
  return { store }
}

export function deleteTodo(id: number): { store: TodoStoreData } {
  const store = loadTodoStore()
  const index = store.tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error(`待办 ID ${id} 不存在`)
  store.tasks.splice(index, 1)
  saveTodoStore(store)
  return { store }
}

/** 切换某一天的完成状态 */
export function toggleTodoComplete(id: number, dateStr: string): { store: TodoStoreData } {
  const store = loadTodoStore()
  const index = store.tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error(`待办 ID ${id} 不存在`)
  const task = store.tasks[index]
  const completedIndex = task.completedDates.indexOf(dateStr)
  if (completedIndex === -1) {
    task.completedDates.push(dateStr)
  } else {
    task.completedDates.splice(completedIndex, 1)
  }
  saveTodoStore(store)
  return { store }
}
