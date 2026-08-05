import type { Stats } from '../types'
import type { DisplayFormat } from '../utils/format'
import { formatMoney } from '../utils/format'

interface StatsBarProps {
  stats: Stats
  displayFormat: DisplayFormat
  onToggleFormat: () => void
  showSold: boolean
  onToggleSold: () => void
}

const FORMAT_OPTIONS = [
  { key: 'ymd' as const, label: '按年月日展示' },
  { key: 'days' as const, label: '按天展示' },
]

export default function StatsBar({ stats, displayFormat, onToggleFormat, showSold, onToggleSold }: StatsBarProps) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        统计概览
      </h2>

      {/* 总消费 */}
      <div className="p-3 bg-primary-50 rounded-xl">
        <p className="text-xs text-primary-600 mb-0.5">总消费</p>
        <p className="text-xl font-bold text-primary-700">
          {formatMoney(stats.totalSpent)}
        </p>
      </div>

      {/* 物品数量 */}
      <div className="p-3 bg-amber-50 rounded-xl">
        <p className="text-xs text-amber-600 mb-0.5">物品数量</p>
        <p className="text-xl font-bold text-amber-700">
          {stats.itemCount} <span className="text-sm font-normal">件</span>
        </p>
      </div>

      {/* 每日总成本 */}
      <div className="p-3 bg-emerald-50 rounded-xl">
        <p className="text-xs text-emerald-600 mb-0.5">每日总成本</p>
        <p className="text-xl font-bold text-emerald-700">
          {formatMoney(stats.totalDailyCost)}
          <span className="text-xs font-normal text-emerald-500">/天</span>
        </p>
      </div>

      {/* 时间展示格式切换 */}
      <div className="p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-2">使用时间展示</p>
        <button
          onClick={onToggleFormat}
          className={`w-full flex items-center rounded-lg p-0.5 text-xs transition-colors ${
            displayFormat === 'ymd' ? 'bg-primary-100' : 'bg-gray-200'
          }`}
        >
          {FORMAT_OPTIONS.map((opt) => (
            <span
              key={opt.key}
              className={`flex-1 py-1.5 rounded-md text-center font-medium transition-all ${
                displayFormat === opt.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {opt.label}
            </span>
          ))}
        </button>
      </div>

      {/* 已卖出物品开关 */}
      <div className="p-3 bg-gray-50 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSold}
            onChange={onToggleSold}
            className="w-3.5 h-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
          />
          <span className="text-xs text-gray-500">显示已卖出</span>
        </label>
      </div>

      {/* 说明文字 */}
      <p className="text-xs text-gray-400 leading-relaxed mt-auto">
        每日总成本 = 所有使用中物品的日均成本之和。
      </p>
    </aside>
  )
}
