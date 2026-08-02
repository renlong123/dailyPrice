import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDaysUsed,
  getDailyCost,
  formatDate,
  formatMoney,
  formatDaysAsYMD,
} from '../utils/format'

// 固定"今天"为 2026-08-02，确保测试结果可重复
const TODAY = new Date(2026, 7, 2) // 月份 0-indexed，7 = 八月

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

// ==================== getDaysUsed ====================
describe('getDaysUsed', () => {
  it('应该正确计算从购买日到今天的天数', () => {
    // 2026-07-15 → 2026-08-02 = 18 天
    expect(getDaysUsed('2026-07-15')).toBe(18)
  })

  it('当天购买应该返回 0 天', () => {
    expect(getDaysUsed('2026-08-02')).toBe(0)
  })

  it('昨天购买应该返回 1 天', () => {
    expect(getDaysUsed('2026-08-01')).toBe(1)
  })

  it('未来日期应该返回 0（而非负数）', () => {
    expect(getDaysUsed('2026-12-31')).toBe(0)
    expect(getDaysUsed('2099-01-01')).toBe(0)
  })

  it('跨年日期应该正确计算', () => {
    // 2025-12-25 → 2026-08-02 = 220 天
    // 12月剩 6 天 + 1月31 + 2月28 + 3月31 + 4月30 + 5月31 + 6月30 + 7月31 + 8月2 = 220
    expect(getDaysUsed('2025-12-25')).toBe(220)
  })

  it('很久以前的日期应该返回很大的天数', () => {
    const days = getDaysUsed('2020-01-01')
    expect(days).toBeGreaterThan(2000)
    expect(days).toBeGreaterThan(2400) // 大约 2405 天
  })
})

// ==================== getDailyCost ====================
describe('getDailyCost', () => {
  it('应该用价格除以已用天数', () => {
    // 100元 / 18天 ≈ 5.555...
    const cost = getDailyCost(100, '2026-07-15')
    expect(cost).toBeCloseTo(5.56, 1)
  })

  it('当天购买时日均成本应等于价格本身', () => {
    expect(getDailyCost(5000, '2026-08-02')).toBe(5000)
  })

  it('使用 1 天后日均成本等于价格', () => {
    expect(getDailyCost(300, '2026-08-01')).toBe(300)
  })

  it('零元物品日均成本始终为零', () => {
    expect(getDailyCost(0, '2026-07-15')).toBe(0)
    expect(getDailyCost(0, '2026-08-02')).toBe(0)
  })
})

// ==================== formatDate ====================
describe('formatDate', () => {
  it('应该格式化为中文日期', () => {
    expect(formatDate('2026-07-15')).toBe('2026年7月15日')
  })

  it('个位数月份和日期不应有前导零', () => {
    expect(formatDate('2026-01-05')).toBe('2026年1月5日')
  })

  it('年末日期应该正确', () => {
    expect(formatDate('2026-12-31')).toBe('2026年12月31日')
  })
})

// ==================== formatMoney ====================
describe('formatMoney', () => {
  it('整数金额应该保留两位小数', () => {
    expect(formatMoney(100)).toBe('¥100.00')
  })

  it('小数金额应该正确格式化', () => {
    expect(formatMoney(99.5)).toBe('¥99.50')
  })

  it('大金额应该有千分位分隔', () => {
    expect(formatMoney(12345.67)).toBe('¥12,345.67')
  })

  it('零元应该正确显示', () => {
    expect(formatMoney(0)).toBe('¥0.00')
  })

  it('负金额应该正确格式化', () => {
    expect(formatMoney(-50)).toBe('¥-50.00')
  })

  it('浮点精度问题应该被正确处理', () => {
    // 0.1 + 0.2 = 0.30000000000000004 的情况
    expect(formatMoney(0.1 + 0.2)).toBe('¥0.30')
  })
})

// ==================== formatDaysAsYMD ====================
describe('formatDaysAsYMD', () => {
  it('纯天数应该只显示天', () => {
    // 2026-07-15 → 2026-08-02 = 18 天
    expect(formatDaysAsYMD('2026-07-15')).toBe('18天')
  })

  it('超过一个月应该显示月+天', () => {
    // 2026-05-15 → 2026-08-02 = 2个月18天
    // 5月15→6月15=1月, 6月15→7月15=2月, 7月15→8月2=18天
    expect(formatDaysAsYMD('2026-05-15')).toBe('2个月18天')
  })

  it('超过一年应该显示年+月+天', () => {
    // 2024-06-15 → 2026-08-02 = 2年1个月18天
    expect(formatDaysAsYMD('2024-06-15')).toBe('2年1个月18天')
  })

  it('未来日期应该返回 0天', () => {
    expect(formatDaysAsYMD('2099-01-01')).toBe('0天')
  })

  it('今天应该返回 0天', () => {
    expect(formatDaysAsYMD('2026-08-02')).toBe('0天')
  })

  it('整年的情况应该正确处理', () => {
    // 2025-08-02 → 2026-08-02 = 1年0天
    expect(formatDaysAsYMD('2025-08-02')).toBe('1年')
  })
})
