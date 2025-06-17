import { BotMessageSquare, HelpCircle, History, Home, ListTodo, LogOut, Notebook, Settings, User } from "lucide-react"
import { usuarioStorage, type Usuario } from "@/lib/storage"
import { useState, useEffect } from "react"

const menuItems = [
    { icon: Home, label: "Inicio", href: "/", badge: null },
    { icon: BotMessageSquare, label: "Asistente", href: "/asistente", badge: null },
    { icon: Notebook, label: "Notas", href: "/notas", badge: null },
    { icon: ListTodo, label: "Pendientes", href: "/pendientes", badge: null },
    { icon: History, label: "Historial", href: "/history", badge: "12" },
    { icon: Settings, label: "Configuración", href: "/settings", badge: null },
    { icon: HelpCircle, label: "Ayuda", href: "/help", badge: null },
]

export const SideMenu = () => {
    const [usuario, setUsuario] = useState<Usuario | null>(null)

    useEffect(() => {
        const usuarioActual = usuarioStorage.obtenerActual()
        setUsuario(usuarioActual)
    }, [])

    return (
        <aside className="w-full h-full overflow-y-scroll shadow-xl ">
            {/* User Profile */}
            <div className="p-6 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-base-300">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{usuario?.nombre || "Usuario"}</h3>
                        <p className="text-sm text-base-content/60">{usuario?.email || "usuario@ejemplo.com"}</p>
                        <p className="text-sm text-base-content/60">juan@ejemplo.com</p>
                    </div>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01"
                                />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52">
                            <li>
                                <a>
                                    <User className="w-4 h-4" />
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <a>
                                    <Settings className="w-4 h-4" />
                                    Configuración
                                </a>
                            </li>
                            <li>
                                <a>
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4">
                <ul className="w-full space-y-2 menu menu-vertical">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.href}
                                className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-base-200"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {item.badge && <div className="badge badge-primary badge-sm">{item.badge}</div>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )

}