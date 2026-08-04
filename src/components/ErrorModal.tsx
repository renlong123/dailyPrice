import Modal from './Modal'

interface ErrorModalProps {
  message: string
  onClose: () => void
}

/** 共用错误提示弹窗 */
export default function ErrorModal({ message, onClose }: ErrorModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs mx-4 p-5 text-center">
        <span className="text-2xl">😞</span>
        <p className="text-sm text-gray-600 mt-2 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          知道了
        </button>
      </div>
    </Modal>
  )
}
