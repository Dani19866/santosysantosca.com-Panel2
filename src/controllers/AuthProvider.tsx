import { useEffect } from "react"
import { auth } from "../scripts/Auth"

export default function AuthProvider({ children, authProvider }: {
    children: React.ReactNode,
    authProvider?: boolean
}) {

    useEffect(() => {
        // Si no se necesita autenticación, no hacer nada
        if (!authProvider) return;

        // Comprobar si el usuario está autenticado
        const isLoggedIn = auth.isLoggedIn();

        // Si no está autenticado
        if (!isLoggedIn) {
            
            // Redirigir a la página de inicio de sesión
            window.location.href = "/login";
        }
    }, []);

    return (
        <div>
            {children}
        </div>
    )
}