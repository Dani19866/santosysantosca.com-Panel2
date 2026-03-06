import { X } from "lucide-react"
import type { Product } from "../interfaces/product"
import { getProductType } from "../logic/productLogic"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-xl bg-white border border-[#E5E7EB] shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[18px] text-[#363636]">
              {product.name}
            </h2>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
              {product.internalCode} • {product.category}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#363636] transition-colors">
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-auto max-h-[70vh] space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF] mb-1">Tipo</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636]">{getProductType(product)}</p>
            </div>
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF] mb-1">Unidad</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636]">{product.unit}</p>
            </div>
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF] mb-1">Stock actual</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636]">{product.currentStock.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF] mb-1">Stock de seguridad</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636]">{product.safetyStock.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-3">Historial de costos</h3>
            <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase">Descripción</th>
                    <th className="px-4 py-3 text-right font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase">Costo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {product.costHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">
                        Sin historial registrado
                      </td>
                    </tr>
                  )}
                  {product.costHistory.map((entry, index) => (
                    <tr key={`${entry.date}-${index}`}>
                      <td className="px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#363636]">{entry.date}</td>
                      <td className="px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#363636]">{entry.description}</td>
                      <td className="px-4 py-3 text-right font-['Inter:Bold',sans-serif] font-bold text-[12px] text-[#363636]">${entry.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
