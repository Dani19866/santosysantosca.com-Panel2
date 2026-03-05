import type { Product } from "./interfaces/product"
import type { ViewMode } from "../../layout/viewMode"

export type { ViewMode }

export interface ViewProps {
  products: Product[]
  onViewDetails: (product: Product) => void
  getStockColor: (current: number, safety: number) => string
}
