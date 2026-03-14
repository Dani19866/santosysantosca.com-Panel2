import { Eye, Package } from "lucide-react"
import type { ViewMode, ViewProps } from "../../interfaces/productInterface"

const alignClassMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

function TableHeader({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" | "right" }) {
  return (
    <th className={`px-6 py-4 ${alignClassMap[align]} font-['Inter:Bold',sans-serif] font-bold text-[12px] text-[#363636] uppercase tracking-wide`}>
      {children}
    </th>
  )
}

function CardsView({ products, onViewDetails, getStockColor }: ViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => {
        const stockColor = getStockColor(product.current_stock, product.safety_stock_level)

        return (
          <div key={product.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="w-full h-48 bg-linear-to-br from-[#F9FAFB] to-[#E5E7EB] flex items-center justify-center border-b border-[#E5E7EB]">
              <Package className="size-20 text-[#9CA3AF]" strokeWidth={1.5} />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#9CA3AF] uppercase mb-1">
                  {product.internal_code}
                </p>
                <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">
                  {product.category}
                </p>
              </div>

              <div className="p-3 bg-[#F9FAFB] rounded-lg">
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[10px] text-[#9CA3AF] uppercase mb-1">
                  Stock Actual
                </p>
                <p className={`font-['Inter:Bold',sans-serif] font-bold text-[20px] ${stockColor}`}>
                  {product.current_stock.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => onViewDetails(product)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e11d9]/10 text-[#1e11d9] rounded-lg hover:bg-[#1e11d9]/20 transition-colors"
              >
                <Eye className="size-4" strokeWidth={2.5} />
                <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px]">
                  Ver Detalles
                </span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView({ products, onViewDetails, getStockColor }: ViewProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <TableHeader>Código</TableHeader>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Categoría</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader align="center">Acciones</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {products.map((product) => {
              const stockColor = getStockColor(product.current_stock, product.safety_stock_level)

              return (
                <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
                    {product.internal_code}
                  </td>
                  <td className="px-6 py-4 font-['Inter:Bold',sans-serif] font-bold text-[13px] text-[#363636]">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">
                    {product.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-['Inter:Bold',sans-serif] font-bold text-[14px] ${stockColor}`}>
                      {product.current_stock.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewDetails(product)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e11d9]/10 text-[#1e11d9] rounded-lg hover:bg-[#1e11d9]/20 transition-colors"
                    >
                      <Eye className="size-3.5" strokeWidth={2.5} />
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px]">
                        Ver
                      </span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompactView({ products, onViewDetails, getStockColor }: ViewProps) {
  return (
    <div className="space-y-2">
      {products.map((product) => {
        const stockColor = getStockColor(product.current_stock, product.safety_stock_level)

        return (
          <div key={product.id} className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
              <div className="w-16 h-16 bg-linear-to-br from-[#F9FAFB] to-[#E5E7EB] rounded-lg flex items-center justify-center shrink-0">
                <Package className="size-8 text-[#9CA3AF]" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px] text-[#9CA3AF]">
                    {product.internal_code}
                  </span>
                  <span className="text-[#E5E7EB]">•</span>
                  <span className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636]">
                    {product.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[13px]">
                  <span className="font-['Inter:Medium',sans-serif] font-medium text-[#9CA3AF]">
                    {product.category}
                  </span>
                  <span className="text-[#E5E7EB]">•</span>
                  <span className={`font-['Inter:Bold',sans-serif] font-bold ${stockColor}`}>
                    Stock: {product.current_stock.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewDetails(product)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e11d9]/10 text-[#1e11d9] rounded-lg hover:bg-[#1e11d9]/20 transition-colors whitespace-nowrap"
              >
                <Eye className="size-4" strokeWidth={2.5} />
                <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px]">
                  Ver Detalles
                </span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProductList({ viewMode, products, onViewDetails, getStockColor }: ViewProps & { viewMode: ViewMode }) {
  const viewProps: ViewProps = { products, onViewDetails, getStockColor }

  switch (viewMode) {
    case "cards":
      return <CardsView {...viewProps} />
    case "table":
      return <TableView {...viewProps} />
    case "compact":
      return <CompactView {...viewProps} />
    default:
      return null
  }
}
