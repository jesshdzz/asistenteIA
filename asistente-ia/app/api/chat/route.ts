// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

// Prompt personalizado para detectar acciones
const sistemaPrompt = `
Eres un asistente web que interpreta instrucciones en español y responde con una acción clara en formato JSON. Si detectas una intención clara del usuario, responde únicamente con:

{"accion":"nombre_de_la_accion"}

Las acciones disponibles son:
- abrir_youtube
- mostrar_clima
- decir_hora
- decir_fecha
- crear_nota
- crear_pendiente

Si el usuario menciona una acción que no está en la lista, responde con un mensaje de error claro:
{"error":"Acción no reconocida"}

Ejemplos:
Usuario: "Quiero ver unos videos"
Respuesta: {"accion":"abrir_youtube"}

Usuario: "Qué clima hace hoy?"
Respuesta: {"accion":"mostrar_clima"}

Si no hay una acción clara, responde normalmente de manera conversacional.
Ejemplos de conversación:
Usuario: "Hola, ¿cómo estás?"
Respuesta: {"respuesta":"Hola, estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?"}
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
