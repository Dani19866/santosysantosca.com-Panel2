import { useEffect, useMemo, useState } from "react"
import type { Product } from "./interfaces/product"
import Layout from "../../layout/Layout"
import AddProductModal from "./components/AddProductModal"
import FloatingAddButton from "./components/FloatingAddButton"
import ProductDetailModal from "./components/ProductDetailModal"
import ProductList from "./components/ProductList"
import SearchBar from "./components/SearchBar"
import { getStockColor } from "./utils"
import { useViewMode } from "../../layout/viewMode"
import { api_get_products } from "../../scripts/URL.ts"

// Número máximo de productos a cargar por página (puede ajustarse según necesidades y rendimiento)
const PRODUCT_PAGE_SIZE = 20

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value)
    return Number.isNaN(parsedValue) ? 0 : parsedValue
  }

  return 0
}

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    return normalizedValue === "true" || normalizedValue === "1"
  }

  return false
}

const mapProduct = (product: any): Product => ({
  id: String(product.id ?? ""),
  name: String(product.name ?? ""),
  internalCode: String(product.internalCode ?? product.internal_code ?? ""),
  category: String(product.category ?? ""),
  unit: String(product.unit ?? ""),
  cost: toNumber(product.cost),
  currentStock: toNumber(product.currentStock ?? product.current_stock),
  safetyStock: toNumber(product.safetyStock ?? product.safety_stock),
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

const extractProducts = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.products)) return payload.products
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.rows)) return payload.rows

  return []
}

function ProductsContent() {
  const { viewMode } = useViewMode()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()

    const loadProducts = async () => {
      setIsLoadingProducts(true)
      setProductsError("")

      try {
        const url = `${api_get_products}?limit=${PRODUCT_PAGE_SIZE}&offset=0`
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`No se pudo obtener los productos (HTTP ${response.status})`)
        }

        const payload = await response.json()
        const parsedProducts = extractProducts(payload).map(mapProduct)
        setProducts(parsedProducts)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error al cargar productos:", error)
          setProductsError("No se pudieron cargar los productos desde el servidor.")
        }
      } finally {
        setIsLoadingProducts(false)
      }
    }

    loadProducts()

    return () => {
      abortController.abort()
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()

    return products.filter((product) => {
      return (product.internalCode.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower))
    })
  }, [products, searchTerm])

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProduct(null)
  }

  const handleOpenAddModal = () => setIsAddProductModalOpen(true)
  const handleCloseAddModal = () => setIsAddProductModalOpen(false)

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      {/* Menú de búsqueda rápida */}
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Lista de productos */}
      <div className="flex-1 px-6 md:px-8 py-6 overflow-auto">
        {isLoadingProducts && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            Cargando productos...
          </p>
        )}

        {!isLoadingProducts && productsError && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#c50707]">
            {productsError}
          </p>
        )}

        {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            No hay productos para mostrar.
          </p>
        )}

        {!isLoadingProducts && !productsError && filteredProducts.length > 0 && (
        <ProductList viewMode={viewMode} products={filteredProducts} onViewDetails={handleViewDetails} getStockColor={getStockColor} />
        )}
      </div>

      {/* Abrir un submenu donde se detallan datos de un producto específico */}
      {selectedProduct && (<ProductDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} product={selectedProduct} />)}

      {/* Modal para agregar un nuevo producto */}
      <AddProductModal isOpen={isAddProductModalOpen} onClose={handleCloseAddModal} />

      {/* Botón flotante para agregar nuevo producto */}
      {!isAddProductModalOpen && (<FloatingAddButton onClick={handleOpenAddModal} />)}
    </div>
  )
}


export default function Products({ authProvider }: { authProvider?: boolean }) {
  return (
    <Layout authProvider={authProvider}>
      <ProductsContent />
    </Layout>
  )
}