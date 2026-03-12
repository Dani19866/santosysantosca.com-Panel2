import type { 
  Product, 
  PreviousPageCache 
} from "../interfaces/product"

export const PREVIOUS_PAGE_CACHE_KEY: string = "products_previous_page_cache"
export const PRODUCTS_PER_PAGE: number = 20
export const PRODUCTS_FETCH_SIZE: number = PRODUCTS_PER_PAGE + 1

export const getStockColor = (current: number, safety: number): string => {
  if (safety <= 0) return "text-[#9CA3AF]"

  const percentage = (current / safety) * 100
  return percentage >= 100 ? "text-[#10c507]" : "text-[#c50707]"
}

export const getProductType = (product: Product): string => {
  return product.isPurchased ? "Materia prima" : "Fabricado"
}

/**
 * Función que convierte diferentes tipos de valores a números.
 * 
 * Es usado en la función mapProduct para asegurar que las propiedades 
 */
 const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)
    return Number.isNaN(parsedValue) ? 0 : parsedValue
  }

  return 0
}

/**
 * Función que convierte diferentes tipos de valores a booleanos. 
 * 
 * Es usado en la función mapProduct para asegurar que las propiedades 
 */
 const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    return normalizedValue === "true" || normalizedValue === "1"
  }

  return false
}

/**
 * Recibimos un conjunto de datos parseados en JSON para crear un 
 * objeto tipo "Product". Esta función va de la mano con la función
 * .map() para que mapee todos los datos de un Array y los convierta 
 * a un tipo "Product" con las propiedades correctas.
 * 
 * Otra funconalidad de esta función es manejar posibles inconsistencias 
 * en los nombres de las propiedades (por ejemplo, "internalCode" vs 
 * "internal_code").
 * 
 * Además, se asegura de convertir los valores a los tipos correctos
 * (por ejemplo, números o booleanos) para evitar problemas posteriores al 
 * manipular estos datos en la aplicación.
 */
export const mapProduct = (product: any): Product => ({
  id: String(product.id ?? ""),
  name: String(product.name ?? ""),
  internalCode: String(product.internalCode ?? product.internal_code ?? ""),
  category: String(product.category ?? ""),
  unit: String(product.unit ?? ""),
  cost: toNumber(product.cost),
  currentStock: toNumber(product.currentStock ?? product.current_stock),
  safety_stock_level: toNumber(product.safety_stock_level ?? product.safetyStock ?? product.safety_stock),
  isPurchased: toBoolean(product.isPurchased ?? product.is_purchased),
  isManufactured: toBoolean(product.isManufactured ?? product.is_manufactured),
  costHistory: Array.isArray(product.costHistory ?? product.cost_history)
    ? (product.costHistory ?? product.cost_history).map((entry: any) => ({
      date: String(entry.date ?? ""),
      description: String(entry.description ?? ""),
      cost: toNumber(entry.cost),
    }))
    : [],
  imageUrl: product.imageUrl ?? product.image_url,
})

/**
 * Hace un intento de búsqueda en el LocalStorage para obtener la info.
 * de la página anterior de productos.
 * 
 * Esta página en tal caso que hubiese sido guardada, se guarda con 
 * savePreviousPageCache() cada vez que se navega a una página diferente.
 * 
 * @returns La información de la página anterior de productos, o null si no existe.
 */
export const getPreviousPageCache = (): PreviousPageCache | null => {

  try {
    // Obtenemos info del LocalStorage usando la clave definida
    const rawCache = localStorage.getItem(PREVIOUS_PAGE_CACHE_KEY)

    // Si no hay nada guardado, retornamos null
    if (!rawCache) {
      return null
    }

    // Parseamos el JSON como objeto
    const parsedCache = JSON.parse(rawCache) as PreviousPageCache

    // Realizamos las verificaciones para comprobar si no han sido manipuladas
    if (
      typeof parsedCache?.page === "number"        
      && Array.isArray(parsedCache.products)     
      && typeof parsedCache.hasNextPage === "boolean"
    ) {
      return parsedCache
    }

    // Retornamos null si el formato fue manipulado
    return null

  } catch (error) {
    console.error("No se pudo leer caché de productos:", error)
    return null
  }
}

/**
 * Función para guardar en localStorage la información de la página anterior, incluyendo:
 * - Número de página
 * - Lista de productos de esa página
 * - Si hay una página siguiente o no
 */
export const savePreviousPageCache = (cache: PreviousPageCache) => {
  try {
    localStorage.setItem(PREVIOUS_PAGE_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error("No se pudo guardar caché de productos:", error)
  }
}
