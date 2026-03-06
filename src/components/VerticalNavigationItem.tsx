import { useState } from "react"
import { NavLink } from "react-router-dom"
import type { NavigationItem } from "../navigation/types"

export default function VerticalNavigationItem({ item, onClick }: { item: NavigationItem, onClick?: () => void }) {
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
            className={({ isActive }) => `${isActive ? "bg-linear-to-r from-[#1e11d9]/5 to-transparent" : "bg-white hover:bg-[#F9FAFB]"} relative shrink-0 w-full cursor-pointer group transition-all duration-200 block`}
        >
            {({ isActive }) => (
                <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-[#1e11d9]" />}

                    <div className="flex flex-row items-center size-full">
                        <div className="box-border content-stretch flex items-center gap-3 pl-2 pr-3 py-2 relative w-full">
                            <div className={`relative shrink-0 size-9 transition-transform duration-200 ${isHovered && !isActive ? "scale-110" : ""}`}>
                                <Icon className={`size-full transition-colors ${isActive ? "text-[#1e11d9]" : "text-[#9CA3AF] group-hover:text-[#363636]"}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            <div className="flex items-center justify-between flex-1">
                                <p className={`font-['Inter:Medium',sans-serif] font-medium leading-5 not-italic text-[14px] text-nowrap whitespace-pre transition-colors ${isActive ? "text-[#1e11d9]" : "text-gray-400 group-hover:text-[#363636]"}`}>
                                    {item.label}
                                </p>
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