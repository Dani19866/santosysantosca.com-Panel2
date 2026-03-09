import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
    Check,
    Edit2,
    Plus,
    RefreshCw,
    X,
} from "lucide-react"
import type { SettingsCacheItem } from "../../logic/settingsLogic"

interface SettingsCrudModalProps {
    isOpen: boolean                                         // Verificar si se muestra o se oculta el modal
    title: string                                           // Título que se muestra dentro del modal
    placeholder: string                                     // Texto que se muestra como sombra en el campo de agregar nuevo valor
    items: SettingsCacheItem[]                              // Lista de items a mostrar dentro del modal
    icon: LucideIcon                                        // Un tipo de ícono de LucideIcon
    accentClassName: string                                 // Estilo CSS propio de cada modal
    isLoading: boolean                                      // Valor que indica el estado de un valor actualizado/agregado
    errorMessage: string                                    // Guarda el mensaje de error que se muestra en el modal

    onClose: () => void                                     // Función para cerrar el modal el cual cambia el estado a false
    onRefresh: () => Promise<void>                          // 
    onCreate: (name: string) => Promise<void>               // Ejecuta una petición HTTP POST para agregar un nuevo dato
    onUpdate: (id: string, name: string) => Promise<void>   // Ejecuta una petición HTTP POST para modificar un dato
}

export default function SettingsCrudModal({
    isOpen,
    onClose,
    title,
    placeholder,
    items,
    icon: Icon,
    accentClassName,
    isLoading,
    errorMessage,
    onRefresh,
    onCreate,
    onUpdate,
}: SettingsCrudModalProps) {
    const [newValue, setNewValue] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingValue, setEditingValue] = useState("")
    const [isSaving, setIsSaving] = useState(false)                 // Petición HTTP | true/false | Botones habilitados/deshabilitados

    // Si es false el parámetro "isOpen", entonces no se renderiza nada
    if (!isOpen) {
        return null
    }

    /**
     * Función para iniciar la edición de un valor, la cual establece el ID del 
     * valor a editar y el texto por defecto que tenía, para saber qué valor se
     * está editando.
     * 
     * @param id ID del objeto de la base de datos
     * @param name Texto del objeto de la base de datos
     */
    const startEditing = (id: string, name: string) => {
        setEditingId(id)
        setEditingValue(name)
    }

    /**
     * Esta función se encarga de manejar la creación de un nuevo valor, función
     * la cual dispara la props "onCreate" que fue dada por el componente padre, 
     * y la cual hace una petición HTTP.
     */
    const handleCreate = async () => {
        // Obtenemos el nuevo valor, eliminando espacios al inicio y al final con trim()
        const normalizedValue = newValue.trim()

        // Si el valor normalizado está vacío o ya se está guardando un valor, no hacemos nada
        if (!normalizedValue || isSaving) {
            return
        }

        // Actualizamos el estado de carga
        setIsSaving(true)

        try {
            // Esperamos la función onCreate
            await onCreate(normalizedValue)

            // Si la creación fue exitosa, limpiamos el campo de texto
            setNewValue("")
        } finally {
            // Siempre restablecemos el estado de carga, sin importar si la creación fue exitosa o no
            setIsSaving(false)
        }

    }

    /**
     * Esta función permite la modificación de un valor existente en la base de
     * datos.
     * 
     * Primeramente se limpia el valor obtenido para eliminar espacios al inicio
     * y al final.
     * 
     * Luego se comprueba que haya un ID de edición, que el valor no esté vacío 
     * y que no haya un proceso de guardado en curso.
     * 
     * Luego se espera a la solicitud, y si sale todo bien, entonces se limpia el
     * estado de edición.
     */
    const handleSaveEdit = async () => {
        // Limpiamos el valor 
        const normalizedValue = editingValue.trim()

        // Si no hay un ID de edición, el valor normalizado está vacío o ya se 
        // está guardando un valor, no realizamos ninguna acción
        if (!editingId || !normalizedValue || isSaving) {
            return
        }

        // Actualizamos el estado de carga para deshabilitar los botones
        setIsSaving(true)

        try {
            // Enviamos la solicitud
            await onUpdate(editingId, normalizedValue)

            // Limpiamos el estado de edición después de guardar los cambios
            setEditingId(null)
            setEditingValue("")

        } finally {
            setIsSaving(false)
        }
    }

    /**
     * Maneja la actualización de los datos y dispara la función onRefresh que fue
     * dada por los props del componente padre
     * 
     * Cuando isSaving o isLoading es true, se evita hacer la actualización para 
     * no generar conflictos entre peticiones HTTP. Estas variables eventualmente
     * estarán en true debido a que onRefresh, onCreate y onUpdate hacen peticiones 
     * HTTP y actualizan esos estados.
     * 
     * El objetivo es esperar "await onRefresh()" para que termine la petición HTTP 
     * y luego actualizar los datos en el modal.
     */
    const handleRefresh = async () => {

        if (isSaving || isLoading) {
            return
        }

        await onRefresh()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            {/* Contenedor principal */}
            <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* Contenedor del head */}
                <div className={`flex items-center justify-between bg-linear-to-r ${accentClassName} px-6 py-4`}>
                    <div className="flex items-center gap-3">

                        {/* Ícono */}
                        <Icon className="size-6 text-white" strokeWidth={2.5} />

                        {/* Título dentro del modal */}
                        <h2 className="font-bold text-[18px] text-white">{title}</h2>
                    </div>

                    {/* Botón para cerrar el modal. Cambia el valor del estado en settings.tsx */}
                    <button aria-label="Cerrar modal" onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
                        <X className="size-5 text-white" />
                    </button>
                </div>

                {/* Contenedor del contenido principal */}
                <div className="max-h-[calc(85vh-130px)] overflow-y-auto p-6">


                    <div className="mb-4 flex gap-2">

                        {/* Campo de texto que almacena el nuevo valor a agregar en la base de datos */}
                        <input
                            type="text"
                            value={newValue}
                            onChange={(event) => setNewValue(event.target.value)}
                            onKeyDown={(event) => { event.key === "Enter" ? void handleCreate() : null }}
                            placeholder={placeholder}
                            className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e11d9]"
                        />

                        {/* Botón que se presiona para agregar el nuevo valor, es decir, enviar */}
                        <button
                            onClick={() => void handleCreate()}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-[#1e11d9] to-[#003D9D] px-5 py-2.5 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <Plus className="size-4" strokeWidth={2.5} />
                            Agregar
                        </button>
                    </div>

                    <div className="mb-4 flex justify-end">

                        {/* Botón para actualizar los valores */}
                        <button
                            onClick={() => void handleRefresh()}
                            disabled={isSaving || isLoading}
                            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] text-[#363636] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                            Actualizar
                        </button>

                    </div>

                    {/* Si hay algún mensaje de error, se muestra */}
                    {errorMessage && (
                        <div className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
                            {errorMessage}
                        </div>
                    )}

                    {/* Mostrar los elementos traídos de la base de datos */}
                    <div className="space-y-2">

                        {/* Si hay elementos para mostrar */}
                        {items.map((item) => (

                            <div key={item.id} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                                {editingId === item.id ?
                                    // Si el ID del elemento coincide con el ID que se está editando, 
                                    // se muestra un campo de texto para modificar el nombre
                                    (
                                        <input
                                            value={editingValue}
                                            onChange={(event) => setEditingValue(event.target.value)}
                                            onKeyDown={(event) => { event.key === "Enter" ? void handleSaveEdit() : null }}
                                            onBlur={() => { void handleSaveEdit()}}
                                            className="flex-1 rounded border border-[#1e11d9] px-3 py-1.5 focus:outline-none"
                                            autoFocus
                                        />
                                    )
                                    :

                                    // Si no se está editando ese elemento, se muestra su nombre normalmente
                                    (
                                        <div className="flex items-center gap-3">
                                            {/* <span className="text-[12px] font-bold text-[#9CA3AF]">{item.id}</span> */}
                                            <span className="text-[14px] font-semibold text-[#363636]">{item.text}</span>
                                        </div>
                                    )}

                                <div className="flex items-center gap-2">
                                    {editingId === item.id ?
                                        // Si el ID del elemento coincide con el ID que se está editando, 
                                        // se muestra un botón para guardar los cambios en el nombre
                                        (
                                            <button
                                                onClick={() => void handleSaveEdit()}
                                                disabled={isSaving}
                                                className="rounded-lg p-2 transition-colors hover:bg-[#10c507]/10"
                                            >
                                                <Check className="size-4 text-[#10c507]" strokeWidth={2.5} />
                                            </button>
                                        )
                                        :
                                        // Si no se está editando ese elemento, se muestra un botón para iniciar la edición
                                        (
                                            <button
                                                onClick={() => startEditing(item.id, item.text)}
                                                disabled={isSaving}
                                                className="rounded-lg p-2 transition-colors hover:bg-[#1e11d9]/10"
                                            >
                                                <Edit2 className="size-4 text-[#1e11d9]" strokeWidth={2.5} />
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}

                        {/* Si no hay elementos para mostrar */}
                        {!items.length && !isLoading && (
                            <div className="rounded-lg border border-dashed border-[#D1D5DB] p-5 text-center text-[13px] text-[#9CA3AF]">
                                No hay elementos para mostrar.
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )
}
