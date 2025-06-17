import { notasStorage, pendientesStorage, usuarioStorage } from "./storage"

const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

type Peticion = {
  accion: string;
  titulo?: string;
  contenido?: string;
  color?: string;
  descripcion?: string;
  prioridad?: string;
  link?: string;
  sitioWeb?: string;
  respuesta?: string;
  error?: string;
  fin?: string;
}

export async function detectarYEjecutarAccion(peticion: Peticion): Promise<string> {
  if (peticion.fin) {
    return peticion.fin;
    
  }

  if (!peticion.accion) {
    return peticion.respuesta || peticion.error || "No se ha especificado ninguna acción.";
  }

  const lower = peticion.accion.toLowerCase();

  switch (true) {
    case lower.includes("crear_nota") || lower.includes("crear nota"):
      return await crearNota(peticion);
    case lower.includes("leer_notas") || lower.includes("leer notas"):
      return await leerNotas();
    case lower.includes("crear_pendiente") || lower.includes("crear pendiente"):
      return await crearPendiente(peticion);
    case lower.includes("leer_pendientes") || lower.includes("leer pendientes"):
      return await leerPendientes();
    case lower.includes("abrir_link") || lower.includes("abrir youtube"):
      return await abrirLink(peticion.link!, peticion.sitioWeb!);
    case lower.includes("mostrar_clima") || lower.includes("mostrar clima"):
      return await mostrarClima();
    case lower.includes("decir_hora") || lower.includes("decir hora"):
      return await decirHora();
    case lower.includes("decir_fecha") || lower.includes("decir fecha"):
      return await decirFecha();
    default:
      return peticion.respuesta || "No he entendido la acción. Por favor, intenta de nuevo con una acción más clara.";
  }
}

async function crearNota(peticion: Peticion): Promise<string> {
  const usuarioActual = usuarioStorage.obtenerActual()
  if (!usuarioActual) {
    return "No hay usuario activo para crear la nota."
  }

  try {
    const nuevaNota = notasStorage.crear({
      titulo: peticion.titulo!,
      contenido: peticion.contenido!,
      categoria: "Personal",
      color: peticion.color!,
      usuarioId: usuarioActual.id,
    })

    return `He creado una nueva nota titulada "${nuevaNota.titulo}".`
  } catch (error) {
    console.error("Error al crear nota:", error)
    return "Hubo un error al crear la nota."
  }

}

async function leerNotas(): Promise<string> {
  const usuarioActual = usuarioStorage.obtenerActual()
  if (!usuarioActual) {
    return "No hay usuario activo para leer las notas."
  }

  try {
    const notas = notasStorage.obtenerTodas(usuarioActual.id)

    if (notas.length === 0) {
      return "No tienes notas guardadas."
    }

    let resumen = `Tienes ${notas.length} nota${notas.length > 1 ? "s" : ""} guardada${notas.length > 1 ? "s" : ""}. `

    // Leer las primeras 3 notas
    const notasALeer = notas.slice(0, 3)
    notasALeer.forEach((nota, index) => {
      resumen += `Nota ${index + 1}: ${nota.titulo}. ${nota.contenido.substring(0, 100)}${nota.contenido.length > 100 ? "..." : ""}. `
    })

    if (notas.length > 3) {
      resumen += `Y tienes ${notas.length - 3} nota${notas.length - 3 > 1 ? "s" : ""} más.`
    }

    return resumen
  } catch (error) {
    console.error("Error al leer notas:", error)
    return "Hubo un error al leer tus notas."
  }
}

async function crearPendiente(peticion: Peticion): Promise<string> {
  const usuarioActual = usuarioStorage.obtenerActual()
  if (!usuarioActual) {
    return "No hay usuario activo para crear el pendiente."
  }

  try {
    const nuevoPendiente = pendientesStorage.crear({
      titulo: peticion.titulo!,
      descripcion: peticion.descripcion!,
      tipo: "tarea",
      prioridad: peticion.prioridad! as "alta" | "media" | "baja",
      estado: "pendiente",
      categoria: "Personal",
      usuarioId: usuarioActual.id,
    })

    return `He creado una nueva tarea titulada "${nuevoPendiente.titulo}".`
  } catch (error) {
    console.error("Error al crear pendiente:", error)
    return "Hubo un error al crear la tarea."
  }
}

async function leerPendientes(): Promise<string> {
  const usuarioActual = usuarioStorage.obtenerActual()
  if (!usuarioActual) {
    return "No hay usuario activo para leer los pendientes."
  }

  try {
    const pendientes = pendientesStorage.obtenerTodos(usuarioActual.id)

    if (pendientes.length === 0) {
      return "No tienes pendientes guardados."
    }

    const pendientesPendientes = pendientes.filter((p) => p.estado === "pendiente")
    const pendientesCompletados = pendientes.filter((p) => p.estado === "completado")

    let resumen = `Tienes ${pendientes.length} pendiente${pendientes.length > 1 ? "s" : ""} en total. `

    if (pendientesPendientes.length > 0) {
      resumen += `${pendientesPendientes.length} pendiente${pendientesPendientes.length > 1 ? "s" : ""} por completar. `

      // Leer los primeros 3 pendientes pendientes
      const pendientesALeer = pendientesPendientes.slice(0, 3)
      pendientesALeer.forEach((pendiente, index) => {
        const prioridadTexto =
          pendiente.prioridad === "alta"
            ? "prioridad alta"
            : pendiente.prioridad === "media"
              ? "prioridad media"
              : "prioridad baja"
        const fechaTexto = pendiente.fechaVencimiento
          ? ` para el ${pendiente.fechaVencimiento.toLocaleDateString()}`
          : ""

        resumen += `${index + 1}. ${pendiente.titulo}, ${prioridadTexto}${fechaTexto}. `
      })

      if (pendientesPendientes.length > 3) {
        resumen += `Y ${pendientesPendientes.length - 3} pendiente${pendientesPendientes.length - 3 > 1 ? "s" : ""} más por completar. `
      }
    }

    if (pendientesCompletados.length > 0) {
      resumen += `También tienes ${pendientesCompletados.length} pendiente${pendientesCompletados.length > 1 ? "s" : ""} completado${pendientesCompletados.length > 1 ? "s" : ""}.`
    }

    return resumen
  } catch (error) {
    console.error("Error al leer pendientes:", error)
    return "Hubo un error al leer tus pendientes."
  }
}

async function abrirLink(link: string, sitioWeb: string): Promise<string> {
  window.open(link, "_blank")
  return `Abriendo ${sitioWeb} para ti.`
}

async function mostrarClima(): Promise<string> {
  try {
    const clima = await fetch(
      "http://api.weatherapi.com/v1/current.json?key=72c98c7a147a4904961110427251706&q=Huajuapan&aqi=no",
    )
      .then((response) => response.json())
      .then((data) => {
        return `Segun weatherAPI, el clima en ${data.location.name} es de ${data.current.temp_c - 10} grados Celsius pero con una sensacion de ${data.current.feelslike_c - 10}, con una humedad del ${data.current.humidity - 10} porciento.`
      })
    return clima
  } catch (error) {
    console.error("Error al obtener el clima:", error)
    return "No pude obtener el clima en este momento."
  }
}

async function decirHora(): Promise<string> {
  const ahora = new Date();
  return `Ahora mismo son las ${ahora.getHours()} con ${ahora.getMinutes()}.`
}

async function decirFecha(): Promise<string> {
  const ahora = new Date();
  const mesTexto = meses[ahora.getMonth()];
  return `Hoy es ${ahora.getDate()} de ${mesTexto} del ${ahora.getFullYear()}.`
}
