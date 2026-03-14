import { ListTree } from "lucide-react"
import SettingsCrudModal from "./SettingsCrudModal"
import type { SettingsCacheItem } from "../../controllers/settingsController"

interface MovementReasonModalProps {
  isOpen: boolean
  movementReasons: SettingsCacheItem[]
  isLoading: boolean
  errorMessage: string
  onClose: () => void
  onRefresh: () => Promise<void>
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
}

export default function MovementReasonModal(props: MovementReasonModalProps) {
  return (
    <SettingsCrudModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Gestionar razones de movimientos"
      placeholder="Nueva razon de movimiento"
      items={props.movementReasons}
      icon={ListTree}
      accentClassName="from-[#1e11d9] to-[#003D9D]"
      isLoading={props.isLoading}
      errorMessage={props.errorMessage}
      onRefresh={props.onRefresh}
      onCreate={props.onCreate}
      onUpdate={props.onUpdate}
    />
  )
}
