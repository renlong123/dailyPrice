import { useEffect, type ReactNode, type MouseEvent } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

/** 共用模态弹窗：半透明遮罩 + 居中卡片 + Esc 关闭 + 点击遮罩关闭 */
export default function Modal({ children, onClose }: ModalProps) {
  // Esc 键关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // 点击遮罩关闭（不响应卡片内部冒泡）
  const handleBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={handleBackdrop}
    >
      {children}
    </div>
  )
}
