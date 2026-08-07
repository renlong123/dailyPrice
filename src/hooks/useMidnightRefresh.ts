import { useEffect, useRef, useCallback } from 'react'
import { getLocalDateStr } from '../utils/todoStorage'

/**
 * 跨天自动刷新：日期变化时触发回调
 * - 午夜定时器：到达午夜自动刷新
 * - 窗口聚焦/标签切回：休眠唤醒或切标签回来后检查
 */
export function useMidnightRefresh(onDateChange: () => void) {
  const lastDateRef = useRef(getLocalDateStr())

  // 刷新并更新记录的日期
  const refreshIfDateChanged = useCallback(() => {
    const today = getLocalDateStr()
    if (today !== lastDateRef.current) {
      lastDateRef.current = today
      onDateChange()
    }
  }, [onDateChange])

  useEffect(() => {
    // 计算到下一个午夜的毫秒数
    function getMsUntilMidnight(): number {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      return midnight.getTime() - now.getTime()
    }

    let timer: ReturnType<typeof setTimeout>

    function scheduleMidnight() {
      const ms = getMsUntilMidnight()
      // 防止极端情况 ms<0（刚好跨天瞬间）
      timer = setTimeout(() => {
        refreshIfDateChanged()
        // 之后每 24 小时检查一次
        timer = setInterval(refreshIfDateChanged, 24 * 60 * 60 * 1000)
      }, Math.max(ms, 1000))
    }

    scheduleMidnight()

    // 页面切回 / 休眠唤醒后窗口聚焦 → 检查日期
    function handleWake() {
      refreshIfDateChanged()
      // 重新安排午夜定时器（休眠可能导致定时器偏差）
      clearTimeout(timer)
      scheduleMidnight()
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleWake()
    })
    window.addEventListener('focus', handleWake)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleWake)
      window.removeEventListener('focus', handleWake)
    }
  }, [refreshIfDateChanged])
}
