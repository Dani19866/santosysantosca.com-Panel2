import {
  useEffect,
  useState,
} from "react"
import {
  AlertTriangle,
  ListTree,
  Ruler,
  Tag,
} from "lucide-react"
import Layout from "../layout/Layout"
import CategoryModal from "../components/settings/CategoryModal"
import UnitModal from "../components/settings/UnitModal"
import DowntimeReasonModal from "../components/settings/DowntimeReasonModal"
import MovementReasonModal from "../components/settings/MovementReasonModal"
import {
  type SettingsCacheItem
} from "../logic/settingsLogic.ts"
import SettingsCard from "../components/settings/SettingsCard.tsx"
import type { SettingsSection } from "../scripts/URL.ts"
import { tags } from "../scripts/URL.ts"
import { send_http_get, send_http_post, send_http_patch } from "../scripts/http.ts"
import { settingsLogic } from "../logic/settingsLogic.ts"

// Interfaz para definir los items de las tarjetas
interface SettingItemsCards {
  key: SettingsSection
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  onClick: () => void,
  updateState: (items: SettingsCacheItem[]) => void
  getState: () => SettingsCacheItem[]
}

// Interfaz para definir el arreglo de secciones de configuración base del sistema
interface settingsSection {
  head: string
  cards: SettingItemsCards[]
}


export default function SettingsPage({ authProvider }: { authProvider: boolean }) {
  // Datos de configuración
  const [categories, setCategories] = useState<SettingsCacheItem[]>([])
  const [units, setUnits] = useState<SettingsCacheItem[]>([])
  const [errorCodes, setErrorCodes] = useState<SettingsCacheItem[]>([])
  const [movementReasons, setMovementReasons] = useState<SettingsCacheItem[]>([])

  // Estado de modales (abrir/cerrar)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [isErrorCodeModalOpen, setIsErrorCodeModalOpen] = useState(false)
  const [isMovementReasonModalOpen, setIsMovementReasonModalOpen] = useState(false)

  // Estado de carga y errores
  const [isLoading, setIsLoading] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [generalError, setGeneralError] = useState("")

  // Diccionario de tarjetas de configuración para facilitar operaciones
  const settingsCards: settingsSection[] = [
    {
      head: "Configuración de etiquetas",
      cards: [
        {
          key: "categories",
          title: "Categorias",
          description: "Gestiona las categorias de productos",
          icon: Tag,
          onClick: () => { setIsCategoryModalOpen(true); refreshSettings(false, "categories") },
          updateState: (categories: SettingsCacheItem[]) => setCategories(categories),
          getState: () => categories
        },
        {
          key: "units",
          title: "Unidades",
          description: "Gestiona las unidades de medida",
          icon: Ruler,
          onClick: () => { setIsUnitModalOpen(true); refreshSettings(false, "units") },
          updateState: (units: SettingsCacheItem[]) => setUnits(units),
          getState: () => units
        },
        {
          key: "machineFails",
          title: "Codigos de fallas",
          description: "Gestiona codigos de averias y paradas",
          icon: AlertTriangle,
          onClick: () => { setIsErrorCodeModalOpen(true); refreshSettings(false, "machineFails") },
          updateState: (machineFails: SettingsCacheItem[]) => setErrorCodes(machineFails),
          getState: () => errorCodes
        },
        {
          key: "movementReasons",
          title: "Razones de movimientos",
          description: "Gestiona las razones de movimientos de productos",
          icon: ListTree,
          onClick: () => { setIsMovementReasonModalOpen(true); refreshSettings(false, "movementReasons") },
          updateState: (movementReasons: SettingsCacheItem[]) => setMovementReasons(movementReasons),
          getState: () => movementReasons
        }
      ]
    }
  ]

  // Función que envía una petición HTTP GET para obtener los datos de configuración
  const refreshSettings = async (showLoading = false, section: SettingsSection, forceRefresh = false) => {
    // Limpiamos errores previos
    setRequestError("")
    setIsLoading(showLoading)

    // Obtenemos la función que actualiza el estado 
    const updateStateFunction = settingsCards.flatMap((section) => section.cards).find((card) => card.key === section)?.updateState

    // Obtenemos el estado que almacena los valores 
    const getStateFunction = settingsCards.flatMap((section) => section.cards).find((card) => card.key === section)?.getState

    // No ejecutamos la solicitud HTTP si ya hay datos en el estado
    if (getStateFunction && getStateFunction().length != 0 && !forceRefresh) {
      // console.log("Se encontraron datos en el estado, no se realizará la solicitud HTTP.")
      return
    }

    try {
      // Obtenemos los items
      const items: SettingsCacheItem[] = await settingsLogic.getItems(section, forceRefresh)

      // Si hay función y hay datos
      if (updateStateFunction && items) {
        // console.log("Se actualizará el estado con los nuevos datos obtenidos.")
        updateStateFunction(items)
      }

    } catch (error) {
      setRequestError("Ocurrió un error al obtener los datos de configuración.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función que envía una petición HTTP POST para crear un nuevo item de configuración
  const createSetting = async (section: SettingsSection, name: string) => {
    // Limpiamos errores previos y actualizamos estado de carga
    setRequestError("")
    setIsLoading(true)

    // Obtener URL de la sección
    const itemUrl = (tags.find((tag) => tag.key === section)?.urls.save) ?? ""

    // Verificamos si existe la URL
    if (!itemUrl) {
      setRequestError("No se encontró la URL para esta sección de configuración.")
      return
    }

    try {
      // Construimos el body con la key exacta que la API espera segun la seccion.
      const body = settingsLogic.buildCreatePayload(section, name)

      // Obtenemos la respuesta del servidor
      const payload = await send_http_post(itemUrl, body)

      // Parseamos la respuesta
      const res = JSON.parse(JSON.stringify(payload))

      // Actualizamos la lista de items de la sección
      refreshSettings(true, section, true)

    } catch (error) {
      setRequestError("Ocurrió un error al crear el item de configuración.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función que envía una petición HTTP PATCH para actualizar un item de configuración existente
  const updateSetting = async (section: SettingsSection, id: string, name: string) => {
    // Limpiamos errores previos y actualizamos estado de carga
    setRequestError("")
    setIsLoading(true)

    // Obtener URL de la sección
    const urlBase = (tags.find((tag) => tag.key === section)?.urls.modify) ?? ""

    // Verificamos si existe la URL
    if (!urlBase) {
      setRequestError("No se encontró la URL para esta sección de configuración.")
      return
    }

    // Cambiar {id} por el id 
    const itemUrl = urlBase.replace("{id}", id)

    try {
      // Construimos el body con el ID y el nuevo nombre
      const key = settingsLogic.getKeyBySection(section)
      const body = { [key]: name }

      // Enviamos la solicitud PATCH para actualizar el item
      const payload = await send_http_patch(itemUrl, body)

      // Parseamos la respuesta
      const res = JSON.parse(JSON.stringify(payload))

      // Actualizamos la lista de items de la sección
      refreshSettings(true, section, true)

    } catch (error) {
      setRequestError("Ocurrió un error al actualizar el item de configuración.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Layout con modo de vista desactivado debido a que no hay necesidad
    <Layout authProvider={authProvider} showViewMode={false} description="Gestiona parametros base del sistema">

      {/* Contenedor principal */}
      <div className="flex h-full w-full flex-col bg-[#F9FAFB]">

        {/* Contenedor principal */}
        <div className="flex-1 overflow-auto px-6 py-6 md:px-8">

          {/* Contenedor de tarjetas de producción */}
          <div className="w-full space-y-8">

            {/* Mostrar mensaje de error */}
            {generalError && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B91C1C]">
                {generalError}
              </div>
            )}

            {/* Renderizar secciones de configuración */}
            {settingsCards.map((section, key) => (
              <div key={key}>
                {/* Encabezado de tarjeta */}
                <h2 className="mb-4 text-[18px] font-bold text-[#363636]">{section.head}</h2>

                {/* Contenedor de tarjetas */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-3">
                  {
                    section.cards.map((card) => (
                      <SettingsCard
                        key={card.key}
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                        onClick={card.onClick}
                      />
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modales de configuración */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          isLoading={isLoading}
          errorMessage={requestError}
          onRefresh={() => refreshSettings(true, "categories", true)}
          onCreate={(name) => createSetting("categories", name)}
          onUpdate={(id, name) => updateSetting("categories", id, name)}

        />

        <UnitModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          units={units}
          isLoading={isLoading}
          errorMessage={requestError}
          onRefresh={() => refreshSettings(true, "units", true)}
          onCreate={(name) => createSetting("units", name)}
          onUpdate={(id, name) => updateSetting("units", id, name)}
        />

        <DowntimeReasonModal
          isOpen={isErrorCodeModalOpen}
          onClose={() => setIsErrorCodeModalOpen(false)}
          downtimeReasons={errorCodes}
          isLoading={isLoading}
          errorMessage={requestError}
          onRefresh={() => refreshSettings(true, "machineFails", true)}
          onCreate={(name) => createSetting("machineFails", name)}
          onUpdate={(id, name) => updateSetting("machineFails", id, name)}
        />

        <MovementReasonModal
          isOpen={isMovementReasonModalOpen}
          onClose={() => setIsMovementReasonModalOpen(false)}
          movementReasons={movementReasons}
          isLoading={isLoading}
          errorMessage={requestError}
          onRefresh={() => refreshSettings(true, "movementReasons", true)}
          onCreate={(name) => createSetting("movementReasons", name)}
          onUpdate={(id, name) => updateSetting("movementReasons", id, name)}
        />
      </div>
    </Layout>
  )
}