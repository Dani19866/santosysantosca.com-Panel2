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
