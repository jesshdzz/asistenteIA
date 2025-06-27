"use client"

import type React from "react"

import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usuarioStorage, inicializarDatosEjemplo } from "@/lib/storage"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    })

    const router = useRouter()

    useEffect(() => {
        inicializarDatosEjemplo()
        // Si ya hay un usuario logueado, redirigir
        const usuarioActual = usuarioStorage.obtenerActual()
        if (usuarioActual) {
            router.push("/asistente")
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Buscar usuario por email
            const usuarios = usuarioStorage.obtenerTodos()
            const usuario = usuarios.find((u) => u.email.toLowerCase() === formData.email.toLowerCase())

            if (!usuario) {
                setError("No existe una cuenta con este correo electrónico")
                return
            }

            // En un sistema real, aquí verificarías la contraseña hasheada
            // Por simplicidad, usamos el email como contraseña por defecto
            const passwordCorrecta = formData.password === usuario.contraseña || formData.password === usuario.email

            if (!passwordCorrecta) {
                setError("Contraseña incorrecta")
                return
            }

            // Login exitoso
            usuarioStorage.establecerActual(usuario)
            router.push("/asistente")
        } catch (error) {
            console.error("Error en login:", error)
            setError("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Limpiar error al escribir
        if (error) setError("")
    }

    return (
        <div className="container px-4 mx-auto my-8 sm:my-16 md:my-32">
            <div className="w-full max-w-md mx-auto mt-6 rounded-lg shadow-lg bg-gradient-to-r from-gray-100 via-white-100 to-gray-50 sm:mt-10">
                <div className="flex flex-col items-center justify-center gap-4 p-4 sm:gap-5 sm:p-6">
                    <div className="flex flex-col items-center justify-center gap-2 mb-4 sm:gap-3 sm:mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/45 sm:w-12 sm:h-12">
                            <LogIn className="w-5 h-5 text-primary-content/60 sm:w-6 sm:h-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold tracking-wide sm:text-2xl">Iniciar Sesión</div>
                            <div className="text-xs sm:text-sm">Ingresa tus credenciales para acceder a tu cuenta</div>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full alert alert-error">
                            <span className="text-xs sm:text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Correo electronico</legend>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    className="input input-ghost"
                                    type="email"
                                    placeholder="hola@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    required
                                />
                            </div>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Contraseña</legend>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    className="input input-ghost"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="p-1 rounded-md hover:bg-transparent hover:text-accent-content/80"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </button>
                            </div>
                            <Link
                                href={"#"}
                                className="px-0 text-xs font-normal underline-offset-4 hover:underline text-primary-content/50 sm:text-sm"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </fieldset>

                        <div className="flex items-center mb-3 sm:mb-4">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={formData.rememberMe}
                                onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                            />
                            <label className="ml-2 text-xs sm:text-sm">Recordarme</label>
                        </div>

                        <div className="flex flex-col items-center py-4 sm:py-5">
                            <button type="submit" className="w-full btn btn-ghost" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 rounded-full animate-spin border-background border-t-transparent" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "Iniciar Sesión"
                                )}
                            </button>
                            <div className="text-xs text-center text-muted-foreground sm:text-sm">
                                ¿No tienes una cuenta?{" "}
                                <Link
                                    href={"/signup"}
                                    className="px-0 font-normal hover:underline text-primary-content/50 underline-offset-4"
                                >
                                    Regístrate aquí
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Credenciales de prueba */}
                    <div className="w-full p-2 mt-3 text-xs border rounded-lg bg-base-200 border-base-300 sm:p-3 sm:mt-4">
                        <div className="mb-1 font-semibold">Credenciales de prueba:</div>
                        <div>Email: jesus@ejemplo.com</div>
                        <div>Contraseña: jesus123</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
