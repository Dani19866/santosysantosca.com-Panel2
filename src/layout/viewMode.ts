import { createContext, useContext } from "react"
import { Grid3x3, LayoutList, List } from "lucide-react"

export type ViewMode = "cards" | "table" | "compact"

/**
 * Función: Definir los modos de vista disponibles para la aplicación
 * y los íconos asociados a cada modo.
 * 
 */
export const viewModes: Array<{ mode: ViewMode; icon: typeof Grid3x3; title: string }> = [
  { mode: "cards", icon: Grid3x3, title: "Vista de tarjetas" },
  { mode: "table", icon: List, title: "Vista de tabla" },
  { mode: "compact", icon: LayoutList, title: "Vista compacta" },
]

/**
 * Función: Crear un contexto para el modo de vista (ViewMode) que permita
 * compartir el estado del modo de vista y una función para actualizarlo
 * a lo largo de la aplicación, actuando como una variable global. 
 * 
 * Propiedades del contexto:
 * - viewMode: El estado actual del modo de vista, que puede ser "cards", 
 *   "table" o "compact".
 * 
 * - setViewMode: Una función que permite actualizar el estado del modo 
 *   de vista. Recibe un modo de vista válido como argumento y no devuelve
 *   nada (void).
 * 
 */
type ViewModeContextValue = {
  viewMode: ViewMode        
  setViewMode: (mode: ViewMode) => void
}

/**
 * Se define el dato que se quiere compartir globalmente entre todos los
 * componentes de la aplicación, en este caso, el modo de vista (viewMode) y
 * la función para actualizarlo (setViewMode).
 * 
 * Para que funcione correctamente, primero se crea el contexto utilizando 
 * "createContext" fuera del componente. Luego, dentro del componente que 
 * se encargará de proporcionar el contexto, se utiliza un "Provider" para
 * envolver los componentes hijos y pasar el valor del contexto (viewMode 
 * y setViewMode) a través de las props del "Provider".
 * 
 */
export const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined)

export function useViewMode() {
  /**
   * Esta función va de la mano con "createContext" y se encarga de 
   * proporcionar acceso al contexto del modo de vista (ViewMode) y la función
   * para actualizarlo (setViewMode) en cualquier componente que lo necesite.
   * 
   * Se usa el "contexto" de React para datos que si son globales, en este caso,
   * el modo de vista (viewMode) y la función para actualizarlo (setViewMode).
   * 
   * Si el contexto no está disponible (es decir, si se llama a "useViewMode" fuera
   * de un componente que proporciona el contexto), se lanza un error para 
   * indicar que "useViewMode" debe usarse dentro de un componente que proporcione 
   * el contexto (en este caso, dentro de "Layout").
   * 
   */
  const context = useContext(ViewModeContext)

  if (!context) {
    throw new Error("useViewMode debe usarse dentro de Layout")
  }

  return context
}