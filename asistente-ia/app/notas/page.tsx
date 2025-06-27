"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Edit, Trash2, Calendar, Tag, X, EllipsisVertical, Menu } from "lucide-react"
import { SideMenu } from "@/components/SideMenu"
import { notasStorage, usuarioStorage, inicializarDatosEjemplo, type Nota } from "@/lib/storage"

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
    const [notas, setNotas] = useState<Nota[]>([])
    const [modalCrear, setModalCrear] = useState(false)
    const [modalVer, setModalVer] = useState(false)
    const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [sideMenuOpen, setSideMenuOpen] = useState(false)

    const [formulario, setFormulario] = useState({
        titulo: "",
        contenido: "",
        categoria: "Personal",
        color: coloresDisponibles[0],
    })

    const modalCrearRef = useRef<HTMLDialogElement>(null)
    const modalVerRef = useRef<HTMLDialogElement>(null)

    // Cargar datos al montar el componente
    useEffect(() => {
        inicializarDatosEjemplo()
        cargarNotas()
    }, [])

    const cargarNotas = () => {
        setCargando(true)
        const usuarioActual = usuarioStorage.obtenerActual()
        if (usuarioActual) {
            const notasUsuario = notasStorage.obtenerTodas(usuarioActual.id)
            setNotas(notasUsuario)
        }
        setCargando(false)
    }

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

        const usuarioActual = usuarioStorage.obtenerActual()
        if (!usuarioActual) return

        try {
            if (modoEdicion && notaSeleccionada) {
                // Actualizar nota existente
                const notaActualizada = notasStorage.actualizar(notaSeleccionada.id, formulario)
                if (notaActualizada) {
                    setNotas((prev) => prev.map((nota) => (nota.id === notaSeleccionada.id ? notaActualizada : nota)))
                }
            } else {
                // Crear nueva nota
                const nuevaNota = notasStorage.crear({
                    ...formulario,
                    usuarioId: usuarioActual.id,
                })
                setNotas((prev) => [nuevaNota, ...prev])
            }

            cerrarModalCrear()
        } catch (error) {
            console.error("Error al guardar nota:", error)
        }
    }

    const eliminarNota = (id: string) => {
        try {
            const eliminada = notasStorage.eliminar(id)
            if (eliminada) {
                setNotas((prev) => prev.filter((nota) => nota.id !== id))
            }
        } catch (error) {
            console.error("Error al eliminar nota:", error)
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
                            <h1 className="text-2xl font-bold text-primary-content/60 sm:text-3xl">Mis Notas</h1>
                            <p className="text-sm text-base-content/70 sm:text-base">Organiza tus ideas y pensamientos</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary btn-sm sm:btn-md" onClick={abrirModalCrear}>
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nueva Nota</span>
                                <span className="sm:hidden">Nueva</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid de Notas */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {notas.map((nota) => (
                        <div
                            key={nota.id}
                            className={`card ${nota.color} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                        >
                            <div className="p-3 card-body sm:p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-sm font-semibold card-title line-clamp-2">{nota.titulo}</h3>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                            <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                        <ul tabIndex={0} className="w-32 p-2 shadow dropdown-content menu bg-base-100 rounded-box sm:w-40">
                                            <li>
                                                <a onClick={() => abrirModalEditar(nota)} className="text-xs sm:text-sm">
                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Editar
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={() => eliminarNota(nota.id)} className="text-xs text-error sm:text-sm">
                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Eliminar
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <p
                                    className="mb-3 text-xs text-base-content/80 line-clamp-3 sm:text-sm"
                                    onClick={() => abrirModalVer(nota)}
                                >
                                    {nota.contenido}
                                </p>

                                <div className="flex items-center justify-between text-xs text-base-content/60">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-2 h-2 sm:w-3 sm:h-3" />
                                        <span className="text-xs">{nota.categoria}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                                        <span className="text-xs">{nota.fechaCreacion.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {notas.length === 0 && (
                    <div className="py-8 text-center sm:py-12">
                        <div className="mb-4 text-4xl sm:text-6xl">📝</div>
                        <h3 className="mb-2 text-lg font-semibold sm:text-xl">No hay notas</h3>
                        <p className="mb-4 text-sm text-base-content/70 sm:text-base">Comienza creando tu primera nota</p>
                        <button className="btn btn-primary btn-sm sm:btn-md" onClick={abrirModalCrear}>
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

                        <div className="grid gap-4">
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
                                    className="textarea min-h-24"
                                    placeholder="Escribe el contenido de tu nota..."
                                    value={formulario.contenido}
                                    onChange={(e) => setFormulario((prev) => ({ ...prev, contenido: e.target.value }))}
                                ></textarea>
                            </fieldset>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Categoria: </legend>
                                    <select
                                        className="select"
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
                                                className={`w-6 h-6 rounded-full border-2 sm:w-8 sm:h-8 ${color} ${formulario.color === color ? "ring-2 ring-primary-content/70" : ""}`}
                                                onClick={() => setFormulario((prev) => ({ ...prev, color }))}
                                            />
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm sm:btn-md" onClick={cerrarModalCrear}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary btn-sm sm:btn-md"
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
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/70 sm:gap-4 sm:text-sm">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>{notaSeleccionada.categoria}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>Creada: {notaSeleccionada.fechaCreacion.toLocaleDateString()}</span>
                                        </div>
                                        {notaSeleccionada.fechaModificacion.getTime() !== notaSeleccionada.fechaCreacion.getTime() && (
                                            <div className="flex items-center gap-1">
                                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span>Modificada: {notaSeleccionada.fechaModificacion.toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="prose max-w-none">
                                        <p className="text-sm whitespace-pre-wrap sm:text-base">{notaSeleccionada.contenido}</p>
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
                {modalCrear && modalVer}

            </div>
        </div>
    )
}
