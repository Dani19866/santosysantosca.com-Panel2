import {
    api_register_user,
    api_log_user,
} from "./URL.js"

class Auth {
    authenticated_path: string
    readonly api_reg: string
    readonly api_login: string
    readonly session_duration_ms: number 

    constructor() {
        this.api_reg = api_register_user
        this.api_login = api_log_user
        this.authenticated_path = "authenticated_date"
        this.session_duration_ms = 3600 * 1000 
    }

    async login(username: string, password: string): Promise<boolean> {
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },

            body: new URLSearchParams({
                username,
                password,
                api: "false"
            }),
        }

        // Intentar realizar la solicitud de login y manejar posibles errores
        try {
            // Realizar la solicitud de login
            const response = await fetch(this.api_login, requestOptions);

            // Si la respuesta es exitosa, procesar los datos
            if (response.ok) {
                localStorage.setItem(this.authenticated_path, new Date().toISOString())
                return true;
            }
            // Si ocurrió un error en el servidor, manejarlo
            else {
                this._handle_login_error(response.status);
                return false;
            }

            // Manejar errores de red u otros errores inesperados
        } catch (error) {
            this._handle_login_error(error);
            return false;
        }
    }

    isLoggedIn(): boolean {
        // Obtenemos cuando iniciamos sesión
        const authenticatedDate = localStorage.getItem(this.authenticated_path);

        // Si no hay una fecha de autenticación, el usuario no está logueado
        if (!authenticatedDate) {
            return false;
        }

        // Convertimos la fecha de autenticación a un objeto Date
        const authenticatedTime = new Date(authenticatedDate).getTime();

        // Obtenemos el tiempo actual
        const currentTime = new Date().getTime();

        // Calculamos la diferencia en milisegundos entre el tiempo actual y el tiempo de autenticación
        const timeDifference = currentTime - authenticatedTime;

        // Si la diferencia es menor que lo asginado en milisegundos
        if (timeDifference < this.session_duration_ms) {
            return true;
        }

        // Si la sesión ha expirado, eliminamos la fecha de autenticación y retornamos false
        this.logout();
        return false;
    }

    logout() {
        localStorage.removeItem(this.authenticated_path)
    }

    _handle_login_error(error: any) {
        console.error("Error en el proceso de login:", error)
    }
}

export const auth = new Auth()