import { Plus } from "lucide-react"

export default function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1e11d9] to-[#003D9D] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group z-50"
    >
      <Plus className="size-5" strokeWidth={2.5} />
      <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px]">
        Agregar Producto
      </span>
    </button>
  )
}
