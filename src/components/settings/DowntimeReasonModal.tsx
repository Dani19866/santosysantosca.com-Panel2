import { AlertTriangle } from "lucide-react"
import SettingsCrudModal from "./SettingsCrudModal"
import type { SettingsCacheItem } from "../../controllers/settingsController"

interface DowntimeReasonModalProps {
  isOpen: boolean
  onClose: () => void
  downtimeReasons: SettingsCacheItem[]
  isLoading: boolean
  errorMessage: string
  onRefresh: () => Promise<void>
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
}

export default function DowntimeReasonModal(props: DowntimeReasonModalProps) {
  return (
    <SettingsCrudModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Gestionar codigos de fallas"
      placeholder="Nuevo codigo de falla"
      items={props.downtimeReasons}
      icon={AlertTriangle}
      accentClassName="from-[#1e11d9] to-[#003D9D]"
      isLoading={props.isLoading}
      errorMessage={props.errorMessage}
      onRefresh={props.onRefresh}
      onCreate={props.onCreate}
      onUpdate={props.onUpdate}
    />
  )
}
