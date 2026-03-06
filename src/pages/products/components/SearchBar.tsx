import { Search } from "lucide-react"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
      <input
        name="product_or_id"
        type="text"
        placeholder="Buscar producto por ID o nombre..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-lg font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] hover:border-[#1e11d9] focus:outline-none focus:ring-2 focus:ring-[#1e11d9]/20 transition-colors"
      />
    </div>
  )
}
