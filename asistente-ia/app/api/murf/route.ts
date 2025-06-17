import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (process.env.MURF_API_KEY) {
        headers['api-key'] = process.env.MURF_API_KEY;
    }

    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            text: text,
            voiceId: 'es-MX-valeria',
            style: 'conversational',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const audioData = await response.json();
    return NextResponse.json({ audio: audioData.audioFile }, { status: 200 });
}