import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  title?: string
  badge?: ReactNode
}

export type NavigationSection = {
  key: string
  title?: string
  items: NavigationItem[]
}
