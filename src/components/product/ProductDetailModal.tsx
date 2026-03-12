import { DollarSign, Factory, Package, ShoppingCart, TrendingDown, TrendingUp, X } from "lucide-react"
import type { Product } from "../../interfaces/product"
import { getProductType } from "../../logic/productLogic"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!isOpen) return null

  const getStockStatus = (current: number, safety: number) => {
    if (safety <= 0) {
      return { label: "Sin referencia", color: "text-[#9CA3AF]", bg: "bg-[#9CA3AF]/10", border: "border-[#9CA3AF]/40" }
    }

    const percentage = (current / safety) * 100
    if (percentage >= 150) return { label: "Óptimo", color: "text-[#10c507]", bg: "bg-[#10c507]/10", border: "border-[#10c507]/40" }
    if (percentage >= 100) return { label: "Normal", color: "text-[#1e11d9]", bg: "bg-[#1e11d9]/10", border: "border-[#1e11d9]/40" }
    if (percentage >= 50) return { label: "Bajo", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/40" }
    return { label: "Crítico", color: "text-[#c50707]", bg: "bg-[#c50707]/10", border: "border-[#c50707]/40" }
  }

  const getCostTrend = () => {
    if (product.costHistory.length < 2) return null
    const latest = product.costHistory[product.costHistory.length - 1].cost
    const previous = product.costHistory[product.costHistory.length - 2].cost

    if (previous === 0) {
      return { change: "0.0", isIncrease: latest > 0 }
    }

    const change = ((latest - previous) / previous) * 100
    return {
      change: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
    }
  }

  const stockStatus = getStockStatus(product.currentStock, product.safety_stock_level)
  const trend = getCostTrend()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-200 max-h-[90vh] overflow-hidden rounded-[20px] bg-white shadow-2xl flex flex-col">
        <div className="relative bg-linear-to-br from-[#1e11d9] to-[#1508a8] px-6 py-6 md:px-8 md:py-7 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="size-5 text-white" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
              <Package className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-white/70">
                {product.internalCode}
              </span>
              <h2 className="mt-1 font-['Inter:Bold',sans-serif] font-bold text-[20px] md:text-[22px] text-white wrap-break-word">
                {product.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm font-['Inter:Bold',sans-serif] font-bold text-[11px] text-white">
                  {product.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm font-['Inter:Bold',sans-serif] font-bold text-[11px] text-white">
                  {getProductType(product)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5">
          <div className={`${stockStatus.bg} border-2 ${stockStatus.border} rounded-2xl p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]/70 uppercase tracking-wider mb-2">
                  Stock Actual
                </p>
                <p className={`font-['Inter:Bold',sans-serif] font-bold text-[30px] md:text-[36px] ${stockStatus.color}`}>
                  {product.currentStock.toLocaleString()}
                </p>
              </div>
              <span className={`shrink-0 px-4 py-2 rounded-xl ${stockStatus.bg} ${stockStatus.color} font-['Inter:Bold',sans-serif] font-bold text-[14px]`}>
                {stockStatus.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Unidad de Medida
              </p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[15px] text-[#363636]">{product.unit}</p>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Stock Seguro
              </p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[15px] text-[#363636]">{product.safety_stock_level.toLocaleString()}</p>
            </div>

            <div className="bg-linear-to-br from-[#1e11d9]/5 to-transparent rounded-xl p-4 border border-[#1e11d9]/20 md:col-span-2">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Costo Actual
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-[#1e11d9]">${product.cost.toFixed(2)}</p>
                {trend && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${trend.isIncrease ? "bg-[#c50707]/10 text-[#c50707]" : "bg-[#10c507]/10 text-[#10c507]"}`}
                  >
                    {trend.isIncrease ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px]">{trend.change}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="bg-[#F9FAFB] px-5 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] flex items-center gap-2">
                <DollarSign className="size-4 text-[#1e11d9]" />
                Historial de Costos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Fecha</span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Descripción</span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Costo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.costHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">
                        Sin historial registrado
                      </td>
                    </tr>
                  )}
                  {product.costHistory.map((entry, index) => (
                    <tr
                      key={`${entry.date}-${index}`}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#363636]">{entry.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">{entry.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px] text-[#1e11d9]">${entry.cost.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-3">Capacidades del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-lg ${product.isManufactured
                  ? "border-[#1e11d9] bg-[#1e11d9]/5"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Factory className={`size-4 ${product.isManufactured ? "text-[#1e11d9]" : "text-[#9CA3AF]"}`} strokeWidth={2.5} />
                  <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">Se puede fabricar</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-['Inter:Bold',sans-serif] font-bold text-[11px] ${product.isManufactured
                    ? "bg-[#1e11d9]/15 text-[#1e11d9]"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                    }`}
                >
                  {product.isManufactured ? "Sí" : "No"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-lg ${product.isPurchased
                  ? "border-[#10c507] bg-[#10c507]/5"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`size-4 ${product.isPurchased ? "text-[#10c507]" : "text-[#9CA3AF]"}`} strokeWidth={2.5} />
                  <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">Se puede comprar</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-['Inter:Bold',sans-serif] font-bold text-[11px] ${product.isPurchased
                    ? "bg-[#10c507]/15 text-[#10c507]"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                    }`}
                >
                  {product.isPurchased ? "Sí" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 md:px-8 md:py-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-[#E5E7EB] hover:border-[#363636] hover:bg-white transition-all duration-200"
          >
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#363636]">Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
