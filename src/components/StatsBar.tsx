import type { Stats } from '../types'
import type { DisplayFormat } from '../utils/format'

interface StatsBarProps {
  stats: Stats
  displayFormat: DisplayFormat
  onToggleFormat: () => void
}

export default function StatsBar({ stats, displayFormat, onToggleFormat }: StatsBarProps) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        统计概览
      </h2>

      {/* 总消费 */}
      <div className="p-3 bg-primary-50 rounded-xl">
        <p className="text-xs text-primary-600 mb-0.5">总消费</p>
        <p className="text-xl font-bold text-primary-700">
          ¥{stats.totalSpent.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* 物品数量 */}
      <div className="p-3 bg-amber-50 rounded-xl">
        <p className="text-xs text-amber-600 mb-0.5">物品数量</p>
        <p className="text-xl font-bold text-amber-700">
          {stats.itemCount} <span className="text-sm font-normal">件</span>
        </p>
      </div>

      {/* 平均日均成本 */}
      <div className="p-3 bg-emerald-50 rounded-xl">
        <p className="text-xs text-emerald-600 mb-0.5">平均日均成本</p>
        <p className="text-xl font-bold text-emerald-700">
          ¥{stats.avgDailyCost.toFixed(2)}
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
          <span
            className={`flex-1 py-1.5 rounded-md text-center font-medium transition-all ${
              displayFormat === 'ymd'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            1年3月
          </span>
          <span
            className={`flex-1 py-1.5 rounded-md text-center font-medium transition-all ${
              displayFormat === 'days'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            400天
          </span>
        </button>
      </div>

      {/* 说明文字 */}
      <p className="text-xs text-gray-400 leading-relaxed mt-auto">
        日均成本 = 物品价格 ÷ 已使用天数。数值越低说明物品使用越划算。
      </p>
    </aside>
  )
}
