import { Ruler } from "lucide-react"
import SettingsCrudModal from "./SettingsCrudModal"
import type { SettingsCacheItem } from "../../controllers/settingsController"

interface UnitModalProps {
  isOpen: boolean
  onClose: () => void
  units: SettingsCacheItem[]
  isLoading: boolean
  errorMessage: string
  onRefresh: () => Promise<void>
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
}

export default function UnitModal(props: UnitModalProps) {
  return (
    <SettingsCrudModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Gestionar unidades"
      placeholder="Nueva unidad"
      items={props.units}
      icon={Ruler}
      accentClassName="from-[#1e11d9] to-[#003D9D]"
      isLoading={props.isLoading}
      errorMessage={props.errorMessage}
      onRefresh={props.onRefresh}
      onCreate={props.onCreate}
      onUpdate={props.onUpdate}
    />
  )
}
