import { useEffect, useMemo, useState } from "react"
import { DollarSign, Factory, Package, ShoppingCart, TrendingDown, TrendingUp, X } from "lucide-react"
import type { Product } from "../../interfaces/product"
import type { Category } from "../../interfaces/category"
import type { Unit } from "../../interfaces/unit"
import { mapProduct } from "../../controllers/productController"
import { send_http_patch } from "../../scripts/http"
import { api_modify_product } from "../../scripts/URL"
import {
  type CostTrend,
  type StockStatus,
  createFormDataFromProduct,
  HIGH_LEVEL,
  MEDIUM_LEVEL,
  LOW_LEVEL,
} from "../../controllers/productController"
import type { ProductFormData } from "../../interfaces/product"

// COMPONENTE: Interfaz de propiedades para el componente ProductDetailModal (este componente)
interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  categories: Category[]
  units: Unit[]
  isLoadingOptions: boolean
  optionsError: string
  onProductUpdated: (product: Product) => void
}

// IDENTIFICACIÓN: Interfaz de errores de los campos del formulario de edición de producto
interface ProductEditFieldErrors {
  name: boolean
  internal_code: boolean
  category: boolean
  unit: boolean
  cost_value: boolean
  safety_stock_level: boolean
  productType: boolean
}

// UTILIDAD: Solo resetea los valores de errores
const INITIAL_FIELD_ERRORS: ProductEditFieldErrors = {
  name: false,
  internal_code: false,
  category: false,
  unit: false,
  cost_value: false,
  safety_stock_level: false,
  productType: false,
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  categories,
  units,
  isLoadingOptions,
  optionsError,
  onProductUpdated,
}: ProductDetailModalProps) {
  if (!isOpen) return null

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<ProductEditFieldErrors>(INITIAL_FIELD_ERRORS)
  const [formData, setFormData] = useState<ProductFormData>(() => createFormDataFromProduct(product))

  /**
   * LÓGICA: Hook que permite reiniciar el estado del formulario cada vez que se 
   * abre el modal con un producto diferente.
   */
  useEffect(() => {
    // Estado de edición
    setIsEditing(false)

    // Estado de guardado
    setIsSaving(false)

    // Limpiar error
    setSaveError("")

    // Reiniciar errores de campos
    setFieldErrors(INITIAL_FIELD_ERRORS)

    // Reiniciar datos del formulario con la información del producto actual
    setFormData(createFormDataFromProduct(product))
  }, [product])

  /**
   * UTILIDAD: Retorna a través del hook useMemo, las categorías de los productos. Se
   * utiliza useMemo para que se ejecute solo una vez el cálculo ya que no es
   * necesario recalcularlo cada vez que se renderiza el componente, sino solo
   * cuando cambian las categorías o el producto.
   */
  const categoryOptions = useMemo(() => {
    if (categories.some((item) => item.category === product.category)) {
      return categories
    }

    return [{ id: "current-category", category: product.category }, ...categories]
  }, [categories, product.category])

  /**
   * UTILIDAD: Retorna a través del hook useMemo, las unidades de los productos. Se
   * utiliza useMemo para que se ejecute solo una vez el cálculo ya que no es
   * necesario recalcularlo cada vez que se renderiza el componente, sino solo
   * cuando cambian las unidades o el producto.
   */
  const unitOptions = useMemo(() => {
    if (units.some((item) => item.unit === product.unit)) {
      return units
    }

    return [{ id: "current-unit", unit: product.unit }, ...units]
  }, [units, product.unit])

  /**
   * lógica: Retorna el estado del stock de un producto basado en su stock actual y 
   * el nivel de stock de seguridad.
   * 
   * @param current Recibe la cantidad de producto actual en la base de datos
   * @param safety Recibe la cantidad de nivel seguro en la base de datos
   * @returns Retorna un objeto StockStatus
   */
  const getStockStatus = (current: number, safety: number): StockStatus => {
    // Si no hay nivel de seguridad
    if (safety <= 0) {
      return { label: "Sin referencia", color: "text-[#9CA3AF]", bg: "bg-[#9CA3AF]/10", border: "border-[#9CA3AF]/40" }
    }

    // Porcentaje de cantidad actual con respecto a lo seguro
    const percentage = (current / safety) * 100

    // Estilos en base a la cantidad segura
    if (percentage >= HIGH_LEVEL) return { label: "Óptimo", color: "text-[#10c507]", bg: "bg-[#10c507]/10", border: "border-[#10c507]/40" }
    if (percentage >= MEDIUM_LEVEL) return { label: "Normal", color: "text-[#1e11d9]", bg: "bg-[#1e11d9]/10", border: "border-[#1e11d9]/40" }
    if (percentage >= LOW_LEVEL) return { label: "Bajo", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/40" }
    return { label: "Crítico", color: "text-[#c50707]", bg: "bg-[#c50707]/10", border: "border-[#c50707]/40" }
  }

  /**
   * Variable que guarda el diccionario de estilos para mostrar el estado de stock
   * del producto.
   */
  const stockStatus = getStockStatus(product.current_stock, product.safety_stock_level)

  /**
   * LÓGICA: Esta función calcula a través del arreglo de datos de historial de costo,
   * la tendencia de costo del producto.
   * 
   * Utiliza el último y el penúltimo costo registrado para calcular el cambio 
   * porcentual entre ambos, y así determinar si el costo ha aumentado, disminuido o s
   * e ha mantenido igual.
   * 
   * @returns Retorna un objeto CostTrend
   */
  const getCostTrend = (): CostTrend => {
    // Si hay menos de 2 items (1, 0), entonces no se muestra ningún gráfico
    if (product.cost_history.length < 2) return null

    // Se obtiene el último costo
    const latest = product.cost_history[product.cost_history.length - 1].cost

    // Se obtiene el penúltimo costo
    const previous = product.cost_history[product.cost_history.length - 2].cost

    // Si el penúltimo costo almacenado es 0, entonces quiere decir que no hubo
    // ningún cambio de tendencia, o fue un error de guardado
    if (previous === 0) {
      return { change: "0.0", isIncrease: latest > 0 }
    }

    // Se calcula el cambio porcentual entre el último costo y el penúltimo costo
    const change = ((latest - previous) / previous) * 100

    // Retorna un diccionario del valor de cambio porcentual, y si aumentó o 
    // disminuyó el costo
    return {
      change: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
    }
  }

  /**
   * Variable que almacena el resultado del cálculo de la tendencia de costo del producto
   */
  const trend = getCostTrend()

  /**
   * Manejador de modificación de valores de un producto
   * 
   * Se encarga de activar la modificación de los valores del producto, reiniciar el error
   * si es que hubo alguno anteriormente, y reiniciar los errores de validación de campos 
   * para que el usuario tenga una nueva oportunidad de ingresar los datos correctamente. 
   * 
   * Además, se asegura de cargar los datos actuales del producto en el formulario para que 
   * el usuario pueda editarlos directamente sin tener que volver a ingresarlos desde cero.
   */
  const handleStartEdit = () => {
    // Estado de edición activado
    setIsEditing(true)

    // Reiniciar error de guardado
    setSaveError("")

    // Reiniciar errores de campos
    setFieldErrors(INITIAL_FIELD_ERRORS)

    // Cargar datos actuales del producto en el formulario
    setFormData(createFormDataFromProduct(product))
  }

  /**
   * Manejador para cancelar la edición de un producto
   * 
   * Reinicia estado de edición, errores mostrado en pantalla, errores en campos, y por útlimo
   * reinica el formulario con los datos de dicho producto.
   * 
   * Esto permite que el usuario pueda cancelar la edición en cualquier momento y volver a ver 
   * los datos originales del producto sin que los cambios realizados se mantengan en el formulario. 
   */
  const handleCancelEdit = () => {
    // Estado de edición desactivado
    setIsEditing(false)

    // Reiniciar error de guardado
    setIsSaving(false)

    // Borramos errores guardados
    setSaveError("")

    // Reiniciar errores de campos
    setFieldErrors(INITIAL_FIELD_ERRORS)

    // Reiniciamos el formulario con el campo del producto de ese instante
    setFormData(createFormDataFromProduct(product))
  }

  /**
   * LÓGICA: Función que modifica los valores de un producto en la base de datos.
   * 
   * Este obtiene todos los datos del formulario, los comprueba para confirmar que no hay 
   * errores; si hay errores, entonces cancela la función. Luego, actualiza los estados
   * de actualización y error para hacer reset. Por último, prepara el envío de la solicitud
   * HTTP Patch al servidor con los datos necesarios, y luego confirma para actualizar 
   * el producto en pantalla con los nuevos valores, o mostrar un error si es que no se 
   * pudo actualizar.
   */
  const handleSave = async () => {
    // Parseamos el costo a formato Number
    const parsedCost = Number(formData.cost_value)

    // Parseamos el stock seguro a formato Number
    const parsedSafetyStock = Number(formData.safety_stock_level)

    // Validamos los campos del formulario y guardamos los errores en un diccionario
    const nextErrors: ProductEditFieldErrors = {
      name: formData.name.trim() === "",                                              // Verificamos que no esté vacío
      internal_code: formData.internal_code.trim() === "",                            // Verificamos que no esté vacío
      category: formData.category.trim() === "",                                      // Verificamos que no esté vacío
      unit: formData.unit.trim() === "",                                              // Verificamos que no esté vacío
      cost_value: Number.isNaN(parsedCost) || parsedCost < 0,                         // Verificamos que sea un número, y que sea mayor que 0
      safety_stock_level: Number.isNaN(parsedSafetyStock) || parsedSafetyStock < 0,   // Verificamos que sea un número, y que sea mayor que 0
      productType: !formData.is_purchased && !formData.is_manufactured,               // Verificamos que al menos un tipo de producto esté seleccionado
    }

    // Guardamos los errores en el estado para mostrarlos en pantalla
    setFieldErrors(nextErrors)

    // Si hay algún error, entonces no se guarda ningún dato
    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    // Se actualizan los estados de cambio y actualización de base de datos
    setIsSaving(true)
    setSaveError("")

    try {
      // Se obtiene la URL de modificación, y se reemplaza por el id del producto
      const url = api_modify_product.replace("{id}", encodeURIComponent(product.id))

      // Se carga el payload
      const payload: ProductFormData = { ...formData }

      // Envía la solicitud HTTP PATCH
      const response = await send_http_patch(url, payload)

      // Verifica si hay respuesta, si es un objeto y si tiene la propiedad ID
      const updatedProduct = response && typeof response === "object" && "id"
        in response ?
        // Si se cumple, entonces se mapea la respuesta a un objeto tipo Product
        mapProduct(response)
        :
        // Si no se cumple, igualmente se actualiza los valores en pantalla
        {
          ...product,
          name: payload.name,
          internal_code: payload.internal_code,
          category: payload.category,
          unit: payload.unit,
          cost_value: payload.cost_value,
          safety_stock_level: payload.safety_stock_level,
          is_purchased: payload.is_purchased,
          is_manufactured: payload.is_manufactured,
        }

      // Función que actualiza el producto en pantalla con los nuevos valores,
      // y cierra el modo de edición
      onProductUpdated(updatedProduct)

      // Se establece el estado de edición en false
      setIsEditing(false)
    } catch (error) {
      console.error("No se pudo actualizar el producto:", error)
      setSaveError("No se pudo guardar los cambios del producto.")

    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      {/* Contenedor principal */}
      <div className="w-full max-w-200 max-h-[90vh] overflow-hidden rounded-[20px] bg-white shadow-2xl flex flex-col">

        {/* Header del contenedor */}
        <div className="relative bg-linear-to-br from-[#1e11d9] to-[#1508a8] px-6 py-6 md:px-8 md:py-7 text-white">
          {/* Casilla "X" */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="size-5 text-white" />
          </button>

          {/* Información básica del ítem */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
              <Package className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ?
                // Si se está editando...
                (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.internal_code}
                      onChange={(event) => {
                        setFormData({ ...formData, internal_code: event.target.value })
                        if (fieldErrors.internal_code) {
                          setFieldErrors({ ...fieldErrors, internal_code: false })
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-[13px] bg-white/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 ${fieldErrors.internal_code
                        ? "border-[#DC2626] focus:ring-[#DC2626]"
                        : "border-white/30 focus:ring-white/60"
                        }`}
                      placeholder="Código interno"
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) => {
                        setFormData({ ...formData, name: event.target.value })
                        if (fieldErrors.name) {
                          setFieldErrors({ ...fieldErrors, name: false })
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-[18px] md:text-[20px] font-['Inter:Bold',sans-serif] font-bold bg-white/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 ${fieldErrors.name
                        ? "border-[#DC2626] focus:ring-[#DC2626]"
                        : "border-white/30 focus:ring-white/60"
                        }`}
                      placeholder="Nombre del producto"
                    />
                  </div>
                )
                :
                // Si no se está editando, solo se muestra
                (
                  <>
                    <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-white/70">
                      {product.internal_code}
                    </span>
                    <h2 className="mt-1 font-['Inter:Bold',sans-serif] font-bold text-[20px] md:text-[22px] text-white wrap-break-word">
                      {product.name}
                    </h2>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Información relevante del ítem */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5">

          {/* Casilla grande para mostrar el stock conforme su estado */}
          <div className={`${stockStatus.bg} border-2 ${stockStatus.border} rounded-2xl p-5 md:p-6`}>
            <div className="flex items-center justify-between gap-4">

              {/* Título y cantidad (stock) */}
              <div>
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]/70 uppercase tracking-wider mb-2">
                  Stock Actual
                </p>
                <p className={`font-['Inter:Bold',sans-serif] font-bold text-[30px] md:text-[36px] ${stockStatus.color}`}>
                  {product.current_stock.toLocaleString()}
                </p>
              </div>

              {/* Subtítulo: Crítico, óptimo, etc */}
              <span className={`shrink-0 px-4 py-2 rounded-xl ${stockStatus.bg} ${stockStatus.color} font-['Inter:Bold',sans-serif] font-bold text-[14px]`}>
                {stockStatus.label}
              </span>
            </div>

          </div>

          {/* Casillas para mostrar unidad de medida, stock seguro y costo actual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Unidad de medida */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Unidad de Medida
              </p>
              {isEditing ?
                // Si se está editando...
                (
                  <select
                    value={formData.unit}
                    onChange={(event) => {
                      setFormData({ ...formData, unit: event.target.value })
                      if (fieldErrors.unit) {
                        setFieldErrors({ ...fieldErrors, unit: false })
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border bg-white text-[14px] text-[#363636] focus:outline-none focus:ring-2 ${fieldErrors.unit
                      ? "border-[#DC2626] focus:ring-[#DC2626]"
                      : "border-[#E5E7EB] focus:ring-[#1e11d9]"
                      }`}
                  >
                    {unitOptions.map((item) => (
                      <option key={item.id} value={item.unit}>
                        {item.unit}
                      </option>
                    ))}
                  </select>
                )
                :
                // Si no se está editando, solo se muestra
                (
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[15px] text-[#363636]">{product.unit}</p>
                )}
            </div>

            {/* Categoría */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Categoría
              </p>
              {isEditing ? (
                <select
                  value={formData.category}
                  onChange={(event) => {
                    setFormData({ ...formData, category: event.target.value })
                    if (fieldErrors.category) {
                      setFieldErrors({ ...fieldErrors, category: false })
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white text-[14px] text-[#363636] focus:outline-none focus:ring-2 ${fieldErrors.category
                    ? "border-[#DC2626] focus:ring-[#DC2626]"
                    : "border-[#E5E7EB] focus:ring-[#1e11d9]"
                    }`}
                >
                  {categoryOptions.map((item) => (
                    <option key={item.id} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[15px] text-[#363636]">{product.category}</p>
              )}
            </div>

            {/* Stock seguro */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Stock Seguro
              </p>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={formData.safety_stock_level}
                  onChange={(event) => {
                    setFormData({ ...formData, safety_stock_level: Number(event.target.value) })
                    if (fieldErrors.safety_stock_level) {
                      setFieldErrors({ ...fieldErrors, safety_stock_level: false })
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white text-[14px] text-[#363636] focus:outline-none focus:ring-2 ${fieldErrors.safety_stock_level
                    ? "border-[#DC2626] focus:ring-[#DC2626]"
                    : "border-[#E5E7EB] focus:ring-[#1e11d9]"
                    }`}
                />
              ) : (
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[15px] text-[#363636]">{product.safety_stock_level.toLocaleString()}</p>
              )}
            </div>

            {/* Costo Actual */}
            <div className="bg-linear-to-br from-[#1e11d9]/5 to-transparent rounded-xl p-4 border border-[#1e11d9]/20 md:col-span-3">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#363636]/60 uppercase tracking-wide mb-2">
                Costo Actual
              </p>
              <div className="flex items-center justify-between gap-3">
                {isEditing ? (
                  <div className="w-full max-w-55">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_value}
                      onChange={(event) => {
                        setFormData({ ...formData, cost_value: Number(event.target.value) })
                        if (fieldErrors.cost_value) {
                          setFieldErrors({ ...fieldErrors, cost_value: false })
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border bg-white text-[16px] text-[#1e11d9] font-['Inter:Bold',sans-serif] font-bold focus:outline-none focus:ring-2 ${fieldErrors.cost_value
                        ? "border-[#DC2626] focus:ring-[#DC2626]"
                        : "border-[#1e11d9]/20 focus:ring-[#1e11d9]"
                        }`}
                    />
                  </div>
                ) : (
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-[#1e11d9]">${product.cost_value.toFixed(2)}</p>
                )}
                {trend && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${trend.isIncrease ? "bg-[#c50707]/10 text-[#c50707]" : "bg-[#10c507]/10 text-[#10c507]"}`}
                  >
                    {trend.isIncrease ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px]">{trend.change}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial de costos */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="bg-[#F9FAFB] px-5 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] flex items-center gap-2">
                <DollarSign className="size-4 text-[#1e11d9]" />
                Historial de Costos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Fecha</span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Descripción</span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#363636] uppercase tracking-wide">Costo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.cost_history.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">
                        Sin historial registrado
                      </td>
                    </tr>
                  )}
                  {product.cost_history.map((entry, index) => (
                    <tr
                      key={`${entry.date}-${index}`}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#363636]">{entry.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#9CA3AF]">{entry.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-['Inter:Bold',sans-serif] font-bold text-[13px] text-[#1e11d9]">${entry.cost.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Características del producto */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-3">Capacidades del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-lg ${(!isEditing ? product.is_manufactured : formData.is_manufactured)
                  ? "border-[#1e11d9] bg-[#1e11d9]/5"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Factory className={`size-4 ${(!isEditing ? product.is_manufactured : formData.is_manufactured) ? "text-[#1e11d9]" : "text-[#9CA3AF]"}`} strokeWidth={2.5} />
                  <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">Se puede fabricar</span>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData.is_manufactured}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setFormData({ ...formData, is_manufactured: checked })
                      if (fieldErrors.productType && (checked || formData.is_purchased)) {
                        setFieldErrors({ ...fieldErrors, productType: false })
                      }
                    }}
                    className="size-5 text-[#1e11d9] rounded"
                  />
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full font-['Inter:Bold',sans-serif] font-bold text-[11px] ${product.is_manufactured
                      ? "bg-[#1e11d9]/15 text-[#1e11d9]"
                      : "bg-[#E5E7EB] text-[#6B7280]"
                      }`}
                  >
                    {product.is_manufactured ? "Sí" : "No"}
                  </span>
                )}
              </div>

              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-lg ${(!isEditing ? product.is_purchased : formData.is_purchased)
                  ? "border-[#10c507] bg-[#10c507]/5"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`size-4 ${(!isEditing ? product.is_purchased : formData.is_purchased) ? "text-[#10c507]" : "text-[#9CA3AF]"}`} strokeWidth={2.5} />
                  <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">Se puede comprar</span>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData.is_purchased}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setFormData({ ...formData, is_purchased: checked })
                      if (fieldErrors.productType && (checked || formData.is_manufactured)) {
                        setFieldErrors({ ...fieldErrors, productType: false })
                      }
                    }}
                    className="size-5 text-[#10c507] rounded"
                  />
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full font-['Inter:Bold',sans-serif] font-bold text-[11px] ${product.is_purchased
                      ? "bg-[#10c507]/15 text-[#10c507]"
                      : "bg-[#E5E7EB] text-[#6B7280]"
                      }`}
                  >
                    {product.is_purchased ? "Sí" : "No"}
                  </span>
                )}
              </div>
            </div>

            {isEditing && fieldErrors.productType && (
              <p className="mt-2 font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#c50707]">
                Selecciona al menos una capacidad del producto.
              </p>
            )}
          </div>

          {/* Mensajes de error y carga */}
          {isEditing &&
            (
              <div className="space-y-2">
                {(fieldErrors.name || fieldErrors.internal_code || fieldErrors.category || fieldErrors.unit || fieldErrors.cost_value || fieldErrors.safety_stock_level) && (
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#c50707]">
                    Verifica los campos obligatorios y que los valores numéricos sean mayores o iguales a 0.
                  </p>
                )}
                {isLoadingOptions && (
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#6B7280]">
                    Cargando categorías y unidades...
                  </p>
                )}
                {optionsError && (
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#c50707]">
                    {optionsError}
                  </p>
                )}
                {saveError && (
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-[#c50707]">
                    {saveError}
                  </p>
                )}
              </div>
            )}
        </div>

        {/* Botones de acciones: Editar, cancelar, guardar y salir */}
        <div className="px-6 py-4 md:px-8 md:py-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-3">
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="px-6 py-3 rounded-xl bg-linear-to-r from-[#1e11d9] to-[#003D9D] hover:opacity-95 transition-all duration-200"
            >
              <span className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-white">Editar</span>
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl border-2 border-[#E5E7EB] hover:border-[#363636] hover:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#363636]">Cancelar</span>
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-linear-to-r from-[#1e11d9] to-[#003D9D] hover:opacity-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-white">{isSaving ? "Guardando..." : "Guardar"}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-[#E5E7EB] hover:border-[#363636] hover:bg-white transition-all duration-200"
          >
            <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#363636]">Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
