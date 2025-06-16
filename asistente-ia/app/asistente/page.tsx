// app/page.tsx
"use client";

import { detectarYEjecutarAccion } from "@/lib/comandos";
import { useState, useRef, useCallback } from "react";

export default function Home() {
    const [transcripcion, setTranscripcion] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [grabando, setGrabando] = useState(false);
    const [estado, setEstado] = useState("esperando");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const detenerRef = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);

    const iniciarGrabacion = useCallback(async () => {
        detenerRef.current = false;
        setEstado("escuchando");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            if (detenerRef.current) return;
            setEstado("procesando");
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("audio", blob);

            try {
                const res = await fetch("/api/deepgram/stt", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                setTranscripcion(data.transcripcion);

                const chatRes = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mensaje: data.transcripcion }),
                });
                const chatData = await chatRes.json();
                // Detectar y ejecutar acción (si hay)
                const textoParaHablar = detectarYEjecutarAccion(chatData.accion || chatData.respuesta);
                setRespuesta(textoParaHablar);

                // Hablar la respuesta
                setEstado("hablando");
                const synth = window.speechSynthesis;
                const utter = new SpeechSynthesisUtterance(textoParaHablar);
                utter.lang = "es-ES";
                utter.voice = synth.getVoices().find(voice => voice.name === "Google español") || synth.getVoices()[0];
                synth.speak(utter);

                utter.onend = () => {
                    if (!detenerRef.current) {
                        iniciarGrabacion();
                    } else {
                        setEstado("esperando");
                    }
                };
            } catch (error) {
                setRespuesta("Ocurrió un error procesando el audio:" + error);
                setEstado("esperando");
            }
        };

        mediaRecorder.start();
        setGrabando(true);

        setTimeout(() => {
            if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                setGrabando(false);
            }
        }, 4000); // 4 segundos de grabación por ciclo
    }, []); // <-- Cierra el useCallback

    const detenerGrabacion = () => {
        detenerRef.current = true;
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setGrabando(false);
    };

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-4">Asistente de Voz con Gemini</h1>

            <button
                className={`mb-4 px-4 py-2 rounded-lg text-white font-bold shadow-lg transition-all duration-200 ${grabando ? "bg-red-500" : "bg-green-500"
                    }`}
                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
            >
                {grabando ? "Detener" : "Reiniciar"}
            </button>

            <div className="w-full max-w-md bg-white p-4 rounded-xl shadow text-center">
                <p className="text-sm text-gray-500 mb-2">
                    Estado: <span className="font-semibold">{estado}</span>
                </p>
                <p className="text-gray-700">
                    <strong>Tú:</strong> {transcripcion}
                </p>
                <p className="text-gray-900 mt-2">
                    <strong>Asistente:</strong> {respuesta}
                </p>
            </div>
        </main>
    );
}


