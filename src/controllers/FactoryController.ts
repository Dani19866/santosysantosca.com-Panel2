export interface PreviousPageCache<TItem = any> {
    page: number
    products: TItem[]
    hasNextPage: boolean
}

class HandleErrors {
    _handleHTTPNotOKResponse(response: Response) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`)
    }

    _handleNetworkError(error: unknown) {
        console.error("Error de red:", error)
        throw new Error("Error de red. Por favor, inténtalo de nuevo más tarde.")
    }

    _handleNotJSONResponse(response: Response): never {
        throw new Error(`Respuesta no es JSON: ${response.status} ${response.statusText}`)
    }
}

/**
 * Clase que actúa como una fábrica de controladores para manejar la lógica 
 * de negocio relacionada con las tablas guardadas en la base de datos.
 * 
 * ¿Qué son los objetos TItem y TawItem?
 * - TItem: Es el tipo final que se quiere usar en el front-end
 * - TRawItem: Es el tipo de dato crudo que se recibe del back-end
 * 
 * -
 * Para mapear el producto que llega del back-end se debe sobreescribir
 * la función mapItem.
 * -
 */
export abstract class FactoryController<TItem = any, TRawItem = unknown> extends HandleErrors {
    // URLS
    api_get: string
    api_save: string
    api_modify: string
    api_get_one: string

    // Variables de almacenado en cache
    private ITEMS_PAGE_CACHE_KEY: string
    private ITEMS_PER_PAGE: number
    private ITEMS_FETCH_SIZE: number

    constructor(
        api_get: string,
        api_save: string,
        api_modify: string,
        api_get_one: string,

        cacheKey: string,
        cacheItemsPerPage: number = 20,
        cacheItemsFetchSize: number = cacheItemsPerPage + 1
    ) {
        super()

        this.api_get = api_get
        this.api_save = api_save
        this.api_modify = api_modify
        this.api_get_one = api_get_one
        this.ITEMS_PAGE_CACHE_KEY = cacheKey
        this.ITEMS_PER_PAGE = cacheItemsPerPage
        this.ITEMS_FETCH_SIZE = cacheItemsFetchSize
    }

    /**
     * Esta función recibe un conjunto de datos parseadon en JSON.
     * Estos datos se convierte de "string" a un objeto que hayamos
     * configurado.
     * 
     * Esta función debe ser modificada al adoptar esta clase.
     */
    abstract mapItem(rawItem: TRawItem): TItem

    /**
     * Esta función ejecuta una petición HTTP al backend
     * 
     * @param offset Desde qué lugar empieza a traer datos
     * @returns Retorna los items desde el Backend | Retorna un array vacío
     */
    getItemsFromApi = async (offset: string = "0", param: string = ""): Promise<TItem[]> => {
        // Usamos AbortController para poder cancelar la solicitud si el componente se desmonta antes de que la respuesta llegue
        const abortController = new AbortController()

        // Parámetros de la solicitud, incluyendo el signal del AbortController
        const requestOptions: RequestInit = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: abortController.signal,
            credentials: "include"
        }

        try {
            // URL API
            const url = `${this.api_get}?limit=${this.ITEMS_FETCH_SIZE}&offset=${offset}${param}`

            // Solicitud HTTP
            const response = await fetch(url, requestOptions)

            // Capturamos posible error HTTP 
            if (!response.ok) {
                this._handleHTTPNotOKResponse(response)
            }

            // Esperamos la respuesta y la parseamos como JSON
            const payload: unknown = await response.json()


            if (!Array.isArray(payload)) {
                this._handleNotJSONResponse(response)
            }

            // Mapeamos el item
            const parsedItems = payload.map((item) => this.mapItem(item as TRawItem))

            // Retornamos el resultado
            return parsedItems

        }
        catch (error) {
            this._handleNetworkError(error)
            return []

        } finally{
            // Cancelamos la solicitud si el componente se desmonta o si ocurre un error
            abortController.abort() 
        }
    }

    /**
     * Hace un intento de búsqueda en el LocalStorage para obtener la info.
     * de la página anterior de productos.
     * 
     * Esta página en tal caso que hubiese sido guardada, se guarda con 
     * savePreviousPageCache() cada vez que se navega a una página diferente.
     * 
     * @returns La información de la página anterior de productos, o null si no existe.
     */
    getPreviousPageCache = (): PreviousPageCache<TItem> | null => {

        try {
            // Obtenemos info del LocalStorage usando la clave definida
            const rawCache = localStorage.getItem(this.ITEMS_PAGE_CACHE_KEY)

            // Si no hay nada guardado, retornamos null
            if (!rawCache) {
                return null
            }

            // Parseamos el JSON como objeto
            const parsedCache = JSON.parse(rawCache) as PreviousPageCache<TItem>

            // Realizamos las verificaciones para comprobar si no han sido manipuladas
            if (
                typeof parsedCache?.page === "number"
                && Array.isArray(parsedCache.products)
                && typeof parsedCache.hasNextPage === "boolean"
            ) {
                return parsedCache
            }

            // Retornamos null si el formato fue manipulado
            return null

        } catch (error) {
            console.error("No se pudo leer caché de productos:", error)
            return null
        }
    }

    /**
     * Función para guardar en localStorage la información de la página anterior, incluyendo:
     * - Número de página
     * - Lista de productos de esa página
     * - Si hay una página siguiente o no
     */
    savePreviousPageCache = (cache: PreviousPageCache<TItem>) => {
        try {
            localStorage.setItem(this.ITEMS_PAGE_CACHE_KEY, JSON.stringify(cache))
        } catch (error) {
            console.error("No se pudo guardar caché de productos:", error)
        }
    }

    /**
     * Función que convierte diferentes tipos de valores a números.
     * 
     * Funciona de la siguiente manera:
     *  - Si el valor es un número, lo devuelve tal cual.
     *  - Si el valor es un string, entonces verifica que no esté vacío y lo
     *    intenta convertir a número. Si la conversión resulta en NaN, devuelve 0.
     * 
     * Si el valor no es ni un número ni un string válido, devuelve 0.
     */
    utilToNumber = (value: unknown): number => {
        if (typeof value === "number") return value
        if (typeof value === "string" && value.trim() !== "") {
            const parsedValue = Number(value)
            return Number.isNaN(parsedValue) ? 0 : parsedValue
        }

        return 0
    }

    /**
     * Función que convierte diferentes tipos de valores a booleanos. 
     * 
     * Funciona de la siguiente manera:
     *  - Si es boolean, devuelve el valor tal cual.
     *  - Si es un número, devuelve true si el número es 1, y false para cualquier otro número.
     *  - Si es un string, entonces lo normaliza (minuscula y trim) y devuelve true si es "true" o "1".
     * 
     * Si no cumple ninguna de las condiciones anteriores, devuelve false.
     */
    utilToBoolean = (value: unknown): boolean => {
        if (typeof value === "boolean") return value
        if (typeof value === "number") return value === 1
        if (typeof value === "string") {
            const normalizedValue = value.trim().toLowerCase()
            return normalizedValue === "true" || normalizedValue === "1"
        }

        return false
    }

    public getItemsPerPage(): number {
        return this.ITEMS_PER_PAGE
    }

    public getItemsFetchSize(): number {
        return this.ITEMS_FETCH_SIZE
    }
}