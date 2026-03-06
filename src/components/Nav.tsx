import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { useLocation } from "react-router-dom"
import { navigationSections } from "../navigation/items"
import { useViewMode, viewModes } from "../layout/viewMode"
import Sidebar from "./Sidebar"

type NavProps = {
    children: React.ReactNode
    description?: string
    showViewMode?: boolean
}

/**
 * Función: Obtener el título de la página basado en la ruta actual
 * Recorre las secciones de navegación y sus elementos para encontrar una
 *  coincidencia con la ruta actual (pathname).
 * 
 * Si encuentra una coincidencia, devuelve la etiqueta (label) del
 * elemento correspondiente.
 * 
 * Si no encuentra ninguna coincidencia, devuelve "Página desconocida"
 * como título por defecto.
 * 
 * @param pathname - La ruta actual de la aplicación (por ejemplo, 
 * "/dashboard", "/settings", etc.)
 * @returns El título de la página correspondiente a la ruta actual o 
 * "Página desconocida" si no se encuentra una coincidencia.
 */
function getPageTitle(pathname: string) {
    for (const section of navigationSections) {
        const match = section.items.find((item) => item.path === pathname)
        if (match) return match.label
    }

    return "Página desconocida"
}

/**
 * Función: Obtener el ícono de la página basado en la ruta actual
 * Recorre las secciones de navegación y sus elementos para encontrar una 
 * coincidencia con la ruta actual (pathname).
 * 
 * @param pathname - La ruta actual de la aplicación (por ejemplo, 
 * "/dashboard", "/settings", etc.)
 * @returns El ícono de la página correspondiente a la ruta actual o 
 * null si no se encuentra una coincidencia.
 */
function getPageIcon(pathname: string) {
    for (const section of navigationSections) {
        const match = section.items.find((item) => item.path === pathname)
        if (match) return match.icon
    }
    return null
}

export default function Nav({ children, description, showViewMode = true }: NavProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { viewMode, setViewMode } = useViewMode()
    const location = useLocation()                          // Hook para obtener la ubicación actual (ruta) 
    const pageTitle = getPageTitle(location.pathname)
    const Icon = getPageIcon(location.pathname)

    useEffect(() => {
        if (!isMobileOpen) {
            return
        }

        const scrollY = window.scrollY
        const { overflow: previousBodyOverflow } = document.body.style
        const { position: previousBodyPosition } = document.body.style
        const { top: previousBodyTop } = document.body.style
        const { width: previousBodyWidth } = document.body.style
        const { overflow: previousHtmlOverflow } = document.documentElement.style

        document.body.style.overflow = "hidden"
        document.body.style.position = "fixed"
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = "100%"
        document.documentElement.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousBodyOverflow
            document.body.style.position = previousBodyPosition
            document.body.style.top = previousBodyTop
            document.body.style.width = previousBodyWidth
            document.documentElement.style.overflow = previousHtmlOverflow
            window.scrollTo(0, scrollY)
        }
    }, [isMobileOpen])

    return (
        <div className="bg-[#F9FAFB] flex flex-row h-screen overflow-clip relative w-full">

            {/* Menu de navegación lateral para pantallas grandes */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Menú de navegación lateral para pantallas pequeñas */}
            {isMobileOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 touch-none"
                        onClick={() => setIsMobileOpen(false)}
                        onTouchMove={(event) => event.preventDefault()}
                    />

                    <div className="lg:hidden fixed left-0 top-0 h-dvh w-60 z-60 animate-in slide-in-from-left duration-300">
                        <Sidebar onNavigate={() => setIsMobileOpen(false)} />
                    </div>
                </>
            )}

            {/* Contenedor principal que contiene el contenido de la página */}
            <main className={`overflow-hidden w-full flex flex-col min-h-0 ${isMobileOpen ? "pointer-events-none lg:pointer-events-auto" : ""}`}>
                <header className="h-24 lg:h-30 shrink-0 border-b border-[#E5E7EB] bg-white flex items-center px-4 gap-3">

                    {/* Botón para abrir/cerrar el menú móvil */}
                    <button onClick={() => setIsMobileOpen((current) => !current)} className="lg:hidden fixed bottom-6 left-6 z-40 size-11 rounded-lg bg-[#1e11d9] shadow-lg flex items-center justify-center group hover:bg-[#003D9D] transition-all" aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}>
                        <Menu className="size-5 text-white" strokeWidth={2.5} />
                    </button>

                    {/* Contenedor principal que contiene el ícono, título y descripción de la página */}
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            {/* Ícono de la página */}
                            <div className="flex items-center px-4">
                                {Icon && (
                                    <Icon className="w-full size-8 text-[#1e11d9]" strokeWidth={2.5} />
                                )}
                            </div>

                            {/* Título y descripción de la página */}
                            <div className="flex flex-col align-middle items-center justify-center">
                                <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-[#363636] tracking-normal">
                                    {pageTitle}
                                </h1>

                                <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#1e11d9] tracking-normal uppercase">
                                    {description || ""}
                                </span>
                            </div>

                            {/* Opciones de vista (Si es que aplica) */}
                            {showViewMode && (
                                <div className="ml-4 lg:ml-8 flex justify-center items-center">
                                    <div className="flex items-center gap-2 bg-[#F9FAFB] p-1.5 rounded-lg">
                                        {viewModes.map(({ mode, icon: ViewIcon, title }) => (
                                            <button key={mode} onClick={() => setViewMode(mode)} className={`p-2.5 rounded-md transition-all ${viewMode === mode ? "bg-white shadow-sm text-[#1e11d9]" : "text-[#9CA3AF] hover:text-[#363636]"}`} title={title}>
                                                <ViewIcon className="size-4" strokeWidth={2.5} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <section className={`flex-1 min-h-0 ${isMobileOpen ? "overflow-hidden" : "overflow-auto"}`}>
                    <div>
                        {children}
                    </div>
                </section>
            </main>
        </div>
    )
}