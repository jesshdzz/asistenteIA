import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { texto } = await req.json();

  const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texto,
      model: "aura-asteria",
      voice: "aura-asteria", // Puedes probar con otras como "aura-echo", "aura-stella", etc.
    }),
  });

  const audio = await response.arrayBuffer();

  return new NextResponse(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
