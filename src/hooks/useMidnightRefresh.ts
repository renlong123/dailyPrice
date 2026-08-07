import { useEffect, useRef, useCallback } from 'react'
import { getLocalDateStr } from '../utils/todoStorage'

/**
 * 页面可见时检测日期是否变化，跨天则刷新
 */
export function useMidnightRefresh(onDateChange: () => void) {
  const lastDateRef = useRef(getLocalDateStr())

  const check = useCallback(() => {
    const today = getLocalDateStr()
    if (today !== lastDateRef.current) {
      lastDateRef.current = today
      onDateChange()
    }
  }, [onDateChange])

  useEffect(() => {
    function handleVisible() {
      if (!document.hidden) check()
    }
    document.addEventListener('visibilitychange', handleVisible)
    window.addEventListener('focus', check)

    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      window.removeEventListener('focus', check)
    }
  }, [check])
}
