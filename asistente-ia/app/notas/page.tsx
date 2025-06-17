"use client"

import { useState, useRef } from "react"
import { Plus, Edit, Trash2, Calendar, Tag, X, EllipsisVertical } from "lucide-react"
import { SideMenu } from "@/components/SideMenu"

interface Nota {
    id: string
    titulo: string
    contenido: string
    categoria: string
    fechaCreacion: Date
    fechaModificacion: Date
    color: string
}

const coloresDisponibles = [
    "bg-yellow-100 border-yellow-300",
    "bg-blue-100 border-blue-300",
    "bg-green-100 border-green-300",
    "bg-pink-100 border-pink-300",
    "bg-purple-100 border-purple-300",
    "bg-orange-100 border-orange-300",
]

const categorias = ["Personal", "Trabajo", "Ideas", "Recordatorios", "Proyectos"]

export default function NotasPage() {
    const [notas, setNotas] = useState<Nota[]>([
        {
            id: "1",
            titulo: "Ideas para el proyecto",
            contenido:
                "Implementar sistema de notificaciones push, mejorar la UI del dashboard, agregar modo oscuro automático basado en la hora del día.",
            categoria: "Trabajo",
            fechaCreacion: new Date("2024-01-15"),
            fechaModificacion: new Date("2024-01-15"),
            color: coloresDisponibles[1],
        },
        {
            id: "2",
            titulo: "Lista de compras",
            contenido: "Leche, pan, huevos, frutas, verduras para la semana. No olvidar el detergente y papel higiénico.",
            categoria: "Personal",
            fechaCreacion: new Date("2024-01-14"),
            fechaModificacion: new Date("2024-01-14"),
            color: coloresDisponibles[0],
        },
    ])

    const [modalCrear, setModalCrear] = useState(false)
    const [modalVer, setModalVer] = useState(false)
    const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null)
    const [modoEdicion, setModoEdicion] = useState(false)

    const [formulario, setFormulario] = useState({
        titulo: "",
        contenido: "",
        categoria: "Personal",
        color: coloresDisponibles[0],
    })

    const modalCrearRef = useRef<HTMLDialogElement>(null)
    const modalVerRef = useRef<HTMLDialogElement>(null)

    const abrirModalCrear = () => {
        setFormulario({
            titulo: "",
            contenido: "",
            categoria: "Personal",
            color: coloresDisponibles[0],
        })
        setModoEdicion(false)
        setModalCrear(true)
        modalCrearRef.current?.showModal()
    }

    const abrirModalEditar = (nota: Nota) => {
        setFormulario({
            titulo: nota.titulo,
            contenido: nota.contenido,
            categoria: nota.categoria,
            color: nota.color,
        })
        setNotaSeleccionada(nota)
        setModoEdicion(true)
        setModalCrear(true)
        modalCrearRef.current?.showModal()
    }

    const abrirModalVer = (nota: Nota) => {
        setNotaSeleccionada(nota)
        setModalVer(true)
        modalVerRef.current?.showModal()
    }

    const guardarNota = () => {
        if (!formulario.titulo.trim() || !formulario.contenido.trim()) return

        if (modoEdicion && notaSeleccionada) {
            setNotas((prev) =>
                prev.map((nota) =>
                    nota.id === notaSeleccionada.id ? { ...nota, ...formulario, fechaModificacion: new Date() } : nota,
                ),
            )
        } else {
            const nuevaNota: Nota = {
                id: Date.now().toString(),
                ...formulario,
                fechaCreacion: new Date(),
                fechaModificacion: new Date(),
            }
            setNotas((prev) => [nuevaNota, ...prev])
        }

        cerrarModalCrear()
    }

    const eliminarNota = (id: string) => {
        setNotas((prev) => prev.filter((nota) => nota.id !== id))
    }


    const cerrarModalCrear = () => {
        setModalCrear(false)
        modalCrearRef.current?.close()
    }

    const cerrarModalVer = () => {
        setModalVer(false)
        modalVerRef.current?.close()
    }

    return (
        <div className="grid grid-cols-[300px_1fr] min-h-screen">
            <SideMenu />

            <div className="p-10 bg-base-50">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-primary-content/60">Mis Notas</h1>
                            <p className="text-base-content/70">Organiza tus ideas y pensamientos</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary" onClick={abrirModalCrear}>
                                <Plus className="w-4 h-4" />
                                Nueva Nota
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid de Notas */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {notas.map((nota) => (
                        <div key={nota.id} className={`card ${nota.color} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
                            <div className="p-4 card-body">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-sm font-semibold card-title line-clamp-2">{nota.titulo}</h3>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                            <EllipsisVertical />
                                        </div>
                                        <ul tabIndex={0} className="w-40 p-2 shadow dropdown-content menu bg-base-100 rounded-box">
                                            <li>
                                                <a onClick={() => abrirModalEditar(nota)}>
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={() => eliminarNota(nota.id)} className="text-error">
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <p className="mb-3 text-sm text-base-content/80 line-clamp-3" onClick={() => abrirModalVer(nota)}>{nota.contenido}</p>

                                <div className="flex items-center justify-between text-xs text-base-content/60">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        <span>{nota.categoria}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{nota.fechaCreacion.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {notas.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">📝</div>
                        <h3 className="mb-2 text-xl font-semibold">No hay notas</h3>
                        <p className="mb-4 text-base-content/70">
                            Comienza creando tu primera nota
                        </p>
                        <button className="btn btn-primary" onClick={abrirModalCrear}>
                            <Plus className="w-4 h-4" />
                            Crear Primera Nota
                        </button>
                    </div>
                )}

                {/* Modal Crear/Editar */}
                <dialog ref={modalCrearRef} className="modal">
                    <div className="w-11/12 max-w-2xl modal-box">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">{modoEdicion ? "Editar Nota" : "Nueva Nota"}</h3>
                            <button className="btn btn-sm btn-circle btn-ghost" onClick={cerrarModalCrear}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid items-center gap-2 md:grid-flow-col md:grid-rows-2 gap-x-8">
                            <fieldset className="w-full fieldset">
                                <legend className="fieldset-legend">Titulo: </legend>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Escribe el título de tu nota..."
                                    value={formulario.titulo}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, titulo: e.target.value }))}
                                />
                            </fieldset>

                            <fieldset className="w-full fieldset">
                                <legend className="fieldset-legend">Contenido: </legend>
                                <textarea
                                    className="textarea"
                                    placeholder="Escribe el contenido de tu nota..."
                                    value={formulario.contenido}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, contenido: e.target.value }))}
                                >
                                </textarea>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Categoria: </legend>
                                <select className="select"
                                    value={formulario.categoria}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, categoria: e.target.value }))}
                                >
                                    <option disabled={true}>Categoria</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Color: </legend>
                                <div className="flex items-center gap-2">
                                    {coloresDisponibles.map((color, index) => (
                                        <button
                                            key={index}
                                            className={`w-8 h-8 rounded-full border-2 ${color} ${formulario.color === color ? "ring-2 ring-primary-content/70" : ""}`}
                                            onClick={() => setFormulario((prev) => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </fieldset>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={cerrarModalCrear}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={guardarNota}
                                disabled={!formulario.titulo.trim() || !formulario.contenido.trim()}
                            >
                                {modoEdicion ? "Actualizar" : "Crear"} Nota
                            </button>
                        </div>
                    </div>
                </dialog>

                {/* Modal Ver Nota */}
                <dialog ref={modalVerRef} className="modal">
                    <div className="w-11/12 max-w-2xl modal-box">
                        {notaSeleccionada && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">{notaSeleccionada.titulo}</h3>
                                    <button className="btn btn-sm btn-circle btn-ghost" onClick={cerrarModalVer}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-base-content/70">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            <span>{notaSeleccionada.categoria}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Creada: {notaSeleccionada.fechaCreacion.toLocaleDateString()}</span>
                                        </div>
                                        {notaSeleccionada.fechaModificacion.getTime() !== notaSeleccionada.fechaCreacion.getTime() && (
                                            <div className="flex items-center gap-1">
                                                <Edit className="w-4 h-4" />
                                                <span>Modificada: {notaSeleccionada.fechaModificacion.toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{notaSeleccionada.contenido}</p>
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
                                            abrirModalEditar(notaSeleccionada)
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
