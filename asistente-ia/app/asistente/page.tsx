"use client";

import { useState, useRef } from "react";

export default function Home() {
    const [transcripcion, setTranscripcion] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [grabando, setGrabando] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const iniciarGrabacion = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("audio", blob);

            const res = await fetch("/api/deepgram", {
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
            setRespuesta(chatData.respuesta);

            const synth = window.speechSynthesis;
            const utter = new SpeechSynthesisUtterance(chatData.respuesta);
            utter.lang = "es-ES";
            synth.speak(utter);
        };

        mediaRecorder.start();
        setGrabando(true);
    };

    const detenerGrabacion = () => {
        mediaRecorderRef.current?.stop();
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
                {grabando ? "Detener" : "Grabar"}
            </button>

            <div className="w-full max-w-md bg-white p-4 rounded-xl shadow">
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