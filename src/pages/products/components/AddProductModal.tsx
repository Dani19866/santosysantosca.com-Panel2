import { X } from "lucide-react"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#E5E7EB] shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[16px] text-[#363636]">
            Agregar Producto
          </h2>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#363636] transition-colors">
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            Formulario pendiente de implementación.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1e11d9] text-white font-['Inter:Bold',sans-serif] font-bold text-[12px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
