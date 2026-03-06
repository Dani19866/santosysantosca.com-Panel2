import { navigationSections } from "../navigation/items"
import VerticalNavigationItem from "./VerticalNavigationItem"
import { X } from "lucide-react"

/**
 * Define las propiedades que el componente Sidebar puede recibir.
 * 
 * Esencialmente, es una llamada automática de cierre del menú móvil 
 * cada vez que el usuario hace clic en un elemento de navegación.
 * 
 * oNavigate: Es una función opcional que se ejecutará cuando el 
 * usuario navegue a una nueva página. Si se ejecuta, entonces 
 * es una función que se ejecuta sin parámetros y no devuelve nada (void).
 * 
 * El flujo real es el siguiente:
 *  1. Si el menú móvil está abierto (isMobileOpen === true), se
 *     renderiza el componente Sidebar. Y cuando alguien hace click,
 *     se ejecuta la función onNavigate, que a su vez cierra el menú móvil
 *  
 *  2. En sidebar, este callback se usa en dos lugares:
 *    - En el botón de cierre (X) del menú móvil, para cerrar el menú.
 *    - En los elementos de navegación, para cerrar el menú al navegar a 
 *      una nueva página.
 * 
 * ¿Cuando se dispara "onNavigate" exactamente?
 * - Se dispara exactamente cuando el usuario hace click en la "X"
 * - Se dispara al hacer click en cualquier opción del menú dentro del
 *   sidebar
 * 
 * ¿Cual es el sentido?
 * - Darle una buena experiencia a los usuarios que se encuentran en los
 *   dispositivos móviles, para cerrar el panel tras navegar
 */
type SidebarProps = {
    onNavigate?: () => void
}


export default function Sidebar({ onNavigate }: SidebarProps) {
    return (
        <div className="bg-white h-full relative shrink-0 w-60 overflow-hidden" data-name="bar">
            <div className="content-stretch flex flex-col h-full items-start relative rounded-[inherit] w-60">
                <div className="w-full px-4 py-5 border-b border-[#E5E7EB]">
                    <div className="flex items-start justify-between gap-2">

                        {/* Título del sistema y nombre de la empresa */}
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex flex-col gap-0.5">
                                <h1 className="font-['Inter',sans-serif] text-[11px] font-bold text-[#1e11d9] leading-tight tracking-wide">
                                    SISTEMA DE GESTIÓN DE PRODUCCIÓN
                                </h1>
                                <div className="flex flex-col gap-0.75 mt-1.5">
                                    <h2 className="font-['Inter',sans-serif] text-[15px] font-bold text-[#363636] leading-tight">
                                        METALÚRGICAS
                                    </h2>
                                    <h3 className="font-['Inter',sans-serif] text-[13px] font-semibold text-[#363636] leading-tight">
                                        Santos y Santos
                                    </h3>
                                </div>
                            </div>

                            <div className="mt-1 h-0.5 w-10 bg-linear-to-r from-[#1e11d9] to-transparent rounded-full" />
                        </div>

                        {/* Este botón hace dos cosas: 
                            (1) Muestra el botón si onNavigate existe, lo que implica que el menú móvil está abierto
                            (2) Al hacer click, ejecuta onNavigate, que a su vez cierra el menú móvil
                        */}
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
                    {/* Renderiza los botones de navegación */}
                    {navigationSections.map((section, index) => (
                        <div key={section.key} className="w-full">
                            {index === 0 ? (
                                <div className="w-full pt-2" />
                            ) : (
                                <div className="w-full px-4 py-3" />
                            )}

                            {section.title ? (
                                <div className="w-full">
                                    <p className="font-['Inter:Medium',sans-serif] text-[11px] text-[black] opacity-70 font-bold px-3 pb-1.5 uppercase tracking-wide">
                                        {section.title}
                                    </p>
                                    <div className="w-full">
                                        {section.items.map((item) => (
                                            <VerticalNavigationItem key={item.path} item={item} onClick={onNavigate} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
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