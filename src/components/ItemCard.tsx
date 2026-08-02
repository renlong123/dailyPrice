import { memo } from 'react'
import type { Item } from '../types'
import type { DisplayFormat } from '../utils/format'
import { getDaysUsed, getDailyCost, formatDaysAsYMD, formatDate, formatMoney } from '../utils/format'

interface ItemCardProps {
  item: Item
  displayFormat: DisplayFormat
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

export default memo(function ItemCard({ item, displayFormat, onEdit, onDelete }: ItemCardProps) {
  const daysUsed = getDaysUsed(item.purchaseDate)
  const dailyCost = getDailyCost(item.price, item.purchaseDate)

  // 根据展示格式生成使用时间文本
  const usageText = displayFormat === 'ymd'
    ? formatDaysAsYMD(item.purchaseDate)
    : `${daysUsed}天`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-4">
        {/* 左侧信息 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：名称 + 分类标签 */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h3>
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {item.category}
            </span>
          </div>

          {/* 第二行：价格、日期 */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span>
              购买日期：{formatDate(item.purchaseDate)}
            </span>
            {item.notes && (
              <span className="text-gray-400 truncate">备注：{item.notes}</span>
            )}
          </div>

          {/* 第三行：已用时间、日均成本 */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <span className="text-gray-400">已用</span>
              <span className="font-semibold text-gray-700">{usageText}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="text-gray-400">日均</span>
              <span className="font-semibold text-emerald-600">
                {formatMoney(dailyCost)}
              </span>
            </span>
          </div>
        </div>

        {/* 右侧：价格 + 操作按钮 */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-lg font-bold text-gray-800">
            {formatMoney(item.price)}
          </span>

          {/* 操作按钮 — hover 时显示 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="编辑"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(item)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
