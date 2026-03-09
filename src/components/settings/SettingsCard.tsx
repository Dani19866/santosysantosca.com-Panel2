interface SettingCardProps {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    onClick: () => void
}

export default function SettingsCard({ title, description, icon: Icon, onClick }: SettingCardProps) {
    return (
        <button
            onClick={onClick}
            className="group hover:cursor-pointer rounded-xl border border-[#E5E7EB] bg-white p-5 text-left transition-all hover:shadow-md"
        >
            <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-[#1e11d9]/10 p-2 transition-colors group-hover:bg-[#1e11d9]">
                    <Icon className="size-5 text-[#1e11d9] transition-colors group-hover:text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-[#363636]">{title}</h3>
            </div>
            <p className="text-[12px] font-medium text-[#9CA3AF]">{description}</p>
        </button>
    )
}