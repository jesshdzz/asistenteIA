"use client"

import { BotMessageSquare, HelpCircle, History, ListTodo, LogOut, Notebook, Settings, User } from "lucide-react"
import { usuarioStorage, type Usuario } from "@/lib/storage"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

const menuItems = [
    // { icon: Home, label: "Inicio", href: "/", badge: null },
    { icon: BotMessageSquare, label: "Asistente", href: "/asistente", badge: null },
    { icon: Notebook, label: "Notas", href: "/notas", badge: null },
    { icon: ListTodo, label: "Pendientes", href: "/pendientes", badge: null },
    { icon: History, label: "Historial", href: "/history", badge: "12" },
    { icon: Settings, label: "Configuración", href: "/settings", badge: null },
    { icon: HelpCircle, label: "Ayuda", href: "/help", badge: null },
]

export const SideMenu = () => {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const pathname = usePathname()
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

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/"
        }
        return pathname.startsWith(href)
    }

    return (
        <aside className="w-full h-full overflow-y-auto shadow-xl bg-base-100">
            {/* User Profile */}
            <div className="p-4 border-b border-base-300 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-base-300 sm:w-12 sm:h-12">
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate sm:text-base">{usuario?.nombre || "Usuario"}</h3>
                        <p className="text-xs text-base-content/60 truncate sm:text-sm">
                            {usuario?.email || "usuario@ejemplo.com"}
                        </p>
                    </div>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-44 sm:w-52">
                            <li>
                                <a className="text-xs sm:text-sm">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <a className="text-xs sm:text-sm">
                                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Configuración
                                </a>
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

            {/* Navigation Menu */}
            <nav className="p-3 sm:p-4">
                <ul className="w-full space-y-1 menu menu-vertical sm:space-y-2">
                    {menuItems.map((item, index) => {
                        const active = isActive(item.href)
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center justify-between p-2 transition-colors rounded-lg text-sm sm:p-3 sm:text-base
                                        ${active
                                            ? "bg-primary text-primary-content font-semibold shadow-md"
                                            : "hover:bg-base-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? "text-primary-content" : ""}`} />
                                        <span className={`font-medium ${active ? "text-primary-content" : ""}`}>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <div className={`badge badge-xs sm:badge-sm ${active ? "badge-secondary" : "badge-primary"}`}>
                                            {item.badge}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </aside>
    )
}
