import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mensaje } = await req.json();

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: mensaje }] }],
    }),
  });

  const data = await res.json();
  const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || "No entendí eso.";
  return NextResponse.json({ respuesta });
}