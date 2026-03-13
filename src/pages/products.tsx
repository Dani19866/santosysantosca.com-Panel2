import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import {
  Database,
  Plus
} from "lucide-react"
import type { Product } from "../interfaces/product.tsx"
import Layout from "../layout/Layout.tsx"
import AddProductModal from "../components/product/ProductAddItemModal.tsx"
import ProductDetailModal from "../components/product/ProductDetailModal.tsx"
import ProductList from "../components/product/ProductList.tsx"
import SearchBar from "../components/SearchBar.tsx"
import SearchResultsDropdown from "../components/SearchResultsDropdown.tsx"
import {
  getStockColor,
  mapProduct,
  getPreviousPageCache,
  savePreviousPageCache
} from "../logic/productLogic.ts"
import { useViewMode } from "../layout/viewMode.ts"
import {
  api_get_products,
  api_search_product
} from "../scripts/URL.ts"
import {
  PRODUCTS_PER_PAGE,
  PRODUCTS_FETCH_SIZE
} from "../logic/productLogic.ts"
import type { Category } from "../interfaces/category.tsx"
import type { Unit } from "../interfaces/unit.tsx"
import type { SettingsSection } from "../scripts/URL.ts"
import { settingsLogic, type SettingsCacheItem } from "../logic/settingsLogic.ts"

interface SearchDropdownPosition {
  top: number
  left: number
  width: number
}

function ProductsContent() {
  const { viewMode } = useViewMode()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [productsFiltered, setProductsFiltered] = useState<Product[]>([])
  const [isLoadingProductsFiltered, setIsLoadingProductsFiltered] = useState(false)
  const [productsFilteredError, setProductsFilteredError] = useState("")
  const [searchInDB, setSearchInDB] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<SearchDropdownPosition>({ top: 0, left: 0, width: 0 })
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoadingProductOptions, setIsLoadingProductOptions] = useState(false)
  const [productOptionsError, setProductOptionsError] = useState("")
  const searchWrapperRef = useRef<HTMLDivElement | null>(null)


  /**
   * useMemo se utiliza para memorizar el resultado del filtrado de productos,
   * de modo que solo se vuelva a calcular cuando cambien los productos o el 
   * término de búsqueda. Esto mejora el rendimiento al evitar cálculos 
   * innecesarios en cada renderizado.
   */
  const filteredProducts = useMemo(() => {
    if (searchInDB) {
      return products
    }

    const searchLower = searchTerm.toLowerCase()

    // Buscar en la página productos ya cargados
    return products.filter((product) => {
      return (product.internal_code.toLowerCase().includes(searchLower) || product.name.toLowerCase().includes(searchLower))
    })
  }, [products, searchTerm])

  // Funciones para abrir/cerrar el modal de detalles del producto
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailModalOpen(true)
  }
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProduct(null)
  }

  /**
   * Función que maneja la actualización de un producto después de editarlo.
   * 
   * Actualiza los valores del producto en el estado de productos. Busca por
   * ID y sustituye el viejo por el actualizado.
   * 
   * Además, actualiza el producto seleccionado para que el modal de detalles muestre
   * los últimos cambios.
   */
  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((currentProducts) => currentProducts.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
    setProductsFiltered((currentProducts) => currentProducts.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
    setSelectedProduct(updatedProduct)
  }

  // Funciones para abrir y cerrar el modal de agregar producto
  const handleOpenAddModal = () => setIsAddProductModalOpen(true)
  const handleCloseAddModal = () => setIsAddProductModalOpen(false)

  // Función para guardar en caché la página actual de productos antes de navegar a otra página
  const saveCurrentPageAsPreviousCache = () => {
    savePreviousPageCache({
      page: currentPage,
      products,
      hasNextPage,
    })
  }

  // Función para manejar la navegación a la siguiente página de productos
  const handleNextPage = () => {
    if (!hasNextPage || isLoadingProducts) {
      return
    }

    saveCurrentPageAsPreviousCache()
    setCurrentPage((previousPage) => previousPage + 1)
  }

  // Función para manejar la navegación a la página anterior de productos
  const handlePreviousPage = () => {
    if (currentPage === 1 || isLoadingProducts) {
      return
    }

    saveCurrentPageAsPreviousCache()
    setCurrentPage((previousPage) => previousPage - 1)
  }

  /**
 * Función: Buscar productos por nombre o ID en la base de datos a través
 * de una petición HTTP GET al backend. Esta petición envía 2 parámetros:
 *  - like: Es la palabra u oración clave el cual se tomará en cuenta
 *          en la búsqueda dentro de la consulta de la base de datos
 * 
 *  - param: Es el nombre ed la columna a la cual se aplicará la búsqueda,
 *          en este caso, name o internal_code.
 */
  const search_product_by_name_or_id = async (like: string, signal: AbortSignal) => {
    setIsLoadingProductsFiltered(true)
    setProductsFilteredError("")

    try {
      // URL API
      const url = `${api_search_product}?like=${encodeURIComponent(like)}&param=name`

      // Solicitud HTTP
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal,
      })

      // Capturamos posible error HTTP (códigos 4xx o 5xx)
      if (!response.ok) {
        throw new Error(`No se pudo obtener los productos (HTTP ${response.status})`)
      }

      // Esperamos la respeusta y la parseamos como JSON
      const payload = await response.json()

      // Parseamos los productos al formato correspondiente
      const parsedProducts = payload.map(mapProduct)

      // Guardamos los productos buscados
      setProductsFiltered(parsedProducts)

    }
    // Capturamos posibles errores
    catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error al cargar productos:", error)
        setProductsFilteredError("No se pudieron cargar los productos desde el servidor.")
      }
    }
    // Finalmente, indicamos que la carga ha terminado (ya sea por éxito o error)
    finally {
      setIsLoadingProductsFiltered(false)
    }
  }

  // Función para manejar el comportamiento cuando se necesita buscar en base de datos
  const handleToggleSearchInDB = () => {
    // Activamos o desactivamos la búsqueda en base de datos. Si está true, entonces devuelve false, y viceversa
    setSearchInDB((previousValue) => !previousValue)

    // Borramos resultados de búsquedas anteriores
    setProductsFiltered([])

    // Resetamos errores anteriores
    setProductsFilteredError("")

    // Indicamos que no se está cargando ningún resultado
    setIsLoadingProductsFiltered(false)
  }


  /**
   * Función que obtiene los datos de categorías o unidades desde el backend para 
   * mostrarlos en el modal de agregar producto.
   * 
   * @param tagKey Es la key que identifica si se quieren obtener categorías o 
   * unidades. Puede ser "categories" o "units".
   */
  const getItemsFromTag = async (tagKey: SettingsSection) => {
    // Obtenemos la key
    const key: SettingsSection = tagKey

    // Obtenemos los items
    const items: SettingsCacheItem[] = await settingsLogic.getItems(key)

    return items
  }

  /**
   * Este hook crea una función y la ejecuta. Dicha función es capaz de crear
   * un array de categoría y unidades mediante la obtención de datos desde el
   * backend y mostrarla en el modal.
   */
  useEffect(() => {
    if (!isAddProductModalOpen && !isDetailModalOpen) {
      return
    }

    // Creamos la función asíncrona
    const loadProductOptions = async () => {
      // Actualizamos los estados de carga y error
      setIsLoadingProductOptions(true)
      setProductOptionsError("")

      try {
        // Obtenemos los datos 
        const [categoriesItems, unitsItems] = await Promise.all([
          getItemsFromTag("categories"),
          getItemsFromTag("units")
        ])

        // Actualizamos los estados de los datos
        setCategories(categoriesItems.map((item) => ({ id: item.id, category: item.text })))
        setUnits(unitsItems.map((item) => ({ id: item.id, unit: item.text })))
      }
      // Capturamos posibles errores
      catch (error) {
        console.error("No se pudieron cargar categorías y unidades:", error)
        setProductOptionsError("No se pudieron cargar categorías y unidades.")
      }
      // Actualizamos el estado de carga
      finally {
        setIsLoadingProductOptions(false)
      }
    }

    // Ejecuta la función asíncrona
    loadProductOptions()
  }, [isAddProductModalOpen, isDetailModalOpen])

  /**
   * Este hook es el encargado de manejar la lógica relacionada con la carga de productos
   * inicial. Se ejecuta cada vez que se cambia la página actual (currentPage) para cargar
   * los productos que se requieran.
   */
  useEffect(() => {
    // Usamos AbortController para poder cancelar la solicitud si el componente se desmonta antes de que la respuesta llegue
    const abortController = new AbortController()

    // Función que ejecuta la petición HTTP
    const loadProducts = async () => {
      // Reset de estados antes de iniciar la carga
      setIsLoadingProducts(true)
      setProductsError("")

      const cachedPage = getPreviousPageCache()

      if (cachedPage && cachedPage.page === currentPage) {
        setProducts(cachedPage.products)
        setHasNextPage(cachedPage.hasNextPage)
        setIsLoadingProducts(false)
        return
      }

      try {
        // URL API
        const offset = (currentPage - 1) * PRODUCTS_PER_PAGE
        const url = `${api_get_products}?limit=${PRODUCTS_FETCH_SIZE}&offset=${offset}&sort=name&desc=false`

        // Solicitud HTTP
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: abortController.signal,
        })

        // Capturamos posible error HTTP (códigos 4xx o 5xx)
        if (!response.ok) {
          throw new Error(`No se pudo obtener los productos (HTTP ${response.status})`)
        }

        // Esperamos la respeusta y la parseamos como JSON
        const payload = await response.json()

        // Parseamos los productos al formato correspondiente
        const parsedProducts = payload.map(mapProduct)
        const hasMoreProducts = parsedProducts.length === PRODUCTS_FETCH_SIZE
        const productsToDisplay = parsedProducts.slice(0, PRODUCTS_PER_PAGE)

        // Guardamos los productos en el estado
        setProducts(productsToDisplay)
        setHasNextPage(hasMoreProducts)

      }
      // Capturamos posibles errores
      catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error al cargar productos:", error)
          setProductsError("No se pudieron cargar los productos desde el servidor.")
        }
      }
      // Finalmente, indicamos que la carga ha terminado (ya sea por éxito o error)
      finally {
        setIsLoadingProducts(false)
      }
    }

    // Ejecutamos la función de carga de productos al montar el componente
    loadProducts()

    return () => {
      abortController.abort()
    }
  }, [currentPage])

  /**
   * Este hook es el encargado de manejar la lógica relacionada con la búsqueda de 
   * productos en la base de datos.
   */
  useEffect(() => {

    // Si no está activo la búsqueda por base de datos, entonces no hay nada que hacer
    if (!searchInDB) {
      // Vacía resultados anteriores
      setProductsFiltered([])

      // Limpia errores
      setProductsFilteredError("")

      // Indica que no se está cargando ningún resultado
      setIsLoadingProductsFiltered(false)

      // RETORNA porque no hay más nada que hacer
      return
    }

    // Lipiamos valores vacíos del inicio/final
    const normalizedSearchTerm = searchTerm.trim()

    // Si no hay ningún valor, entonces no hay nada que hacer
    if (!normalizedSearchTerm) {
      setProductsFiltered([])
      setProductsFilteredError("")
      setIsLoadingProductsFiltered(false)
      return
    }

    // Creamos un controlador para poder cancelar la solicitud si el componente se 
    // desmonta o si el término de búsqueda cambia antes de que la respuesta llegue
    const abortController = new AbortController()

    // Se envía la solicitud de búsqueda después de un pequeño retraso (debounce) 
    // para evitar enviar una solicitud por cada pulsación de tecla
    const debounceTimeout = setTimeout(() => {
      search_product_by_name_or_id(normalizedSearchTerm, abortController.signal)
    }, 750)

    return () => {
      // Limpiamos el timeout para evitar llamadas innecesarias
      clearTimeout(debounceTimeout)

      // Limpiamos la solicitud en caso de que el componente se
      // desmonte o el término de búsqueda cambie
      abortController.abort()
    }
  }, [searchTerm, searchInDB])

  /**
   * NO TOCAR
   * 
   * Este hook se encarga de actualizar la posición del dropdown de resultados de búsqueda
   * cada vez que cambian el término de búsqueda o el estado de búsqueda en la base de datos.
   */
  useEffect(() => {
    if (!searchInDB || !searchTerm.trim()) {
      return
    }

    const updateDropdownPosition = () => {
      if (!searchWrapperRef.current) {
        return
      }

      const rect = searchWrapperRef.current.getBoundingClientRect()
      const horizontalPadding = 16
      const maxWidth = Math.max(window.innerWidth - horizontalPadding * 2, 0)
      const width = Math.min(rect.width, maxWidth)
      const maxLeft = window.innerWidth - width - horizontalPadding
      const left = Math.max(horizontalPadding, Math.min(rect.left, maxLeft))

      setDropdownPosition({
        top: rect.bottom + 8,
        left,
        width,
      })
    }

    updateDropdownPosition()
    window.addEventListener("resize", updateDropdownPosition)
    window.addEventListener("scroll", updateDropdownPosition, true)

    return () => {
      window.removeEventListener("resize", updateDropdownPosition)
      window.removeEventListener("scroll", updateDropdownPosition, true)
    }
  }, [searchInDB, searchTerm])

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      {/* Contenedor del menú de búsqueda y acción principal */}
      <div className="shrink-0 w-full bg-white border-b border-[#E5E7EB] px-6 md:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div ref={searchWrapperRef} className="flex-1 min-w-0">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <SearchResultsDropdown
              isVisible={searchInDB && Boolean(searchTerm.trim())}
              isLoading={isLoadingProductsFiltered}
              error={productsFilteredError}
              searchTerm={searchTerm.trim()}
              results={productsFiltered}
              onViewDetails={handleViewDetails}
              position={dropdownPosition}
            />
          </div>
          <button
            onClick={handleToggleSearchInDB}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border shadow-sm transition-all ${searchInDB
              ? "border-[#1e11d9] bg-[#1e11d9]/10 text-[#1e11d9] hover:bg-[#1e11d9]/15"
              : "border-[#E5E7EB] bg-white text-[#363636] hover:border-[#1e11d9]/50"
              }`}
          >
            <Database className="size-4" strokeWidth={2.5} />
            <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px] whitespace-nowrap">
              {searchInDB ? "Búsqueda BD: Activa" : "Búsqueda BD"}
            </span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-[#1e11d9] to-[#003D9D] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px] whitespace-nowrap">
              Agregar Producto
            </span>
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 min-h-0 px-6 md:px-8 py-6">

        {/* Estado de carga por defecto: Se muestra un mensaje que se están cargando los productos */}
        {isLoadingProducts && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            Cargando productos...
          </p>
        )}

        {/* Estado de error: Se muestra un mensaje si ocurre un error al cargar los productos */}
        {!isLoadingProducts && productsError && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#c50707]">
            {productsError}
          </p>
        )}

        {/* Estado de vacío: Se muestra un mensaje si no hay productos para mostrar */}
        {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
          <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
            {searchTerm ? "No hay productos para mostrar con ese criterio de búsqueda." : "No hay productos para mostrar."}
          </p>
        )}

        {/* Estado de éxito: Se muestra la lista de productos si se cargaron correctamente */}
        {!isLoadingProducts && !productsError && filteredProducts.length > 0 && (
          <ProductList viewMode={viewMode} products={filteredProducts} onViewDetails={handleViewDetails} getStockColor={getStockColor} />
        )}

        {!isLoadingProducts && !productsError && (
          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoadingProducts}
              className="px-4 hover:cursor-pointer py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#363636] font-['Inter:Bold',sans-serif] font-bold text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#6B7280]">
              Página {currentPage}
            </span>

            <button
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoadingProducts}
              className="px-4 hover:cursor-pointer py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#363636] font-['Inter:Bold',sans-serif] font-bold text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Abrir un submenu donde se detallan datos de un producto específico */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          product={selectedProduct}
          categories={categories}
          units={units}
          isLoadingOptions={isLoadingProductOptions}
          optionsError={productOptionsError}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {/* Modal para agregar un nuevo producto */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={handleCloseAddModal}
        categories={categories}
        units={units}
        isLoadingOptions={isLoadingProductOptions}
        optionsError={productOptionsError}
      />
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