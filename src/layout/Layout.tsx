import { useEffect, useMemo, useState } from "react"
import AuthProvider from "../controllers/AuthProvider"
import Nav from "../components/Nav"
import { ViewModeContext, type ViewMode, viewModes } from "./viewMode"

const VIEW_MODE_STORAGE_KEY = "mode_view"

function isViewMode(value: string): value is ViewMode {
  return viewModes.some((item) => item.mode === value)
}

export default function Layout({
  children,
  authProvider,
  description,
  showViewMode = true,
}: {
  children: React.ReactNode
  authProvider?: boolean
  description?: string
  showViewMode?: boolean
}) {

  /**
   * Define el estado real de la memoria de React para el modo de vista 
   * (viewMode) y la función para actualizarlo (setViewMode).
   * 
   * Esta función de estado se ejecuta una sola vez para obtener el valor
   * guardado en el LocalStorage (si existe) o establecer el valor por 
   * defecto ("cards") si está corrupto el valor guardado o no existe.
   */
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Intentamos cargar el modo de vista desde localStorage
    const storedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY)

    // Comprobamos si el valor existe y es un modo de vista válido
    if (storedMode && isViewMode(storedMode)) {
      return storedMode
    }

    // Si no existe/es inválido, retornamos el modo de vista por defecto
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, "cards")
    console.log(localStorage.getItem(VIEW_MODE_STORAGE_KEY))
    return "cards"

  })

  /**
   * Cada vez que el estado del modo de vista (viewMode) cambie, se guarda 
   * el nuevo valor en el LocalStorage para que persista entre sesiones.
   */
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  /**
   * Cada vez que un componente en React se renderiza, los objetos se crean
   * de nuevo, lo que puede causar problemas de rendimiento si se pasan objetos
   * como props a componentes hijos que dependen de la igualdad referencial (por ejemplo, 
   * para evitar renders innecesarios).
   * 
   * Si no se usara "useMemo" para memorizar el objeto del contexto, cada vez 
   * que el componente se renderiza, se crearía un nuevo objeto, lo que podría
   * causar renders innecesarios en los componentes hijos que consumen este contexto.
   * 
   * 
   */
  const viewModeContext = useMemo(() => (
    { viewMode, setViewMode }
  ), [viewMode])

  return (
    <ViewModeContext.Provider value={viewModeContext}>
      <AuthProvider authProvider={authProvider}>
        <Nav description={description} showViewMode={showViewMode}>
          {children}
        </Nav>
      </AuthProvider>
    </ViewModeContext.Provider>
  )
}