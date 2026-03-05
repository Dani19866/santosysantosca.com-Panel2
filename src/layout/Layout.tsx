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


  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  const viewModeContext = useMemo(() => ({ viewMode, setViewMode }), [viewMode])

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