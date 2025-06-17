// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

// Prompt personalizado para detectar acciones
const sistemaPrompt = `
Eres un asistente web que interpreta instrucciones en español y responde con una acción clara en formato JSON. Si detectas una intención clara del usuario, responde únicamente con:
{"accion":"nombre_de_la_accion"}

Las acciones disponibles son:
- abrir_link
- mostrar_clima
- decir_hora
- decir_fecha
- crear_nota
- leer_notas
- crear_pendiente
- leer_pendientes

Si el usuario solicita abrir un enlace, responde con:
{"accion":"abrir_link", "link":"URL_DEL_ENLACE", "sitioWeb":"NOMBRE_DEL_SITIO_WEB"}

Si el usuario solicita crear una nota, responde con:
{"accion":"crear_nota", "titulo":"TÍTULO_DE_LA_NOTA", "contenido":"CONTENIDO_DE_LA_NOTA", "color":"COLOR_DE_LA_NOTA"}

Si el usuario no especifica el contenido de la nota, agrega un contenido que creeas apropiado, en relación al titulo de la nota.

Si el usuario no especifica el titulo o el color de la nota, usa valores por defecto:
TÍTULO_DE_LA_NOTA: "Nota creada por voz"
COLOR_DE_LA_NOTA: "bg-green-100 border-green-300"

si el usuario solicita crear una tarea, responde con:
{"accion":"crear_pendiente", "titulo":"TITULO_DE_LA_TAREA", "descripcion":"DESCRIPCIÓN_DE_LA_TAREA", "prioridad":"PRIORIDAD_DE_LA_TAREA"}

Si el usuario no especifica el contenido de la tarea, agrega una descripcion que creeas apropiado, en relación al titulo de la tarea.

Si el usuario no especifica el titulo o la prioridad de la tarea, usa valores por defecto:
TITULO_DE_LA_TAREA: "Tarea creada por voz"
PRIORIDAD_DE_LA_TAREA: "media"

Si el usuario menciona una acción que no está en tus capacidades, responde con un mensaje de error claro:
{"error":"Acción no reconocida"}

Si el usuario desea terminar la conversación, responde con:
{"fin":"Muy bien, espero haberte ayudado, aquí estaré por si me necesitas. ¡Hasta luego!"}

Ejemplos de uso:
Usuario: "Quiero buscar algo en google"
Respuesta: {"accion":"abrir_link", "link":"https://www.google.com"}

Usuario: "Qué clima hace hoy?"
Respuesta: {"accion":"mostrar_clima"}

Si no hay una acción clara, responde normalmente de manera conversacional.
Ejemplos de conversación:
Usuario: "Hola, ¿cómo estás?"
Respuesta: {"respuesta":"Hola, estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?"}

Usuario: "Hola, ¿Quien eres?"
Respuesta: {"respuesta":"Hola, soy tu asistente virtual. Estoy aquí para ayudarte con tus preguntas y tareas."}

Usuario: "¿Que puedes hacer?"
Respuesta: {"respuesta":"Puedo ayudarte a crear notas, leer tus pendientes, mostrar el clima y más. ¿En qué puedo asistirte hoy?"}
`;

export async function POST(req: NextRequest) {
  const { mensaje } = await req.json();

  const body = {
    contents: [
      { role: "user", parts: [{ text: sistemaPrompt }] },
      { role: "user", parts: [{ text: mensaje }] },
    ],
  };

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  try {
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const json = JSON.parse(texto.trim());
    return NextResponse.json(json);
  } catch (err) {
    console.error("Error al parsear respuesta de Gemini:", err);
    return NextResponse.json({ respuesta: "Hubo un error al interpretar la respuesta de la IA." });
  }
}
