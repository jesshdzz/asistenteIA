// Simulación de base de datos usando localStorage

export interface Usuario {
    id: string
    nombre: string
    email: string
    contraseña?: string // Opcional, si se usa autenticación
    fechaRegistro: Date
}

export interface Nota {
    id: string
    titulo: string
    contenido: string
    categoria: string
    fechaCreacion: Date
    fechaModificacion: Date
    color: string
    usuarioId: string
}

export interface Pendiente {
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
    usuarioId: string
}

// Generador de IDs únicos
let contadorId = 0
const generarIdUnico = (): string => {
    contadorId++
    return `${Date.now()}_${contadorId}_${Math.random().toString(36).substr(2, 9)}`
}

// Claves para localStorage
const STORAGE_KEYS = {
    USUARIOS: "asistente_usuarios",
    NOTAS: "asistente_notas",
    PENDIENTES: "asistente_pendientes",
    USUARIO_ACTUAL: "asistente_usuario_actual",
}

// Funciones de utilidad para localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue

    try {
        const item = localStorage.getItem(key)
        if (!item) return defaultValue

        const parsed = JSON.parse(item)
        // Convertir fechas de string a Date
        if (Array.isArray(parsed)) {
            return parsed.map(item => ({
                ...item,
                fechaCreacion: item.fechaCreacion ? new Date(item.fechaCreacion) : undefined,
                fechaModificacion: item.fechaModificacion ? new Date(item.fechaModificacion) : undefined,
                fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : undefined,
                fechaRegistro: item.fechaRegistro ? new Date(item.fechaRegistro) : undefined
            })) as T
        }

        return {
            ...parsed,
            fechaCreacion: parsed.fechaCreacion ? new Date(parsed.fechaCreacion) : undefined,
            fechaModificacion: parsed.fechaModificacion ? new Date(parsed.fechaModificacion) : undefined,
            fechaVencimiento: parsed.fechaVencimiento ? new Date(parsed.fechaVencimiento) : undefined,
            fechaRegistro: parsed.fechaRegistro ? new Date(parsed.fechaRegistro) : undefined
        } as T
    } catch (error) {
        console.error(`Error al leer ${key} del localStorage:`, error)
        return defaultValue
    }
}

const saveToStorage = <T>(key: string, data: T): void => {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error)
    }
}

// Funciones para manejar usuarios
export const usuarioStorage = {
    obtenerTodos: (): Usuario[] => {
        return getFromStorage<Usuario[]>(STORAGE_KEYS.USUARIOS, [])
    },

    obtenerPorId: (id: string): Usuario | null => {
        const usuarios = usuarioStorage.obtenerTodos()
        return usuarios.find(u => u.id === id) || null
    },

    crear: (usuario: Omit<Usuario, 'id' | 'fechaRegistro'>): Usuario => {
        const usuarios = usuarioStorage.obtenerTodos()
        const nuevoUsuario: Usuario = {
            ...usuario,
            id: generarIdUnico(),
            fechaRegistro: new Date()
        }

        usuarios.push(nuevoUsuario)
        saveToStorage(STORAGE_KEYS.USUARIOS, usuarios)
        return nuevoUsuario
    },

    actualizar: (id: string, datos: Partial<Usuario>): Usuario | null => {
        const usuarios = usuarioStorage.obtenerTodos()
        const index = usuarios.findIndex(u => u.id === id)

        if (index === -1) return null

        usuarios[index] = { ...usuarios[index], ...datos }
        saveToStorage(STORAGE_KEYS.USUARIOS, usuarios)
        return usuarios[index]
    },

    eliminar: (id: string): boolean => {
        const usuarios = usuarioStorage.obtenerTodos()
        const nuevosUsuarios = usuarios.filter(u => u.id !== id)

        if (nuevosUsuarios.length === usuarios.length) return false

        saveToStorage(STORAGE_KEYS.USUARIOS, nuevosUsuarios)
        return true
    },

    obtenerActual: (): Usuario | null => {
        return getFromStorage<Usuario | null>(STORAGE_KEYS.USUARIO_ACTUAL, null)
    },

    establecerActual: (usuario: Usuario): void => {
        saveToStorage(STORAGE_KEYS.USUARIO_ACTUAL, usuario)
    }
}

// Funciones para manejar notas
export const notasStorage = {
    obtenerTodas: (usuarioId?: string): Nota[] => {
        const notas = getFromStorage<Nota[]>(STORAGE_KEYS.NOTAS, [])
        return usuarioId ? notas.filter(n => n.usuarioId === usuarioId) : notas
    },

    obtenerPorId: (id: string): Nota | null => {
        const notas = notasStorage.obtenerTodas()
        return notas.find(n => n.id === id) || null
    },

    crear: (nota: Omit<Nota, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Nota => {
        const notas = notasStorage.obtenerTodas()
        const nuevaNota: Nota = {
            ...nota,
            id: generarIdUnico(),
            fechaCreacion: new Date(),
            fechaModificacion: new Date()
        }

        notas.push(nuevaNota)
        saveToStorage(STORAGE_KEYS.NOTAS, notas)
        return nuevaNota
    },

    actualizar: (id: string, datos: Partial<Nota>): Nota | null => {
        const notas = notasStorage.obtenerTodas()
        const index = notas.findIndex(n => n.id === id)

        if (index === -1) return null

        notas[index] = {
            ...notas[index],
            ...datos,
            fechaModificacion: new Date()
        }
        saveToStorage(STORAGE_KEYS.NOTAS, notas)
        return notas[index]
    },

    eliminar: (id: string): boolean => {
        const notas = notasStorage.obtenerTodas()
        const nuevasNotas = notas.filter(n => n.id !== id)

        if (nuevasNotas.length === notas.length) return false

        saveToStorage(STORAGE_KEYS.NOTAS, nuevasNotas)
        return true
    }
}

// Funciones para manejar pendientes
export const pendientesStorage = {
    obtenerTodos: (usuarioId?: string): Pendiente[] => {
        const pendientes = getFromStorage<Pendiente[]>(STORAGE_KEYS.PENDIENTES, [])
        return usuarioId ? pendientes.filter(p => p.usuarioId === usuarioId) : pendientes
    },

    obtenerPorId: (id: string): Pendiente | null => {
        const pendientes = pendientesStorage.obtenerTodos()
        return pendientes.find(p => p.id === id) || null
    },

    crear: (pendiente: Omit<Pendiente, 'id' | 'fechaCreacion'>): Pendiente => {
        const pendientes = pendientesStorage.obtenerTodos()
        const nuevoPendiente: Pendiente = {
            ...pendiente,
            id: generarIdUnico(),
            fechaCreacion: new Date()
        }

        pendientes.push(nuevoPendiente)
        saveToStorage(STORAGE_KEYS.PENDIENTES, pendientes)
        return nuevoPendiente
    },

    actualizar: (id: string, datos: Partial<Pendiente>): Pendiente | null => {
        const pendientes = pendientesStorage.obtenerTodos()
        const index = pendientes.findIndex(p => p.id === id)

        if (index === -1) return null

        pendientes[index] = { ...pendientes[index], ...datos }
        saveToStorage(STORAGE_KEYS.PENDIENTES, pendientes)
        return pendientes[index]
    },

    eliminar: (id: string): boolean => {
        const pendientes = pendientesStorage.obtenerTodos()
        const nuevosPendientes = pendientes.filter(p => p.id !== id)

        if (nuevosPendientes.length === pendientes.length) return false

        saveToStorage(STORAGE_KEYS.PENDIENTES, nuevosPendientes)
        return true
    }
}

// Función para inicializar datos de ejemplo
export const inicializarDatosEjemplo = (): void => {
    // Crear usuario de ejemplo si no existe
    const usuarios = usuarioStorage.obtenerTodos()
    if (usuarios.length === 0) {
        const usuarioEjemplo = usuarioStorage.crear({
            nombre: "Jesus Hernandez",
            email: "jesus@ejemplo.com",
            contraseña: "jesus123", // Contraseña de ejemplo
        })
        usuarioStorage.establecerActual(usuarioEjemplo)

        // Crear notas de ejemplo
        notasStorage.crear({
            titulo: "Ideas para el proyecto",
            contenido: "Implementar sistema de notificaciones push, mejorar la UI del dashboard, agregar modo oscuro automático basado en la hora del día.",
            categoria: "Trabajo",
            color: "bg-blue-100 border-blue-300",
            usuarioId: usuarioEjemplo.id
        })

        notasStorage.crear({
            titulo: "Lista de compras",
            contenido: "Leche, pan, huevos, frutas, verduras para la semana. No olvidar el detergente y papel higiénico.",
            categoria: "Personal",
            color: "bg-yellow-100 border-yellow-300",
            usuarioId: usuarioEjemplo.id
        })

        // Crear pendientes de ejemplo
        pendientesStorage.crear({
            titulo: "Reunión con el equipo",
            descripcion: "Revisar el progreso del proyecto y planificar las siguientes tareas",
            tipo: "evento",
            prioridad: "alta",
            estado: "pendiente",
            fechaVencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
            horaEvento: "10:00",
            categoria: "Trabajo",
            usuarioId: usuarioEjemplo.id
        })

        pendientesStorage.crear({
            titulo: "Comprar medicamentos",
            descripcion: "Ir a la farmacia por los medicamentos recetados por el doctor",
            tipo: "tarea",
            prioridad: "media",
            estado: "pendiente",
            fechaVencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
            categoria: "Salud",
            usuarioId: usuarioEjemplo.id
        })
    }
}
