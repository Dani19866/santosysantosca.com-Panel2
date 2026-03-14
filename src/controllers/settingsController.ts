import type { Category } from "../interfaces/categoryInterface.ts"
import type { DowntimeReason } from "../interfaces/downtimeReasonInterface.ts"
import type { MovementReason } from "../interfaces/movementReasonInterface.ts"
import type { Unit } from "../interfaces/unitInterface.ts"
import type { SettingsSection } from "../scripts/URL.ts"
import { tags } from "../scripts/URL.ts"
import { send_http_get } from "../scripts/http.ts"

// Estructura de las categorias, razones de parada, razones de movimiento y unidades
export interface SettingsCacheItem {
    id: string
    text: string
}

/**
 * Mapa de tipos por sección de configuración.
 *
 * Objetivo:
 * - Decirle a TypeScript qué estructura llega desde API según la sección.
 * - Permitir que `adapterItem` sea genérico y mantenga autocompletado/tipos.
 */
type SettingsSourceItemBySection = {
    categories: Category
    units: Unit
    machineFails: DowntimeReason
    movementReasons: MovementReason
}

class SettingsLogic {
    /**
     * Extractores de texto por sección.
     *
     * Problema que resuelve:
     * - No todas las entidades traen el mismo nombre de campo para el texto.
     *   categories -> category
     *   units -> unit
     *   machineFails/movementReasons -> reason
     *
     * Beneficio:
     * - Evita `if/else` repetidos y centraliza la regla de mapeo en un solo lugar.
     */
    readonly SECTION_TEXT_EXTRACTORS: {
        [K in SettingsSection]: (item: SettingsSourceItemBySection[K]) => string
    } = {
            categories: (item) => item.category,
            units: (item) => item.unit,
            machineFails: (item) => item.reason,
            movementReasons: (item) => item.reason
        }

    /**
     * Mapa inverso: seccion -> nombre de campo esperado por la API en POST/PUT.
     */
    private readonly SECTION_API_TEXT_KEYS: Record<SettingsSection, "category" | "unit" | "reason"> = {
        categories: "category",
        units: "unit",
        machineFails: "reason",
        movementReasons: "reason"
    }

    // Claves para guardar datos en cache
    SETTINGS_CACHE_KEYS: Record<SettingsSection, string> = {
        categories: "category_cache",
        units: "unit_cache",
        machineFails: "error_code_cache",
        movementReasons: "movement_reason_cache"
    }

    // Manejo de validez de datos en cache
    SETTINGS_CACHE_VALID_TIME_MS: number = 1000 * 60 * 60 * 24
    SETTINGS_CACHE_LAST_DATE_KEY = "last_date_of_extract_data"

    /**
     * Adapta un item de API al formato unificado de cache `{ id, text }`.
     *
     * Flujo:
     * 1. Valida que el valor sea objeto.
     * 2. Obtiene `id`.
     * 3. Usa el extractor según `section` para obtener el texto correcto.
     * 4. Si falta `id` o `text`, retorna `null`.
     */
    adapterItem<TSection extends SettingsSection>(value: unknown, section: TSection): SettingsCacheItem | null {
        if (!value || typeof value !== "object") {
            return null
        }

        const rawItem = value as Partial<SettingsSourceItemBySection[TSection]>
        const id = String(rawItem.id ?? "").trim()
        const getText = this.SECTION_TEXT_EXTRACTORS[section]
        const text = String(getText(rawItem as SettingsSourceItemBySection[TSection]) ?? "").trim()

        if (!id || !text) {
            return null
        }

        return { id, text }
    }

    /**
     * Valida y estandariza items que YA están en formato de cache.
     *
     * Uso esperado:
     * - Datos leídos desde LocalStorage.
     *
     * Nota:
     * - Aquí no hay `section` porque en cache siempre esperamos `{ id, text }`.
     */
    structureItem(value: unknown): SettingsCacheItem | null {
        if (!value || typeof value !== "object") {
            return null
        }

        const rawItem = value as Partial<SettingsCacheItem>
        const id = String(rawItem.id ?? "").trim()
        const text = String(rawItem.text ?? "").trim()

        if (!id || !text) {
            return null
        }

        return { id, text }
    }

    /**
     * Construye el body para crear/actualizar settings segun la seccion.
     * Ejemplos:
     * - categories -> { category: "..." }
     * - units -> { unit: "..." }
     * - machineFails/movementReasons -> { reason: "..." }
     */
    buildCreatePayload(section: SettingsSection, name: string): Record<string, string> {
        const key = this.SECTION_API_TEXT_KEYS[section]
        return { [key]: name.trim() }
    }

    /**
     * Función que obtiene la Key referente a la base de datos según la sección dada. 
     * Esto es útil para construir el body de las solicitudes POST/PATCH a la API, ya 
     * que cada sección espera un campo diferente.
     * 
     * @param section Se utiliza para obtener el "key" que sirve en la base de datos
     * @returns Retorna el "key" referente a la base de datos
     */
    getKeyBySection(section: SettingsSection): string {
        return this.SECTION_API_TEXT_KEYS[section]
    }

    /**
     * Permite saber si una clave es válida en el diccionario
     * SETTINGS_CACHE_KEYS
     * 
     * @param key Algún valor de clave de SETTINGS_CACHE_KEYS
     * @returns Retorna si es válido la clave (true) o si la clave no existe (false)
     */
    isValidKeyCache(key: string): boolean {
        return key in this.SETTINGS_CACHE_KEYS
    }

    /**
     * Permite guardar valores en el cache local del navegador, utilizando como 
     * clave alguna de las claves definidas en SETTINGS_CACHE_KEYS
     * 
     * @param key Clave que hace referencia a una clave en SETTINGS_CACHE_KEYS
     * @param value Arreglo de items con estructura válida
     */
    setValuesCache(key: SettingsSection, value: SettingsCacheItem[]): void {
        // Verificamos si la clave es válida
        if (!this.isValidKeyCache(key)) {
            console.log(`Clave no válida: ${key}`)
            throw new Error(`La clave ${key} no es válida para guardar en cache.`)
        }

        // Actualizamos la fecha de última actualización en cache
        this.updateDateCache()

        // Guardamos el valor en cache, convirtiéndolo a string con JSON.stringify
        localStorage.setItem(this.SETTINGS_CACHE_KEYS[key], JSON.stringify(value))
    }

    /**
     * Accede y devuelve el arreglo de datos según clave dada
     * 
     * @param key Clave que hace referencia a una clave en SETTINGS_CACHE_KEYS
     */
    getValuesCache(key: SettingsSection): SettingsCacheItem[] {
        // Extramos los valores del LocalStorage
        const values = localStorage.getItem(this.SETTINGS_CACHE_KEYS[key])
        const parsedValues = JSON.parse(values ?? "[]")

        // Si el arreglo está vacío
        if (!parsedValues) {
            return []
        }

        // Si ha sido alterado el valor en cache
        if (!Array.isArray(parsedValues)) {
            return []
        }

        // Estandarizamos cada item de cache y descartamos los inválidos.
        // Se usa callback inline para no perder el contexto de `this`.
        const validValues: SettingsCacheItem[] = parsedValues
            .map((item: unknown) => this.structureItem(item))
            .filter((item): item is SettingsCacheItem => item !== null)

        // Retornamos
        return validValues
    }

    /**
     * Crea/actualiza la última fecha en la que se guardó el último
     * registro
     */
    updateDateCache(): void {
        // Obtenemos la fecha actual
        const date = new Date()

        // Guardamos la fecha actual
        localStorage.setItem(this.SETTINGS_CACHE_LAST_DATE_KEY, date.toISOString())
    }

    /**
     * Esta función obtiene los datos del LocalStorage de la última vez que
     * se guardó en caché algún dato, y los devuelve en formato Date. 
     * 
     * @returns Retorna un valor de Date si encuentra un valor en LocalStorage y 
     *          es válido | No retorna nada
     */
    getDateCache(): Date | null {
        // Obtenemos el dato del LocalStorage a través de la key
        const rawDate = localStorage.getItem(this.SETTINGS_CACHE_LAST_DATE_KEY)

        // Si no existe o no tiene valor, devolvemos null.
        if (!rawDate) {
            return null
        }

        // Parseamos el contenido a un objeto Date
        const parsedDate = new Date(rawDate)

        // Determinamos si la fecha guardada es un NaN (Not-a-Number), es decir, no
        // numérico. De no ser así y, por lo tanto, un número válido, entonces devuelve
        // el objeto Date
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate

    }

    /**
    * Función que verifica si hay datos en el LocalStorage. El objetivo es 
    * comprobar si es necesario la actualización de datos.
    */
    hasCacheData(): boolean {
        // Obtiene un arreglo de datos de todas las llaves creadas para guardar
        // los valores en el LocalStorage
        const requiredKeys: string[] = Object.values(this.SETTINGS_CACHE_KEYS)

        // Comprobar si todos los elementos del array son distintos a nulos, 
        // es decir, si hay datos. Solo retorna un solo true/false.
        return requiredKeys.every((key) => localStorage.getItem(key) !== null)
    }

    /**
     * Verifica si es necesario actualizar los datos en cache:
     * - Si se fuerza la actualización (forceRefresh = true)
     * - Si no hay datos en cache
     * - Si no hay ultima actualización
     * - Si el tiempo transcurrido pasó el límite de tiempo
     */
    shouldRefreshCache(forceRefresh = false): boolean {
        // Obtenemos la última fecha de actualización en cache
        const lastDate = this.getDateCache()

        // Si se fuerza la actualización (forceRefresh = true)
        if (forceRefresh) {
            return true
        }

        // Si no hay datos en cache
        if (!this.hasCacheData()) {
            return true
        }

        // Si no hay ultima actualización
        if (!lastDate) {
            return true
        }

        // Tiempo del momento en que se ejecuta la función
        const now = Date.now()

        // Se ejecuta la resta (actual - ultima fecha)
        const elapsedTime = now - lastDate.getTime()

        // Si el tiempo transcurrido pasó el límite de tiempo, entonces se debe actualizar
        return elapsedTime >= this.SETTINGS_CACHE_VALID_TIME_MS
    }

    /**
    * Función que recorre todos los pares clave/valor almacenados en LocalStorage
    * y por cada clave recorrida, se elimita ese par en el LocalStorage
    */
    clearAll(): void {
        Object.values(this.SETTINGS_CACHE_KEYS).forEach((key) => {
            localStorage.removeItem(key)
        })
    }

    /**
     * Esta función elimina los datos del LocalStorage según la sección dada. Se utiliza
     * para borrar el cache de una sección específica cuando se actualiza un item, 
     * evitando así tener que borrar todo el cache y forzar la actualización de 
     * todas las secciones.
     * 
     * @param section Se obtiene el valor de referencia para saber qué sección
     * se va a tomar en cuenta para borrar los datos
     */
    clearBySection(section: SettingsSection): void {
        const key = this.SETTINGS_CACHE_KEYS[section]
        localStorage.removeItem(key)
    }

    /**
     * 
     * @param section Sección que se tomará en cuenta para actualizar sus valores
     * en cache y obtener sus datos actualizados desde la API.
     * 
     * @param forceRefresh Se pasa como parámetro "true" cuando se requiere 
     * actualizar los valores forzadamente, sin pasar por las verificaciones previas
     * de cache
     */
    async getItems(section: SettingsSection, forceRefresh = false): Promise<SettingsCacheItem[]> {
        // Verificamos primero si hay datos guardados en el LocalStorage
        const dataCached: SettingsCacheItem[] = this.getValuesCache(section)

        // No ejecutamos la solicitud HTTP si hay datos en cache
        if (dataCached.length != 0 && !this.shouldRefreshCache() && !forceRefresh) {
            // console.log("Se encntraron datos en cache, no se realizará la solicitud HTTP.")
            return dataCached
        }

        // Obtener URL de la sección
        const itemUrl = (tags.find((tag) => tag.key === section)?.urls.get) ?? ""

        // Verificamos si existe la URL
        if (!itemUrl) {
            throw new Error("No se encontró la URL para esta sección de configuración.")
        }

        try {
            // Obtenemos la respuesta del servidor
            const payload = await send_http_get(itemUrl)

            // Parseamos la respuesta al formato de items de configuración
            const items = JSON.parse(JSON.stringify(payload))

            // Estructuramos la respuesta
            const structuredItems: SettingsCacheItem[] | null = items.map((item: any) => settingsLogic.adapterItem(item, section))

            // Si hay función y hay datos
            if (structuredItems) {
                // console.log("Se realizó una solicitud HTTP GET, se actualizará el estado y la cache con los nuevos datos obtenidos.")

                // Guardamos los datos en cache para futuras consultas
                settingsLogic.setValuesCache(section, structuredItems)

                // Retornamos el arreglo de items estructurados
                return structuredItems
            }

            // Si no hay datos
            throw new Error("No se encontraron datos válidos en la respuesta del servidor.")

        } catch (error) {
            throw new Error("Ocurrió un error al obtener los datos de configuración.")
        }
    }
}

export const settingsLogic = new SettingsLogic()

