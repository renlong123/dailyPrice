import { useState, useEffect, useRef } from 'react'
import type { TodoTask, TodoFormData } from '../types'
import { getLocalDateStr } from '../utils/todoStorage'
import { WEEKDAY_NAMES } from '../utils/todoSchedule'
import Modal from './Modal'

interface TodoFormProps {
  task: TodoTask | null       // null = 新增，非 null = 编辑
  onSubmit: (data: TodoFormData) => Promise<void>
  onClose: () => void
}

export default function TodoForm({ task, onSubmit, onClose }: TodoFormProps) {
  const isEdit = task !== null

  const [name, setName] = useState(task?.name || '')
  const [scheduleType, setScheduleType] = useState<'weekly' | 'monthly'>(task?.scheduleType || 'weekly')
  const [scheduleDays, setScheduleDays] = useState<number[]>(task?.scheduleDays || [])
  const [startDate, setStartDate] = useState(task?.startDate || getLocalDateStr())
  const [endDate, setEndDate] = useState(task?.endDate || '')
  const [notes, setNotes] = useState(task?.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // 切换循环类型时清空已选天数
  const handleTypeChange = (type: 'weekly' | 'monthly') => {
    setScheduleType(type)
    setScheduleDays([])
  }

  // 切换某天是否选中
  const toggleDay = (day: number) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('请输入任务名称')
      return
    }
    if (scheduleDays.length === 0) {
      setError('请至少选择一个安排日期')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        scheduleType,
        scheduleDays,
        startDate,
        endDate: endDate || null,
        notes: notes.trim(),
      })
    } catch (err) {
      console.error('保存待办失败:', err)
      setError(err instanceof Error ? err.message : '保存失败，请重试')
      setSubmitting(false)
    }
  }

  const isValid = name.trim().length > 0 && scheduleDays.length > 0

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? '编辑待办' : '添加待办'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
          )}

          {/* 任务名称 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">任务名称</span>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：晨跑、写日记..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
            />
          </label>

          {/* 循环类型 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">循环类型</span>
            <div className="flex gap-2">
              {(['weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scheduleType === type
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'weekly' ? '按周' : '按月'}
                </button>
              ))}
            </div>
          </div>

          {/* 选择日期 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">
              {scheduleType === 'weekly' ? '选择星期' : '选择日期'}
            </span>
            {scheduleType === 'weekly' ? (
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_NAMES.map((label, i) => {
                  const day = i + 1
                  const selected = scheduleDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const selected = scheduleDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 日期范围 */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">开始日期</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">结束日期（可选）</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="留空=永不结束"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
              />
            </label>
          </div>

          {/* 备注 */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">备注（可选）</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="任务备注..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
            />
          </label>

          {/* 按钮 */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-sm font-medium text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? '保存中...' : isEdit ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
