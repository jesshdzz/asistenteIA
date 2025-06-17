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
        <header className="px-4 shadow-lg navbar bg-base-100 lg:px-6">
            <div className="navbar-start">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 text-center text-transparent rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-blue-900 ">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-purple-600 bg-clip-text sm:block">
                        AsistenteAI
                    </h1>
                </div>
            </div>

            <div className="navbar-end">
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-circle">
                        <div className="indicator">
                            <Bell className="w-5 h-5" />
                        </div>
                    </button>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
                            <div className="flex items-center justify-center w-full h-full rounded-full bg-primary-content/55 hover:bg-primary-content/30">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li className="menu-title">
                                <span>{usuario?.nombre || "Usuario"}</span>
                            </li>
                            <li>
                                <a>
                                    <User className="w-4 h-4" />
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <a>Configuración</a>
                            </li>
                            <li>
                                <a onClick={handleLogout}>
                                    <LogOut className="w-4 h-4" />
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
