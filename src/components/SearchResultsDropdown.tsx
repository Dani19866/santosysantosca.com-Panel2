import { Eye } from "lucide-react"
import type { Product } from "../interfaces/product"

interface SearchResultsDropdownProps {
  isVisible: boolean
  isLoading: boolean
  error: string
  searchTerm: string
  results: Product[]
  onViewDetails: (product: Product) => void
  position: {
    top: number
    left: number
    width: number
  }
}

export default function SearchResultsDropdown({
  isVisible,
  isLoading,
  error,
  searchTerm,
  results,
  onViewDetails,
  position,
}: SearchResultsDropdownProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed z-50 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      <div className="max-h-72 overflow-y-auto">
        {isLoading && (
          <p className="px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            Buscando en la base de datos...
          </p>
        )}

        {!isLoading && error && (
          <p className="px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#c50707]">
            {error}
          </p>
        )}

        {!isLoading && !error && results.length === 0 && (
          <p className="px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            No se encontraron productos para "{searchTerm}".
          </p>
        )}

        {!isLoading && !error && results.length > 0 && (
          <ul className="divide-y divide-[#E5E7EB]">
            {results.map((product) => (
              <li key={product.id} className="px-4 py-3 hover:bg-[#F9FAFB] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[12px] text-[#9CA3AF] truncate">
                      {product.internal_code}
                    </p>
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[13px] text-[#363636] truncate">
                      {product.name}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewDetails(product)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e11d9]/10 text-[#1e11d9] rounded-lg hover:bg-[#1e11d9]/20 transition-colors shrink-0"
                  >
                    <Eye className="size-3.5" strokeWidth={2.5} />
                    <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px]">
                      Ver
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
