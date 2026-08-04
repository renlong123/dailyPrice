import { useState, useCallback, useEffect, useMemo } from 'react'
import { useItems } from './hooks/useItems'
import { useTodos } from './hooks/useTodos'
import type { DisplayFormat } from './utils/format'
import type { Page } from './components/Sidebar'
import Layout from './components/Layout'
import ErrorModal from './components/ErrorModal'
import HomePage from './pages/HomePage'
import ExpensePage from './pages/ExpensePage'
import TodoPage from './pages/TodoPage'

const SETTINGS_KEY = 'daily-expense-settings'

function loadFormat(): DisplayFormat {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const settings = JSON.parse(raw)
      if (settings.displayFormat === 'days' || settings.displayFormat === 'ymd') {
        return settings.displayFormat
      }
    }
  } catch { /* ignore */ }
  return 'ymd'
}

function saveFormat(format: DisplayFormat) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ displayFormat: format }))
  } catch { /* ignore */ }
}

export default function App() {
  const expenseData = useItems()
  const todoData = useTodos()

  // 页面导航
  const [currentPage, setCurrentPage] = useState<Page>('home')

  // 时间展示格式（全局偏好）
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>(loadFormat)

  useEffect(() => {
    saveFormat(displayFormat)
  }, [displayFormat])

  const toggleFormat = useCallback(() => {
    setDisplayFormat((prev) => (prev === 'ymd' ? 'days' : 'ymd'))
  }, [])

  // 全局错误处理
  const [error, setError] = useState<string | null>(null)

  // 最近添加的物品（按 purchaseDate 倒序取前 5 件）
  const recentItems = useMemo(() => {
    const sorted = [...expenseData.items].sort((a, b) => {
      const da = new Date(a.purchaseDate + 'T00:00:00').getTime()
      const db = new Date(b.purchaseDate + 'T00:00:00').getTime()
      return db - da
    })
    return sorted.slice(0, 5)
  }, [expenseData.items])

  // 带全局错误捕获的 deleteItem 包装
  const safeDeleteItem = useCallback(async (id: number) => {
    try {
      await expenseData.deleteItem(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }, [expenseData.deleteItem])

  const safeDeleteTodo = useCallback(async (id: number) => {
    try {
      await todoData.deleteTodo(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除待办失败')
    }
  }, [todoData.deleteTodo])

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'home' && (
        <HomePage
          stats={expenseData.stats}
          recentItems={recentItems}
          todayTasks={todoData.todayTasks}
          todoStats={todoData.todoStats}
          displayFormat={displayFormat}
          onNavigate={setCurrentPage}
          onToggleTodo={todoData.toggleTodo}
        />
      )}

      {currentPage === 'expenses' && (
        <ExpensePage
          items={expenseData.items}
          categories={expenseData.categories}
          selectedCategory={expenseData.selectedCategory}
          setSelectedCategory={expenseData.setSelectedCategory}
          loading={expenseData.loading}
          stats={expenseData.stats}
          displayFormat={displayFormat}
          onToggleFormat={toggleFormat}
          addItem={expenseData.addItem}
          updateItem={expenseData.updateItem}
          deleteItem={safeDeleteItem}
          addCategory={expenseData.addCategory}
        />
      )}

      {currentPage === 'todos' && (
        <TodoPage
          todayTasks={todoData.todayTasks}
          loading={todoData.loading}
          todoStats={todoData.todoStats}
          addTodo={todoData.addTodo}
          updateTodo={todoData.updateTodo}
          deleteTodo={safeDeleteTodo}
          toggleTodo={todoData.toggleTodo}
        />
      )}

      {/* 全局错误提示 */}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </Layout>
  )
}
