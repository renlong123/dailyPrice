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
  const isSold = item.status === 'sold'
  // 已卖出：基于购买→卖出期间计算；使用中：基于购买→今天
  const endDate = isSold ? item.soldDate : undefined
  const daysUsed = getDaysUsed(item.purchaseDate, endDate)
  const dailyCost = getDailyCost(item.price, item.purchaseDate, endDate)

  const usageText = displayFormat === 'ymd'
    ? formatDaysAsYMD(item.purchaseDate)
    : `${daysUsed}天`

  // 卖出收益
  const profit = isSold && item.sellPrice != null
    ? item.sellPrice - item.price
    : 0

  return (
    <div className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all group ${
      isSold ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* 左侧信息 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：名称 + 状态标签 + 分类标签 */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-sm font-semibold truncate ${isSold ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {item.name}
            </h3>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
              isSold ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isSold ? '已卖出' : '使用中'}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {item.category}
            </span>
          </div>

          {/* 第二行：日期 */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span>购买日期：{formatDate(item.purchaseDate)}</span>
            {item.notes && (
              <span className="text-gray-400 truncate">备注：{item.notes}</span>
            )}
          </div>

          {/* 第三行：已用时间、日均成本（已卖出显示卖出信息） */}
          <div className="flex items-center gap-3">
            {isSold ? (
              <>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-gray-400">使用{daysUsed}天</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">日均</span>
                  <span className="font-semibold text-amber-600">{formatMoney(dailyCost)}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1 text-xs">
                  <span className="text-gray-400">卖出</span>
                  <span className="font-semibold text-amber-600">
                    {formatMoney(item.sellPrice!)}
                  </span>
                  {item.soldDate && (
                    <span className="text-gray-400 ml-0.5">({item.soldDate})</span>
                  )}
                </span>
                <span className="text-gray-300">|</span>
                <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {profit >= 0 ? '+' : ''}{formatMoney(profit)}
                </span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* 右侧：价格 + 操作按钮 */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-lg font-bold ${isSold ? 'text-gray-400' : 'text-gray-800'}`}>
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
