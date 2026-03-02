import {
    FileText,
    Factory,
    Gauge,
    History,
    Home,
    Package,
    Radio,
    Settings,
    Sliders,
} from "lucide-react"
import type { NavigationSection } from "./types"
import LiveProductionInsight from "../components/details/LiveProductionInsight"

export const navigationSections: NavigationSection[] = [
    {
        key: "home",
        items: [
            { label: "Inicio", path: "/", icon: Home, title: "Ir al inicio", },
        ],
    },
    {
        key: "production",
        title: "Producción",
        items: [
            { label: "Producción en vivo", path: "/live-production", icon: Radio, title: "Ver producción en vivo", badge: (<LiveProductionInsight />) },
            { label: "Historial de producción", path: "/history-production", icon: History, title: "Ver historial de producción" },
        ],
    },
    {
        key: "products",
        title: "Inventario",
        items: [
            { label: "Productos", path: "/products", icon: Package, title: "Ver productos" },
            { label: "Recetas", path: "/bom", icon: FileText, title: "Ver BOM" },
            { label: "Parámetros", path: "/parameters", icon: Sliders, title: "Ver parámetros" },
        ],
    },
    {
        key: "plant",
        title: "Planta",
        items: [
            { label: "Máquinas", path: "/machines", icon: Factory, title: "Ver máquinas" },
            { label: "Sensores", path: "/sensors", icon: Gauge, title: "Ver sensores" },
        ],
    },
    {
        key: "settings",
        title: "Configuración",
        items: [
            { label: "Configuración", path: "/settings", icon: Settings, title: "Ver configuración" },
        ],
    },
]
