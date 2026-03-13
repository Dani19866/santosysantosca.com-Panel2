import type { ViewMode } from "../layout/viewMode"

/**
 * Interfaz para representar el costo histórico de un producto
 * 
 * Este histórico representa el dato "cost_history" en la base de datos
 * que es de tipo JSONB
 */
export interface CostHistory {
    date: string;
    description: string;
    cost: number;
}

/**
 * Interfaz para representar un producto en el sistema
 * 
 */
export interface Product {
    id: string;
    name: string;
    internal_code: string;
    category: string;
    unit: string;
    cost_value: number;
    current_stock: number;
    safety_stock_level: number;
    is_purchased: boolean;
    is_manufactured: boolean;
    cost_history: CostHistory[];

    //   No ha sido implementado aún
    imageUrl?: string;
}

/**
 * Intefaz que herede las propiedades de Product
 * Elimina las siguientes propiedades:
 *  - cost_histori
 *  - id
 *  - current_stock
 *  - imageUrl
 */
export type ProductFormData = Omit<Product, "cost_history" | "id" | "current_stock" | "imageUrl">

export interface PreviousPageCache {
  page: number
  products: Product[]
  hasNextPage: boolean
}

export type { ViewMode }

export interface ViewProps {
  products: Product[]
  onViewDetails: (product: Product) => void
  getStockColor: (current: number, safety: number) => string
}
