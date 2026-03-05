import { createContext, useContext } from "react"
import { Grid3x3, LayoutList, List } from "lucide-react"

export type ViewMode = "cards" | "table" | "compact"

export const viewModes: Array<{ mode: ViewMode; icon: typeof Grid3x3; title: string }> = [
  { mode: "cards", icon: Grid3x3, title: "Vista de tarjetas" },
  { mode: "table", icon: List, title: "Vista de tabla" },
  { mode: "compact", icon: LayoutList, title: "Vista compacta" },
]

type ViewModeContextValue = {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined)

export function useViewMode() {
  const context = useContext(ViewModeContext)

  if (!context) {
    throw new Error("useViewMode debe usarse dentro de Layout")
  }

  return context
}