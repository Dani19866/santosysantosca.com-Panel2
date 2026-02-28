import { auth } from "../scripts/Auth"
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

type LoginProps = {
    onLoginSuccess: () => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [authError, setAuthError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    /**
     * Tarea: Verificar si el usuario ya está autenticado al cargar el componente
     * 
     */
    useEffect(() => {
        if (auth.isLoggedIn()) {
            onLoginSuccess();
        }
    }, [onLoginSuccess]);

    /**
     * Tarea: Manejar el envío del formulario de inicio de sesión
     *        y realiza la autenticación del usuario
     * @param e - Evento de formulario
     */
    const handleSubmit = async (e: React.FormEvent) => {
        // Prevenir el comportamiento por defecto del formulario
        e.preventDefault();

        // Limpiar errores previos y activar el estado de carga
        setAuthError('');
        setIsLoading(true);

        // Extraer los datos del formulario
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        // Utilizamos el método de autenticación para verificar las credenciales
        const isAuthenticated = await auth.login(username, password);

        // Si la autenticación es exitosa, actualizar el estado de la aplicación
        if (isAuthenticated) {
            onLoginSuccess();
        } else {
            // Si la autenticación falla, mostrar un mensaje de error
            setAuthError('Credenciales inválidas. Por favor, intenta nuevamente.');
        }

        // Desactivar el estado de carga después de la autenticación
        setIsLoading(false);
    }

    /**
     * Tarea: Manejar cambios en el formulario para limpiar mensajes de error
     */
    const handleChanges = () => {
        // Limpiar el mensaje de error cada vez que el usuario realice un cambio en el formulario
        if (authError) {
            setAuthError('');
        }
    }

    return (
        <section>
            <div className="relative w-full h-screen bg-linear-to-br from-[#1e11d9] via-[#003D9D] to-[#001f5c] overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Login Container */}
                <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
                    <div className="w-full max-w-md">
                        {/* Logo/Brand Section */}
                        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 shadow-xl">
                                <ShieldCheck className="size-10 text-white" strokeWidth={2} />
                            </div>
                            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[32px] text-white mb-2">
                                Sistema de Gestión de Producción
                            </h1>
                            <p className="font-['Inter:Medium',sans-serif] font-medium text-[15px] text-white/70">
                                Metalúrgica Santos y Santos C.A.
                            </p>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                            {/* Card Header */}
                            <div className="bg-linear-to-r from-[#F9FAFB] to-white px-8 py-6 border-b border-[#E5E7EB]">
                                <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[20px] text-[#363636] mb-1">
                                    Iniciar Sesión
                                </h2>
                                <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#9CA3AF]">
                                    Ingresa tus credenciales para acceder al sistema
                                </p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} onChange={handleChanges} className="p-8 space-y-6">
                                {/* Username Field */}
                                <div>
                                    <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                                        Usuario *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <User className="size-5 text-[#9CA3AF]" strokeWidth={2.5} />
                                        </div>
                                        <input
                                            name="username"
                                            type="text"
                                            required
                                            placeholder="Ingresa tu usuario"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E5E7EB] rounded-xl font-['Inter:Medium',sans-serif] text-[14px] text-[#363636] placeholder:text-[#9CA3AF] focus:border-[#1e11d9] focus:outline-none transition-colors"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                                        Contraseña *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Lock className="size-5 text-[#9CA3AF]" strokeWidth={2.5} />
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-14 py-3.5 border-2 border-[#E5E7EB] rounded-xl font-['Inter:Medium',sans-serif] text-[14px] text-[#363636] placeholder:text-[#9CA3AF] focus:border-[#1e11d9] focus:outline-none transition-colors"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-5 text-[#9CA3AF]" strokeWidth={2.5} />
                                            ) : (
                                                <Eye className="size-5 text-[#9CA3AF]" strokeWidth={2.5} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {authError && (
                                    <div className="bg-[#c50707]/10 border-l-4 border-[#c50707] rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="size-5 text-[#c50707] shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#c50707]">
                                            {authError}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-linear-to-r from-[#1e11d9] to-[#003D9D] text-white rounded-xl font-['Inter:Bold',sans-serif] font-bold text-[15px] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verificando...
                                        </span>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-8 animate-in fade-in duration-700 delay-300">
                            <p className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-white/60">
                                © 2026 Metalúrgica Santos y Santos C.A.
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </section >
    )
}