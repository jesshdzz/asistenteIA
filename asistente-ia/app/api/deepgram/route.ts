import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get("audio") as Blob;
  const buffer = Buffer.from(await audio.arrayBuffer());

  const response = await fetch("https://api.deepgram.com/v1/listen?language=es-419&model=nova-2", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "aplication/json",
    },
    body: buffer,
  });

  const json = await response.json();
  const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  return NextResponse.json({ transcripcion: transcript });
}