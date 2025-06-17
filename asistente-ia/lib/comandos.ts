import { notasStorage, pendientesStorage, usuarioStorage } from "./storage"

export async function detectarYEjecutarAccion(texto: string): Promise<string> {
  const lower = texto.toLowerCase();

  if (lower.includes("abrir_youtube")) {
    window.open("https://youtube.com", "_blank");
    return "Abriendo YouTube para ti.";
  }

  if (lower.includes("mostrar_clima")) {
    try {
      const clima = await fetch('http://api.weatherapi.com/v1/current.json?key=72c98c7a147a4904961110427251706&q=Huajuapan&aqi=no')
        .then(response => response.json())
        .then(data => {
          return `El clima en ${data.location.name} es de ${data.current.temp_c - 10} grados Celsius pero con una sensacion de ${data.current.feelslike_c - 10}, con una humedad del ${data.current.humidity - 10} porciento.`;
        });
      return clima;
    } catch (error) {
      console.error("Error al obtener el clima:", error);
      return "No pude obtener el clima en este momento.";
    }
  }

  if (lower.includes("decir_hora")) {
    const ahora = new Date();
    return `Son las ${ahora.getHours()} con ${ahora.getMinutes()}.`;
  }

  if (lower.includes("decir_fecha")) {
    const ahora = new Date();
    return `Hoy es ${ahora.getDate()} de ${ahora.getMonth() + 1} del ${ahora.getFullYear()}.`;
  }

  if (lower.includes("crear_nota")) {
    const usuarioActual = usuarioStorage.obtenerActual()
    if (!usuarioActual) {
      return "No hay usuario activo para crear la nota."
    }

    try {
      // Extraer título y contenido del texto (simplificado)
      const titulo = "Nota creada por voz"
      const contenido = texto.replace(/crear.nota/gi, "").trim() || "Nota creada mediante comando de voz"

      const nuevaNota = notasStorage.crear({
        titulo,
        contenido,
        categoria: "Personal",
        color: "bg-yellow-100 border-yellow-300",
        usuarioId: usuarioActual.id,
      })

      return `He creado una nueva nota titulada "${nuevaNota.titulo}".`
    } catch (error) {
      console.error("Error al crear nota:", error)
      return "Hubo un error al crear la nota."
    }
  }

  if (lower.includes("crear_pendiente")) {
    const usuarioActual = usuarioStorage.obtenerActual()
    if (!usuarioActual) {
      return "No hay usuario activo para crear el pendiente."
    }

    try {
      // Extraer título del texto (simplificado)
      const titulo = "Tarea creada por voz"
      const descripcion = texto.replace(/crear.pendiente/gi, "").trim() || "Tarea creada mediante comando de voz"

      const nuevoPendiente = pendientesStorage.crear({
        titulo,
        descripcion,
        tipo: "tarea",
        prioridad: "media",
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

  return texto; // Si no hay acción, devuelve el texto para hablarlo
}
