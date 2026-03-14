import { Tag } from "lucide-react"
import SettingsCrudModal from "./SettingsCrudModal"
import type { SettingsCacheItem } from "../../controllers/settingsController"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categories: SettingsCacheItem[]
  isLoading: boolean
  errorMessage: string
  onRefresh: () => Promise<void>
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
}

export default function CategoryModal(props: CategoryModalProps) {
  return (
    <SettingsCrudModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Gestionar categorias"
      placeholder="Nueva categoria"
      items={props.categories}
      icon={Tag}
      accentClassName="from-[#1e11d9] to-[#003D9D]"
      isLoading={props.isLoading}
      errorMessage={props.errorMessage}
      onRefresh={props.onRefresh}
      onCreate={props.onCreate}
      onUpdate={props.onUpdate}
    />
  )
}
