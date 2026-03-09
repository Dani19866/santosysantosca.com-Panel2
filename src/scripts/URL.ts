export const api_base = "https://api.santosysantosca.com/"

// Usuarios
export const api_register_user: string = api_base + "user/register"
export const api_log_user: string = api_base + "user/login"

// Productos
export const api_get_products: string = api_base + "products"
export const api_save_product: string = api_base + "products/save"
export const api_modify_product: string = api_base + "products/{id}"
export const api_get_one_product: string = api_base + "products/{id}"
export const api_search_product: string = api_base + "products/search"

// ETIQUETAS (NO USAR DIRECTAMENTE): Categorías
export const api_get_category: string = api_base + "categories_products"
export const api_save_category: string = api_base + "categories_products/save"
export const api_modify_category: string = api_base + "categories_products/{id}"
export const api_get_one_category: string = api_base + "categories_products/{id}"

// ETIQUETAS (NO USAR DIRECTAMENTE): Unidades
export const api_get_units_of_measure: string = api_base + "units_of_measure"
export const api_save_units_of_measure: string = api_base + "units_of_measure/save"
export const api_modify_units_of_measure: string = api_base + "units_of_measure/{id}"
export const api_get_one_units_of_measure: string = api_base + "units_of_measure/{id}"

// ETIQUETAS (NO USAR DIRECTAMENTE): Razones de paradas de máquinas
export const api_get_downtime_reason: string = api_base + "downtime_reason"
export const api_save_downtime_reason: string = api_base + "downtime_reason/save"
export const api_modify_downtime_reason: string = api_base + "downtime_reason/{id}"
export const api_get_one_downtime_reason: string = api_base + "downtime_reason/{id}"

// ETIQUETAS (NO USAR DIRECTAMENTE): Razones de movimiento de productos
export const api_get_movements_reason: string = api_base + "movements_reason"
export const api_save_movements_reason: string = api_base + "movements_reason/save"
export const api_modify_movements_reason: string = api_base + "movements_reason/{id}"
export const api_get_one_movements_reason: string = api_base + "movements_reason/{id}"

// Etiquetas del sistema
export type SettingsSection = "categories" | "units" | "machineFails" | "movementReasons"

export interface URLTag {
    key: SettingsSection,
    urls: {
        get: string,
        save: string,
        modify: string,
        getOne: string
    }
}

export const tags: URLTag[] = [
    {
        key: "categories",
        urls: {
            get: api_get_category,
            save: api_save_category,
            modify: api_modify_category,
            getOne: api_get_one_category
        }
    },
    {
        key: "units",
        urls: {
            get: api_get_units_of_measure,
            save: api_save_units_of_measure,
            modify: api_modify_units_of_measure,
            getOne: api_get_one_units_of_measure
        }
    },
    {
        key: "machineFails",
        urls: {
            get: api_get_downtime_reason,
            save: api_save_downtime_reason,
            modify: api_modify_downtime_reason,
            getOne: api_get_one_downtime_reason
        }
    },
    {
        key: "movementReasons",
        urls: {
            get: api_get_movements_reason,
            save: api_save_movements_reason,
            modify: api_modify_movements_reason,
            getOne: api_get_one_movements_reason
        }
    }
]

