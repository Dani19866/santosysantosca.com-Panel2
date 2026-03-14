import { FactoryController } from "./FactoryController.ts"
import {
    api_get_products,
    api_save_product,
    api_modify_product,
    api_get_one_product
} from "../scripts/URL.ts"
import type { Product, ProductRaw, ProductFormData } from "../interfaces/productInterface.ts"

// Interfaz de la estructura de datos del cálculo de tendencia de costo
export type CostTrend = {
  change: string
  isIncrease: boolean
} | null

export type StockStatus = {
  label: string
  color: string
  bg: string
  border: string
}

class ProductController extends FactoryController<Product, ProductRaw> {
    public readonly HIGH_LEVEL: number = 150
    public readonly MEDIUM_LEVEL: number = 100
    public readonly LOW_LEVEL: number = 50

    constructor() {
        super(
            api_get_products,
            api_save_product,
            api_modify_product,
            api_get_one_product,
            "products_previous_page_cache"
        )
    }

    getStockColor = (current: number, safety: number): string => {
        if (safety <= 0) return "text-[#9CA3AF]"

        const percentage = (current / safety) * 100
        return percentage >= 100 ? "text-[#10c507]" : "text-[#c50707]"
    }

    /**
     * Mapeamos el producto que llegó del back-end (ProductRaw) a un tipo
     * de objeto que entiende el front-end (Product)
     */
    mapItem(rawItem: ProductRaw): Product {
        return {
            id: String(rawItem.id ?? ""),
            name: String(rawItem.name ?? ""),
            internal_code: String(rawItem.internal_code ?? ""),
            category: String(rawItem.category ?? ""),
            unit: String(rawItem.unit ?? ""),
            cost_value: this.utilToNumber(rawItem.cost_value),
            current_stock: this.utilToNumber(rawItem.current_stock),
            safety_stock_level: this.utilToNumber(rawItem.safety_stock_level),
            is_purchased: this.utilToBoolean(rawItem.is_purchased),
            is_manufactured: this.utilToBoolean(rawItem.is_manufactured),
            cost_history: Array.isArray(rawItem.cost_history)
                ? rawItem.cost_history.map((entry) => ({
                    date: String(entry.date ?? ""),
                    description: String(entry.description ?? ""),
                    cost: this.utilToNumber(entry.cost),
                }))
                : [],
            imageUrl: rawItem.imageUrl,
        }
    }

    /**
    * LÓGICA: Creación de un objeto ProductEditFormData a partir de un objeto Product
    */
    createFormDataFromProduct = (item: Product): ProductFormData => ({
        name: item.name,
        internal_code: item.internal_code,
        category: item.category,
        unit: item.unit,
        cost_value: Number(item.cost_value),
        safety_stock_level: Number(item.safety_stock_level),
        is_purchased: Boolean(item.is_purchased),
        is_manufactured: Boolean(item.is_manufactured),
    })
}

export const productController = new ProductController()