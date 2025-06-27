"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usuarioStorage, inicializarDatosEjemplo } from "@/lib/storage"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
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
            // Validaciones
            if (!formData.name.trim()) {
                setError("El nombre es requerido")
                return
            }

            if (!formData.email.trim()) {
                setError("El email es requerido")
                return
            }

            if (formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres")
                return
            }

            if (formData.password !== formData.confirmPassword) {
                setError("Las contraseñas no coinciden")
                return
            }

            if (!formData.acceptTerms) {
                setError("Debes aceptar los términos y condiciones")
                return
            }

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Verificar si el email ya existe
            const usuarios = usuarioStorage.obtenerTodos()
            const emailExiste = usuarios.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())

            if (emailExiste) {
                setError("Ya existe una cuenta con este correo electrónico")
                return
            }

            // Crear nuevo usuario
            const nuevoUsuario = usuarioStorage.crear({
                nombre: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                contraseña: formData.password,
            })

            // Establecer como usuario actual
            usuarioStorage.establecerActual(nuevoUsuario)

            // Redirigir al asistente
            router.push("/asistente")
        } catch (error) {
            console.error("Error en registro:", error)
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
        <div className="container px-4 mx-auto my-6 sm:my-12 md:my-20">
            <div className="w-full max-w-md mx-auto mt-6 rounded-lg shadow-lg bg-gradient-to-r from-gray-100 via-white-100 to-gray-50 sm:mt-10">
                <div className="flex flex-col items-center justify-center gap-4 p-4 sm:gap-5 sm:p-6">
                    <div className="flex flex-col items-center justify-center gap-2 mb-4 sm:gap-3 sm:mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/45 sm:w-12 sm:h-12">
                            <UserPlus className="w-5 h-5 text-primary-content/60 sm:w-6 sm:h-6" />
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold tracking-wide sm:text-2xl">Crear cuenta</div>
                            <div className="text-xs sm:text-sm">Completa el formulario para comenzar</div>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full alert alert-error">
                            <span className="text-xs sm:text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Nombre completo</legend>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    className="input input-ghost"
                                    type="text"
                                    placeholder="e.g. Juan Pérez"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                />
                            </div>
                        </fieldset>

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
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Confirmar contraseña</legend>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    className="input input-ghost"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="p-1 rounded-md hover:bg-transparent hover:text-accent-content/80"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </button>
                            </div>
                        </fieldset>

                        <fieldset className="fieldset">
                            <label className="label">
                                <input
                                    className="checkbox checkbox-primary"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                                    required
                                />
                                <span className="text-xs sm:text-sm">
                                    Acepto los{" "}
                                    <Link href={"#"} className="link link-hover text-primary-content/50">
                                        términos y condiciones
                                    </Link>
                                </span>
                            </label>
                        </fieldset>

                        <div className="flex flex-col items-center py-4 sm:py-5">
                            <button type="submit" className="w-full btn btn-ghost" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 rounded-full animate-spin border-background border-t-transparent" />
                                        Creando cuenta...
                                    </>
                                ) : (
                                    "Crear cuenta"
                                )}
                            </button>

                            <div className="text-xs text-center text-muted-foreground sm:text-sm">
                                ¿Ya tienes cuenta?{" "}
                                <Link
                                    href={"/login"}
                                    className="px-0 font-normal hover:underline text-primary-content/50 underline-offset-4"
                                >
                                    Inicia sesión aquí
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
