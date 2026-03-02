import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import AuthProvider from "../controllers/AuthProvider"
import { navigationSections } from "../navigation/items"
import type { NavigationItem } from "../navigation/types"


// #########################################################
// Componentes de navegación
// #########################################################
type SidebarProps = {
  onNavigate?: () => void
}

function getPageTitle(pathname: string) {
  for (const section of navigationSections) {
    const match = section.items.find((item) => item.path === pathname)
    if (match) return match.label
  }

  return "Página desconocida"
}

function getPageIcon(pathname: string) {
  for (const section of navigationSections) {
    const match = section.items.find((item) => item.path === pathname)
    if (match) return match.icon
  }
  return null
}


/**
 * Tarea: Crear el componente que represeta la tarjeta de cada item de navegación, 
 * con su ícono, título, badge (si tiene) y estilos para estados activo e inactivo.
 * 
 * @param item El item de navegación a representar
 * @param onClick Función a ejecutar al hacer click en el item (opcional, para 
 * cerrar menú en móvil)
 * 
 * @returns Un componente de React que representa el item de navegación
 */
function VerticalNavigationItem({ item, onClick }: { item: NavigationItem, onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      title={item.title}
      onClick={onClick}
      end={item.path === "/"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={({ isActive }) =>`${isActive ? "bg-gradient-to-r from-[#1e11d9]/5 to-transparent": "bg-white hover:bg-[#F9FAFB]"} relative shrink-0 w-full cursor-pointer group transition-all duration-200 block`}
    >
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-[#1e11d9]" />}

          {/* Contenedor principal */}
          <div className="flex flex-row items-center size-full">

            {/* Contenedor del contenido */}
            <div className="box-border content-stretch flex items-center gap-3 pl-2 pr-3 py-2 relative w-full">

              {/* Contenedor del ícono */}
              <div className={`relative shrink-0 size-9 transition-transform duration-200 ${isHovered && !isActive ? "scale-110" : ""}`}>
                <Icon className={`size-full transition-colors ${isActive ? "text-[#1e11d9]" : "text-[#9CA3AF] group-hover:text-[#363636]"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <div className="flex items-center justify-between flex-1">
                {/* Etiqueta del item de navegación */}
                <p className={`font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic text-[14px] text-nowrap whitespace-pre transition-colors ${isActive ? "text-[#1e11d9]" : "text-gray-400 group-hover:text-[#363636]"}`}>
                  {item.label}
                </p>

                {/* Decorador derecho. Solo para items con badge (Producción en vivo) */}
                {item.badge}
              </div>
            </div>

          </div>

          {isActive && <div className="absolute inset-0 shadow-inner pointer-events-none opacity-20" />}
        </>
      )}
    </NavLink>
  )
}

/**
 * Tarea: Crear el componente de la barra lateral de navegación, que contenga el 
 * logo, título del sistema, secciones y items de navegación.
 * 
 * @param onNavigate Función a ejecutar al hacer click en un item de navegación 
 * (opcional, para cerrar menú en móvil)
 * 
 * @returns Un componente de React que representa la barra lateral de navegación
 */
function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="bg-white h-full relative shrink-0 w-[240px] overflow-hidden" data-name="bar">
      <div className="content-stretch flex flex-col h-full items-start relative rounded-[inherit] w-[240px]">
        <div className="w-full px-[16px] py-[20px] border-b border-[#E5E7EB]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-[6px] flex-1">
              <div className="flex flex-col gap-[2px]">
                <h1 className="font-['Inter',sans-serif] text-[11px] font-bold text-[#1e11d9] leading-tight tracking-wide">
                  SISTEMA DE GESTIÓN DE PRODUCCIÓN
                </h1>
                <div className="flex flex-col gap-[3px] mt-[6px]">
                  <h2 className="font-['Inter',sans-serif] text-[15px] font-bold text-[#363636] leading-tight">
                    METALÚRGICAS
                  </h2>
                  <h3 className="font-['Inter',sans-serif] text-[13px] font-semibold text-[#363636] leading-tight">
                    Santos y Santos
                  </h3>
                </div>
              </div>

              <div className="mt-[4px] h-[2px] w-[40px] bg-gradient-to-r from-[#1e11d9] to-transparent rounded-full" />
            </div>

            {onNavigate && (
              <button
                onClick={onNavigate}
                className="lg:hidden size-8 rounded-lg hover:bg-[#F9FAFB] transition-colors flex items-center justify-center group shrink-0"
              >
                <X className="size-5 text-[#363636] group-hover:text-[#1e11d9]" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <nav className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pb-4">
          {navigationSections.map((section, index) => (
            <div key={section.key} className="w-full">
              {index === 0 ? (
                <div className="w-full pt-[8px]" />
              ) : (
                <div className="w-full px-[16px] py-[12px]">
                </div>
              )}


              {section.title ?
                // Items de la sección con título y abarcando varios items
                (
                  <div className="w-full">
                    <p className="font-['Inter:Medium',sans-serif] text-[11px] text-[black] opacity-70 font-bold px-[12px] pb-[6px] uppercase tracking-wide">
                      {section.title}
                    </p>
                    <div className="w-full">
                      {section.items.map((item) => (
                        <VerticalNavigationItem key={item.path} item={item} onClick={onNavigate} />
                      ))}
                    </div>
                  </div>
                )
                :
                // Items de la sección sin título, cada uno con su propio espacio
                (
                  <div className="w-full">
                    {section.items.map((item) => (
                      <VerticalNavigationItem key={item.path} item={item} onClick={onNavigate} />
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </div>

      <div
        aria-hidden="true"
        className="absolute border-[0px_1px_0px_0px] border-[rgba(0,0,0,0.15)] border-solid inset-0 pointer-events-none"
      />
    </div>
  )
}

// #########################################################
// Layout principal
// #########################################################
export default function Layout({ children, authProvider, description }: { children: React.ReactNode, authProvider?: boolean, description?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const Icon = getPageIcon(location.pathname)

  /**
   * Tarea: Implementar el efecto para bloquear el scroll del body cuando el menú 
   * móvil está abierto, y restaurarlo al cerrarlo.
   */
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
    <AuthProvider authProvider={authProvider}>

      {/* Menú de navegación */}
      <div className="bg-[#F9FAFB] flex flex-row h-screen overflow-clip relative w-full">

        {/* Menu de navegación para escritorio */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Menu de navegación para dispositivos móviles */}
        {isMobileOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 touch-none"
              onClick={() => setIsMobileOpen(false)}
              onTouchMove={(event) => event.preventDefault()}
            />

            <div className="lg:hidden fixed left-0 top-0 h-[100dvh] w-[240px] z-[60] animate-in slide-in-from-left duration-300">
              <Sidebar onNavigate={() => setIsMobileOpen(false)} />
            </div>
          </>
        )}

        <main className={`overflow-hidden w-full ${isMobileOpen ? "pointer-events-none lg:pointer-events-auto" : ""}`}>
          <header className="h-24 lg:h-30 border-b border-[#E5E7EB] bg-white flex items-center px-4 gap-3">

            {/* Botón de menú para dispositivos móviles */}
            <button onClick={() => setIsMobileOpen((current) => !current)} className="lg:hidden fixed bottom-6 left-6 z-40 size-11 rounded-lg bg-[#1e11d9] shadow-lg flex items-center justify-center group hover:bg-[#003D9D] transition-all" aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}>
              <Menu className="size-5 text-white" strokeWidth={2.5} />
            </button>

            {/* Título de la página */}
            <div className="flex flex-col">

              {/* Título */}
              <div className="flex flex-row">

                {/* Ícono */}
                <div className="flex items-center px-4">
                  {Icon && (
                    <Icon className="w-full size-8 text-[#1e11d9]" strokeWidth={2.5} />
                  )}
                </div>

                {/* Título y descripción */}
                <div className="flex flex-col ">
                  <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-[#363636] tracking-normal">
                    {pageTitle}
                  </h1>

                  <span className="font-['Inter:Bold',sans-serif] font-bold text-[11px] text-[#1e11d9] tracking-normal uppercase">
                    {description || ""}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenido de la página */}
          <section className={`h-[calc(100vh-56px)] ${isMobileOpen ? "overflow-hidden" : "overflow-auto"}`}>{children}</section>
        </main>
      </div>
    </AuthProvider>
  )
}