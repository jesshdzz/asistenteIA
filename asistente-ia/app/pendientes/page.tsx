"use client"

import { useState, useRef } from "react"
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
} from "lucide-react"
import { SideMenu } from "@/components/SideMenu"

interface Pendiente {
    id: string
    titulo: string
    descripcion: string
    tipo: "tarea" | "evento"
    prioridad: "baja" | "media" | "alta"
    estado: "pendiente" | "completado"
    fechaCreacion: Date
    fechaVencimiento?: Date
    horaEvento?: string
    categoria: string
}

const categorias = ["Personal", "Trabajo", "Salud", "Familia", "Estudios", "Hogar"]
const prioridades = [
    { valor: "baja", label: "Baja", color: "badge-success" },
    { valor: "media", label: "Media", color: "badge-warning" },
    { valor: "alta", label: "Alta", color: "badge-error" },
]

export default function PendientesPage() {
    const [pendientes, setPendientes] = useState<Pendiente[]>([
        {
            id: "1",
            titulo: "Reunión con el equipo",
            descripcion: "Revisar el progreso del proyecto y planificar las siguientes tareas",
            tipo: "evento",
            prioridad: "alta",
            estado: "pendiente",
            fechaCreacion: new Date("2024-01-15"),
            fechaVencimiento: new Date("2024-01-20"),
            horaEvento: "10:00",
            categoria: "Trabajo",
        },
        {
            id: "2",
            titulo: "Comprar medicamentos",
            descripcion: "Ir a la farmacia por los medicamentos recetados por el doctor",
            tipo: "tarea",
            prioridad: "media",
            estado: "pendiente",
            fechaCreacion: new Date("2024-01-14"),
            fechaVencimiento: new Date("2024-01-18"),
            categoria: "Salud",
        },
        {
            id: "3",
            titulo: "Llamar a mamá",
            descripcion: "Recordar llamar para saber cómo está y planificar la visita del fin de semana",
            tipo: "tarea",
            prioridad: "baja",
            estado: "completado",
            fechaCreacion: new Date("2024-01-13"),
            categoria: "Familia",
        },
    ])

    const [modalCrear, setModalCrear] = useState(false)
    const [modalVer, setModalVer] = useState(false)
    const [pendienteSeleccionado, setPendienteSeleccionado] = useState<Pendiente | null>(null)
    const [modoEdicion, setModoEdicion] = useState(false)

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

        const pendienteData = {
            ...formulario,
            fechaVencimiento: formulario.fechaVencimiento ? new Date(formulario.fechaVencimiento) : undefined,
        }

        if (modoEdicion && pendienteSeleccionado) {
            setPendientes((prev) =>
                prev.map((pendiente) =>
                    pendiente.id === pendienteSeleccionado.id ? { ...pendiente, ...pendienteData } : pendiente,
                ),
            )
        } else {
            const nuevoPendiente: Pendiente = {
                id: Date.now().toString(),
                ...pendienteData,
                estado: "pendiente",
                fechaCreacion: new Date(),
            }
            setPendientes((prev) => [nuevoPendiente, ...prev])
        }

        cerrarModalCrear()
    }

    const toggleEstado = (id: string) => {
        setPendientes((prev) =>
            prev.map((pendiente) =>
                pendiente.id === id
                    ? { ...pendiente, estado: pendiente.estado === "pendiente" ? "completado" : "pendiente" }
                    : pendiente,
            ),
        )
    }

    const eliminarPendiente = (id: string) => {
        setPendientes((prev) => prev.filter((pendiente) => pendiente.id !== id))
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

    return (
        <div className="grid grid-cols-[300px_1fr] min-h-screen">
            <SideMenu />

            <div className="p-10 bg-base-50">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-primary-content/60">Pendientes</h1>
                            <p className="text-base-content/70">Organiza tus tareas y eventos</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary" onClick={abrirModalCrear}>
                                <Plus className="w-4 h-4" />
                                Nuevo Pendiente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Pendientes */}
                <div className="space-y-4">
                    {pendientes.map((pendiente) => (
                        <div
                            key={pendiente.id}
                            className={`card bg-base-100 shadow-sm border hover:shadow-md transition-all duration-200 ${pendiente.estado === "completado" ? "opacity-60" : ""
                                } ${estaVencido(pendiente.fechaVencimiento) ? "border-error" : ""}`}
                        >
                            <div className="p-4 card-body">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <button className="mt-1" onClick={() => toggleEstado(pendiente.id)}>
                                        {pendiente.estado === "completado" ? (
                                            <CheckCircle className="w-5 h-5 text-success" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-base-content/40 hover:text-primary" />
                                        )}
                                    </button>

                                    {/* Contenido */}
                                    <div className="flex-1" onClick={() => abrirModalVer(pendiente)}>
                                        <div className="flex items-start justify-between mb-2" >
                                            <h3 className={`font-semibold ${pendiente.estado === "completado" ? "line-through text-base-content/60" : ""}`}>
                                                {pendiente.titulo}
                                            </h3>
                                        </div>

                                        <p className="mb-3 text-sm text-base-content/70 line-clamp-2" >{pendiente.descripcion}</p>

                                        <div className="flex items-center gap-3 text-xs">
                                            <div className={`badge ${pendiente.tipo === "evento" ? "badge-info" : "badge-ghost"}`}>
                                                {pendiente.tipo === "evento" ? "Evento" : "Tarea"}
                                            </div>
                                            <div className={`badge ${getPrioridadColor(pendiente.prioridad)}`}>
                                                {prioridades.find((p) => p.valor === pendiente.prioridad)?.label}
                                            </div>
                                            <div className="badge badge-outline">{pendiente.categoria}</div>
                                            {pendiente.fechaVencimiento && (
                                                <div
                                                    className={`flex items-center gap-1 ${estaVencido(pendiente.fechaVencimiento)
                                                        ? "text-error"
                                                        : esHoy(pendiente.fechaVencimiento)
                                                            ? "text-warning"
                                                            : "text-base-content/60"
                                                        }`}
                                                >
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{pendiente.fechaVencimiento.toLocaleDateString()}</span>
                                                    {pendiente.horaEvento && (
                                                        <>
                                                            <Clock className="w-3 h-3 ml-1" />
                                                            <span>{pendiente.horaEvento}</span>
                                                        </>
                                                    )}
                                                    {estaVencido(pendiente.fechaVencimiento) && <AlertCircle className="w-3 h-3 ml-1" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                            <EllipsisVertical />
                                        </div>
                                        <ul tabIndex={0} className="w-40 p-2 shadow dropdown-content menu bg-base-100 rounded-box">
                                            <li>
                                                <a onClick={() => abrirModalEditar(pendiente)}>
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={() => eliminarPendiente(pendiente.id)} className="text-error">
                                                    <Trash2 className="w-4 h-4" />
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
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">📋</div>
                        <h3 className="mb-2 text-xl font-semibold">No hay tareas</h3>
                        <p className="mb-4 text-base-content/70">
                            Comienza creando tu primer tarea.
                        </p>
                        <button className="btn btn-primary" onClick={abrirModalCrear}>
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

                        <div className="grid items-center gap-2 md:grid-flow-col grid-cols-2 md:grid-rows-3 gap-x-8">
                            <div className="grid col-span-3 grid-cols-2 gap-4">
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
                                        className="textarea"
                                        placeholder="Describe los detalles..."
                                        value={formulario.descripcion}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, descripcion: e.target.value }))}
                                    >
                                    </textarea>
                                </fieldset>
                            </div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Tipo: </legend>
                                <select className="select"
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
                                <select className="select"
                                    value={formulario.prioridad}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, prioridad: e.target.value as "baja" | "media" | "alta" }))}
                                >
                                    <option disabled={true}>Tipo</option>
                                    {prioridades.map((p) => (
                                        <option key={p.valor} value={p.valor}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Categoría: </legend>
                                <select className="select"
                                    value={formulario.categoria}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, categoria: e.target.value }))}
                                >
                                    <option disabled={true}>Tipo</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Fecha límite: </legend>
                                <input className="select"
                                    type="date"
                                    value={formulario.fechaVencimiento}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, fechaVencimiento: e.target.value }))}
                                >

                                </input>
                            </fieldset>

                            {formulario.tipo === "evento" && (
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Hora del evento: </legend>
                                    <input className="select"
                                        type="date"
                                        value={formulario.horaEvento}
                                        onChange={(e) => setFormulario((prev) => ({ ...prev, horaEvento: e.target.value }))}
                                    >

                                    </input>
                                </fieldset>
                            )}
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={cerrarModalCrear}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={guardarPendiente} disabled={!formulario.titulo.trim()}>
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
                                    <div className="flex items-center gap-3">
                                        <div className={`badge ${pendienteSeleccionado.tipo === "evento" ? "badge-info" : "badge-ghost"}`}>
                                            {pendienteSeleccionado.tipo === "evento" ? "Evento" : "Pendiente"}
                                        </div>
                                        <div className={`badge ${getPrioridadColor(pendienteSeleccionado.prioridad)}`}>
                                            {prioridades.find((p) => p.valor === pendienteSeleccionado.prioridad)?.label}
                                        </div>
                                        <div className="badge badge-outline">{pendienteSeleccionado.categoria}</div>
                                        <div
                                            className={`badge ${pendienteSeleccionado.estado === "completado" ? "badge-success" : "badge-warning"}`}
                                        >
                                            {pendienteSeleccionado.estado === "completado" ? "Completado" : "Pendiente"}
                                        </div>
                                    </div>

                                    {pendienteSeleccionado.descripcion && (
                                        <div>
                                            <h4 className="mb-2 font-semibold">Descripción:</h4>
                                            <p className="whitespace-pre-wrap text-base-content/80">{pendienteSeleccionado.descripcion}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                                    <button className="btn btn-ghost" onClick={cerrarModalVer}>
                                        Cerrar
                                    </button>
                                    <button
                                        className="btn btn-primary"
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
            </div>
        </div>
    )
}
