import Modal from './Modal'

interface DeleteConfirmProps {
  itemName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirm({ itemName, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="text-center mb-5">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-base font-semibold text-gray-800 mt-3">确认删除</h3>
          <p className="text-sm text-gray-500 mt-1">
            确定要删除 <span className="font-medium text-gray-700">「{itemName}」</span> 吗？此操作无法撤销。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            删除
          </button>
        </div>
      </div>
    </Modal>
  )
}
