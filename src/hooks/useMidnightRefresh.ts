import { useEffect, useRef } from 'react'
import { getLocalDateStr } from '../utils/todoStorage'

/**
 * 跨天自动刷新：检测到日期变化时触发回调
 * - 到达午夜时自动刷新
 * - 页面从后台切回时检查日期是否变化
 */
export function useMidnightRefresh(onDateChange: () => void) {
  const lastDateRef = useRef(getLocalDateStr())

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
      timer = setTimeout(() => {
        lastDateRef.current = getLocalDateStr()
        onDateChange()
        // 之后每 24 小时触发一次
        timer = setInterval(() => {
          lastDateRef.current = getLocalDateStr()
          onDateChange()
        }, 24 * 60 * 60 * 1000)
      }, ms)
    }

    scheduleMidnight()

    // 页面从后台切回时也检查
    function handleVisibility() {
      if (document.hidden) return
      const today = getLocalDateStr()
      if (today !== lastDateRef.current) {
        lastDateRef.current = today
        onDateChange()
        // 重新安排午夜定时器
        clearTimeout(timer)
        scheduleMidnight()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [onDateChange])
}
