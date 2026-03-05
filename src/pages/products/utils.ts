import type { Product } from "./interfaces/product"

export const getStockColor = (current: number, safety: number): string => {
  if (safety <= 0) return "text-[#9CA3AF]"

  const percentage = (current / safety) * 100
  return percentage >= 100 ? "text-[#10c507]" : "text-[#c50707]"
}

export const getProductType = (product: Product): string => {
  return product.isPurchased ? "Materia prima" : "Fabricado"
}
