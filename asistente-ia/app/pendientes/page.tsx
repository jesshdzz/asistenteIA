"use client"

import { useState, useRef, useEffect } from "react"
import {
    Plus,
    Edit,
    Trash2,
    Calendar,
    Clock,
    CheckCircle,
    Circle,
    AlertCircle,
    X,
    EllipsisVertical,
    Menu,
} from "lucide-react"
import { SideMenu } from "@/components/SideMenu"
import { pendientesStorage, usuarioStorage, inicializarDatosEjemplo, type Pendiente } from "@/lib/storage"

const categorias = ["Personal", "Trabajo", "Salud", "Familia", "Estudios", "Hogar"]
const prioridades = [
    { valor: "baja", label: "Baja", color: "badge-success" },
    { valor: "media", label: "Media", color: "badge-warning" },
    { valor: "alta", label: "Alta", color: "badge-error" },
]

export default function PendientesPage() {
    const [pendientes, setPendientes] = useState<Pendiente[]>([])
    const [modalCrear, setModalCrear] = useState(false)
    const [modalVer, setModalVer] = useState(false)
    const [pendienteSeleccionado, setPendienteSeleccionado] = useState<Pendiente | null>(null)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [sideMenuOpen, setSideMenuOpen] = useState(false)

    const [formulario, setFormulario] = useState({
        titulo: "",
        descripcion: "",
        tipo: "tarea" as "tarea" | "evento",
        prioridad: "media" as "baja" | "media" | "alta",
        fechaVencimiento: "",
        horaEvento: "",
        categoria: "Personal",
    })

    const modalCrearRef = useRef<HTMLDialogElement>(null)
    const modalVerRef = useRef<HTMLDialogElement>(null)

    // Cargar datos al montar el componente
    useEffect(() => {
        inicializarDatosEjemplo()
        cargarPendientes()
    }, [])

    const cargarPendientes = () => {
        setCargando(true)
        const usuarioActual = usuarioStorage.obtenerActual()
        if (usuarioActual) {
            const pendientesUsuario = pendientesStorage.obtenerTodos(usuarioActual.id)
            setPendientes(pendientesUsuario)
        }
        setCargando(false)
    }

    const abrirModalCrear = () => {
        setFormulario({
            titulo: "",
            descripcion: "",
            tipo: "tarea",
            prioridad: "media",
            fechaVencimiento: "",
            horaEvento: "",
            categoria: "Personal",
        })
        setModoEdicion(false)
        setModalCrear(true)
        modalCrearRef.current?.showModal()
    }

    const abrirModalEditar = (pendiente: Pendiente) => {
        setFormulario({
            titulo: pendiente.titulo,
            descripcion: pendiente.descripcion,
            tipo: pendiente.tipo,
            prioridad: pendiente.prioridad,
            fechaVencimiento: pendiente.fechaVencimiento?.toISOString().split("T")[0] || "",
            horaEvento: pendiente.horaEvento || "",
            categoria: pendiente.categoria,
        })
        setPendienteSeleccionado(pendiente)
        setModoEdicion(true)
        setModalCrear(true)
        modalCrearRef.current?.showModal()
    }

    const abrirModalVer = (pendiente: Pendiente) => {
        setPendienteSeleccionado(pendiente)
        setModalVer(true)
        modalVerRef.current?.showModal()
    }

    const guardarPendiente = () => {
        if (!formulario.titulo.trim()) return

        const usuarioActual = usuarioStorage.obtenerActual()
        if (!usuarioActual) return

        const pendienteData = {
            ...formulario,
            fechaVencimiento: formulario.fechaVencimiento ? new Date(formulario.fechaVencimiento) : undefined,
            usuarioId: usuarioActual.id,
        }

        try {
            if (modoEdicion && pendienteSeleccionado) {
                // Actualizar pendiente existente
                const pendienteActualizado = pendientesStorage.actualizar(pendienteSeleccionado.id, pendienteData)
                if (pendienteActualizado) {
                    setPendientes((prev) =>
                        prev.map((pendiente) => (pendiente.id === pendienteSeleccionado.id ? pendienteActualizado : pendiente)),
                    )
                }
            } else {
                // Crear nuevo pendiente
                const nuevoPendiente = pendientesStorage.crear({
                    ...pendienteData,
                    estado: "pendiente",
                })
                setPendientes((prev) => [nuevoPendiente, ...prev])
            }

            cerrarModalCrear()
        } catch (error) {
            console.error("Error al guardar pendiente:", error)
        }
    }

    const toggleEstado = (id: string) => {
        try {
            const pendiente = pendientes.find((p) => p.id === id)
            if (!pendiente) return

            const nuevoEstado = pendiente.estado === "pendiente" ? "completado" : "pendiente"
            const pendienteActualizado = pendientesStorage.actualizar(id, { estado: nuevoEstado })

            if (pendienteActualizado) {
                setPendientes((prev) => prev.map((p) => (p.id === id ? pendienteActualizado : p)))
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error)
        }
    }

    const eliminarPendiente = (id: string) => {
        try {
            const eliminado = pendientesStorage.eliminar(id)
            if (eliminado) {
                setPendientes((prev) => prev.filter((pendiente) => pendiente.id !== id))
            }
        } catch (error) {
            console.error("Error al eliminar pendiente:", error)
        }
    }

    const cerrarModalCrear = () => {
        setModalCrear(false)
        modalCrearRef.current?.close()
    }

    const cerrarModalVer = () => {
        setModalVer(false)
        modalVerRef.current?.close()
    }

    const getPrioridadColor = (prioridad: string) => {
        const p = prioridades.find((p) => p.valor === prioridad)
        return p?.color || "badge-ghost"
    }

    const estaVencido = (fecha?: Date) => {
        if (!fecha) return false
        return fecha < new Date() && fecha.toDateString() !== new Date().toDateString()
    }

    const esHoy = (fecha?: Date) => {
        if (!fecha) return false
        return fecha.toDateString() === new Date().toDateString()
    }

    const colorPendiente = (categoria: string) => {
        switch (categoria) {
            case "Personal":
                return "bg-blue-100 border-blue-300"
            case "Trabajo":
                return "bg-green-100 border-green-300"
            case "Salud":
                return "bg-yellow-100 border-yellow-300"
            case "Familia":
                return "bg-pink-100 border-pink-300"
            case "Estudios":
                return "bg-purple-100 border-purple-300"
            case "Hogar":
                return "bg-gray-100 border-gray-300"
            default:
                return "bg-base-100 border-base-200"
        }
    }

    if (cargando) {
        return (
            <div className="flex min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
                <div className="hidden lg:block">
                    <SideMenu />
                </div>
                <div className="flex items-center justify-center flex-1 p-10">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-100 shadow-lg lg:hidden"
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
            >
                {sideMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Side Menu - Mobile Overlay */}
            <div className={`fixed inset-0 z-40 lg:relative lg:z-auto ${sideMenuOpen ? "block" : "hidden"} lg:block`}>
                <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setSideMenuOpen(false)} />
                <div className="relative w-80 h-full bg-base-100 lg:w-full">
                    <SideMenu />
                </div>
            </div>

            <div className="flex-1 p-4 bg-base-50 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-content/60 sm:text-3xl">Pendientes</h1>
                            <p className="text-sm text-base-content/70 sm:text-base">Organiza tus tareas y eventos</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary btn-sm sm:btn-md" onClick={abrirModalCrear}>
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nuevo Pendiente</span>
                                <span className="sm:hidden">Nuevo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Pendientes */}
                <div className="space-y-3 sm:space-y-4">
                    {pendientes.map((pendiente) => (
                        <div
                            key={pendiente.id}
                            className={`card bg-base-100 shadow-sm border hover:shadow-md transition-all duration-200 
                ${pendiente.estado === "completado" ? "opacity-60" : ""} 
                ${estaVencido(pendiente.fechaVencimiento) ? "border-error" : ""}
                ${colorPendiente(pendiente.categoria)}`}
                        >
                            <div className="p-3 card-body sm:p-4">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    {/* Checkbox */}
                                    <button className="mt-1" onClick={() => toggleEstado(pendiente.id)}>
                                        {pendiente.estado === "completado" ? (
                                            <CheckCircle className="w-4 h-4 text-success sm:w-5 sm:h-5" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-base-content/40 hover:text-primary sm:w-5 sm:h-5" />
                                        )}
                                    </button>

                                    {/* Contenido */}
                                    <div className="flex-1" onClick={() => abrirModalVer(pendiente)}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3
                                                className={`text-sm font-semibold sm:text-base ${pendiente.estado === "completado" ? "line-through text-base-content/60" : ""}`}
                                            >
                                                {pendiente.titulo}
                                            </h3>
                                        </div>

                                        <p className="mb-3 text-xs text-base-content/70 line-clamp-2 sm:text-sm">{pendiente.descripcion}</p>

                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <div
                                                className={`badge badge-xs sm:badge-sm ${pendiente.tipo === "evento" ? "badge-info" : "badge-ghost"}`}
                                            >
                                                {pendiente.tipo === "evento" ? "Evento" : "Tarea"}
                                            </div>
                                            <div className={`badge badge-xs sm:badge-sm ${getPrioridadColor(pendiente.prioridad)}`}>
                                                {prioridades.find((p) => p.valor === pendiente.prioridad)?.label}
                                            </div>
                                            <div className="badge badge-outline badge-xs sm:badge-sm">{pendiente.categoria}</div>
                                            {pendiente.fechaVencimiento && (
                                                <div
                                                    className={`flex items-center gap-1 ${estaVencido(pendiente.fechaVencimiento)
                                                            ? "text-error-content/70"
                                                            : esHoy(pendiente.fechaVencimiento)
                                                                ? "text-warning-content/60"
                                                                : "text-base-content/60"
                                                        }`}
                                                >
                                                    <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                                                    <span className="text-xs">{pendiente.fechaVencimiento.toLocaleDateString()}</span>
                                                    {pendiente.horaEvento && (
                                                        <>
                                                            <Clock className="w-2 h-2 ml-1 sm:w-3 sm:h-3" />
                                                            <span className="text-xs">{pendiente.horaEvento}</span>
                                                        </>
                                                    )}
                                                    {estaVencido(pendiente.fechaVencimiento) && (
                                                        <AlertCircle className="w-2 h-2 ml-1 sm:w-3 sm:h-3" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                            <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                        <ul tabIndex={0} className="w-32 p-2 shadow dropdown-content menu bg-base-100 rounded-box sm:w-40">
                                            <li>
                                                <a onClick={() => abrirModalEditar(pendiente)} className="text-xs sm:text-sm">
                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Editar
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={() => eliminarPendiente(pendiente.id)} className="text-xs text-error sm:text-sm">
                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Eliminar
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pendientes.length === 0 && (
                    <div className="py-8 text-center sm:py-12">
                        <div className="mb-4 text-4xl sm:text-6xl">📋</div>
                        <h3 className="mb-2 text-lg font-semibold sm:text-xl">No hay tareas</h3>
                        <p className="mb-4 text-sm text-base-content/70 sm:text-base">Comienza creando tu primer tarea.</p>
                        <button className="btn btn-primary btn-sm sm:btn-md" onClick={abrirModalCrear}>
                            <Plus className="w-4 h-4" />
                            Crear Primer Pendiente
                        </button>
                    </div>
                )}

                {/* Modal Crear/Editar */}
                <dialog ref={modalCrearRef} className="modal">
                    <div className="w-11/12 max-w-2xl modal-box">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">{modoEdicion ? "Editar Pendiente" : "Nuevo Pendiente"}</h3>
                            <button className="btn btn-sm btn-circle btn-ghost" onClick={cerrarModalCrear}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <fieldset className="w-full fieldset">
                                    <legend className="fieldset-legend">Titulo: </legend>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Título del pendiente..."
                                        value={formulario.titulo}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, titulo: e.target.value }))}
                                    />
                                </fieldset>

                                <fieldset className="w-full fieldset">
                                    <legend className="fieldset-legend">Descripción: </legend>
                                    <textarea
                                        className="textarea min-h-20"
                                        placeholder="Describe los detalles..."
                                        value={formulario.descripcion}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, descripcion: e.target.value }))}
                                    ></textarea>
                                </fieldset>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Tipo: </legend>
                                    <select
                                        className="select"
                                        value={formulario.tipo}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, tipo: e.target.value as "tarea" | "evento" }))}
                                    >
                                        <option disabled={true}>Tipo</option>
                                        <option value="tarea">Tarea</option>
                                        <option value="evento">Evento</option>
                                    </select>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Prioridad: </legend>
                                    <select
                                        className="select"
                                        value={formulario.prioridad}
                                        onChange={(e) =>
                                            setFormulario((prev) => ({ ...prev, prioridad: e.target.value as "baja" | "media" | "alta" }))
                                        }
                                    >
                                        <option disabled={true}>Prioridad</option>
                                        {prioridades.map((p) => (
                                            <option key={p.valor} value={p.valor}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Categoría: </legend>
                                    <select
                                        className="select"
                                        value={formulario.categoria}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, categoria: e.target.value }))}
                                    >
                                        <option disabled={true}>Categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Fecha límite: </legend>
                                    <input
                                        className="input"
                                        type="date"
                                        value={formulario.fechaVencimiento}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, fechaVencimiento: e.target.value }))}
                                    />
                                </fieldset>

                                {formulario.tipo === "evento" && (
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Hora del evento: </legend>
                                        <input
                                            className="input"
                                            type="time"
                                            value={formulario.horaEvento}
                                            onChange={(e) => setFormulario((prev) => ({ ...prev, horaEvento: e.target.value }))}
                                        />
                                    </fieldset>
                                )}
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm sm:btn-md" onClick={cerrarModalCrear}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary btn-sm sm:btn-md"
                                onClick={guardarPendiente}
                                disabled={!formulario.titulo.trim()}
                            >
                                {modoEdicion ? "Actualizar" : "Crear"} Pendiente
                            </button>
                        </div>
                    </div>
                </dialog>

                {/* Modal Ver Pendiente */}
                <dialog ref={modalVerRef} className="modal">
                    <div className="w-11/12 max-w-2xl modal-box">
                        {pendienteSeleccionado && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">{pendienteSeleccionado.titulo}</h3>
                                    <button className="btn btn-sm btn-circle btn-ghost" onClick={cerrarModalVer}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <div
                                            className={`badge badge-sm ${pendienteSeleccionado.tipo === "evento" ? "badge-info" : "badge-ghost"}`}
                                        >
                                            {pendienteSeleccionado.tipo === "evento" ? "Evento" : "Pendiente"}
                                        </div>
                                        <div className={`badge badge-sm ${getPrioridadColor(pendienteSeleccionado.prioridad)}`}>
                                            {prioridades.find((p) => p.valor === pendienteSeleccionado.prioridad)?.label}
                                        </div>
                                        <div className="badge badge-outline badge-sm">{pendienteSeleccionado.categoria}</div>
                                        <div
                                            className={`badge badge-sm ${pendienteSeleccionado.estado === "completado" ? "badge-success" : "badge-warning"}`}
                                        >
                                            {pendienteSeleccionado.estado === "completado" ? "Completado" : "Pendiente"}
                                        </div>
                                    </div>

                                    {pendienteSeleccionado.descripcion && (
                                        <div>
                                            <h4 className="mb-2 text-sm font-semibold sm:text-base">Descripción:</h4>
                                            <p className="text-sm whitespace-pre-wrap text-base-content/80 sm:text-base">
                                                {pendienteSeleccionado.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                        <div>
                                            <span className="font-semibold">Creado:</span>
                                            <p>{pendienteSeleccionado.fechaCreacion.toLocaleDateString()}</p>
                                        </div>
                                        {pendienteSeleccionado.fechaVencimiento && (
                                            <div>
                                                <span className="font-semibold">Fecha límite:</span>
                                                <p className={estaVencido(pendienteSeleccionado.fechaVencimiento) ? "text-error" : ""}>
                                                    {pendienteSeleccionado.fechaVencimiento.toLocaleDateString()}
                                                    {pendienteSeleccionado.horaEvento && ` a las ${pendienteSeleccionado.horaEvento}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-action">
                                    <button className="btn btn-ghost btn-sm sm:btn-md" onClick={cerrarModalVer}>
                                        Cerrar
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm sm:btn-md"
                                        onClick={() => {
                                            cerrarModalVer()
                                            abrirModalEditar(pendienteSeleccionado)
                                        }}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </dialog>
                {modalCrear && modalVer}
            </div>
        </div>
    )
}
