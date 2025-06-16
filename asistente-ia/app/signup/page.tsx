"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        console.log("Signup attempt:", formData)
        setIsLoading(false)
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <div className="container mx-auto my-20">
            <div className="max-w-md mx-auto mt-10 rounded-lg shadow-lg bg-gradient-to-r from-gray-100 via-white-100 to-gray-50">
                <div className="flex flex-col items-center justify-center gap-5 p-6">
                    <div className="flex flex-col items-center justify-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/45">
                            <UserPlus className="w-6 h-6 text-primary-content/60" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold tracking-wide">Crear cuenta</div>
                            <div className="text-sm ">Completa el formulario para comenzar</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Nombre completo</legend>
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5" />
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
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5" />
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
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" />
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
                                    className="rounded-md hover:bg-transparent hover:text-accent-content/80"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Confirmar contraseña</legend>
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" />
                                <input
                                    className="input input-ghost"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="rounded-md hover:bg-transparent hover:text-accent-content/80"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
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
                                Acepto los{" "}
                                <Link href={"#"} className="link link-hover text-primary-content/50">
                                    términos y condiciones
                                </Link>
                            </label>
                        </fieldset>

                        <div className="flex flex-col items-center py-5">
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

                            <div className="text-sm text-center text-muted-foreground">
                                ¿Ya tienes cuenta?{" "}
                                <Link href={"/login"} className="px-0 font-normal hover:underline text-primary-content/50 underline-offset-4">
                                    Inicia sesión aquí
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    )
}