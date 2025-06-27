"use client"

import { Bell, Rocket, User, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usuarioStorage, type Usuario } from "@/lib/storage"

export const Header = () => {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const router = useRouter()

    useEffect(() => {
        const usuarioActual = usuarioStorage.obtenerActual()
        setUsuario(usuarioActual)
    }, [])

    const handleLogout = () => {
        // Limpiar usuario actual
        if (typeof window !== "undefined") {
            localStorage.removeItem("asistente_usuario_actual")
        }
        setUsuario(null)
        router.push("/login")
    }

    return (
        <header className="px-4 shadow-lg navbar bg-base-100 sm:px-6 lg:px-8">
            <div className="navbar-start">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 text-center text-transparent rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-blue-900 sm:w-10 sm:h-10">
                        <Rocket className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    </div>
                    <h1 className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-purple-600 bg-clip-text sm:text-xl">
                        <span className="hidden sm:inline">AsistenteAI</span>
                        <span className="sm:hidden">AI</span>
                    </h1>
                </div>
            </div>

            <div className="navbar-end">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button className="btn btn-ghost btn-circle btn-sm sm:btn-md">
                        <div className="indicator">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </button>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm sm:btn-md">
                            <div className="flex items-center justify-center w-full h-full rounded-full bg-primary-content/55 hover:bg-primary-content/30">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44 sm:w-52"
                        >
                            <li className="menu-title">
                                <span className="text-xs sm:text-sm">{usuario?.nombre || "Usuario"}</span>
                            </li>
                            <li>
                                <a className="text-xs sm:text-sm">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <a className="text-xs sm:text-sm">Configuración</a>
                            </li>
                            <li>
                                <a onClick={handleLogout} className="text-xs sm:text-sm">
                                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Cerrar Sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}
