// app/page.tsx
"use client";

import { detectarYEjecutarAccion } from "@/lib/comandos";
import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Settings } from "lucide-react"

type Estado = "esperando" | "escuchando" | "procesando" | "hablando";

export default function Home() {
    const [transcripcion, setTranscripcion] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [grabando, setGrabando] = useState(false);
    const [estado, setEstado] = useState<Estado>("esperando");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const detenerRef = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (estado === "escuchando") {
            interval = setInterval(() => {
                setAudioLevel(Math.random() * 100)
            }, 100)
        } else {
            setAudioLevel(0)
        }
        return () => clearInterval(interval)
    }, [estado])

    const iniciarGrabacion = useCallback(async () => {
        setEstado("escuchando");
        detenerRef.current = false;
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
                console.log("Transcripción:", data.transcripcion);

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
                const utter = await fetch('/api/murf', {
                    method: "POST",
                    body: JSON.stringify({ text: textoParaHablar }),
                });
                const audioData = await utter.json();
                const audio = new Audio(audioData.audio);
                audio.play();

                audio.onended = () => {
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="avatar mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-content">AI</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">Asistente Virtual</h1>
                <p className="text-base-content/70">Presiona el micrófono y comienza a hablar</p>
            </div>

            {/* Audio Visualization */}
            {estado == "escuchando" && (
                <div className="flex items-center justify-center gap-1 mb-8">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-primary rounded-full transition-all duration-150"
                            style={{
                                height: `${Math.max(4, (audioLevel + Math.random() * 20) * 0.8)}px`,
                                opacity: 0.3 + (audioLevel / 100) * 0.7,
                            }}
                        />
                    ))}
                </div>
            )}


            {/* Main Voice Button */}
            <div className="relative mb-12">
                <button
                    className={`btn btn-circle w-32 h-32 text-2xl relative overflow-hidden transition-all duration-300 ${estado === "escuchando"
                        ? "btn-error scale-110"
                        : estado === "procesando"
                            ? "btn-warning"
                            : estado === "hablando"
                                ? "btn-info"
                                : "btn-primary hover:scale-105"
                        }`}
                    onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                >
                    {estado === "procesando" ? (
                        <span className="loading loading-spinner loading-lg"></span>
                    ) : estado === "escuchando" ? (
                        <MicOff className="w-12 h-12" />
                    ) : estado === "hablando" ? (
                        <Volume2 className="w-12 h-12" />
                    ) : (
                        <Mic className="w-12 h-12" />
                    )}
                </button>

                {/* Pulse rings for listening state */}
                {estado === "escuchando" && (
                    <>
                        <div className="absolute inset-0 rounded-full border-4 border-error opacity-75 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-error opacity-50 animate-ping animation-delay-75"></div>
                    </>
                )}

                {/* Speaking indicator */}
                {estado === "hablando" && (
                    <div className="absolute inset-0 rounded-full border-4 border-info opacity-60 animate-pulse"></div>
                )}
            </div>

            {/* Status Text */}
            <div className="text-center mb-8">
                {estado === "escuchando" && (
                    <div className="alert alert-info">
                        <Volume2 className="w-5 h-5" />
                        <span>Escuchando... Habla ahora</span>
                    </div>
                )}
                {estado === "procesando" && (
                    <div className="alert alert-warning">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Procesando tu solicitud...</span>
                    </div>
                )}
                {estado === "hablando" && (
                    <div className="alert alert-info">
                        <Volume2 className="w-5 h-5" />
                        <span>Reproduciendo respuesta...</span>
                    </div>
                )}
                {!(estado === "escuchando") && !(estado === "procesando") && !(estado === "hablando") && (
                    <div className="alert">
                        <Mic className="w-5 h-5" />
                        <span>Listo para escuchar</span>
                    </div>
                )}
            </div>

            {/* Transcription */}
            {transcripcion && (
                <div className="card w-full max-w-2xl bg-base-200 shadow-lg mb-6">
                    <div className="card-body">
                        <div className="flex items-start gap-3">
                            <div className="avatar">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-content">TÚ</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm text-base-content/70 mb-1">Tu mensaje:</h3>
                                <p className="text-base-content">{transcripcion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Response */}
            {respuesta && (
                <div className="card w-full max-w-2xl bg-primary/10 shadow-lg mb-6">
                    <div className="card-body">
                        <div className="flex items-start gap-3">
                            <div className="avatar">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-content">AI</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-sm text-base-content/70">Respuesta:</h3>
                                    {estado === "hablando" && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
                                </div>
                                <p className="text-base-content">{respuesta}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button className="btn btn-outline btn-sm" onClick={iniciarGrabacion} disabled={estado === "escuchando" || estado === "procesando"}>
                    <RotateCcw className="w-4 h-4" />
                    Nueva Conversación
                </button>
                <button className="btn btn-outline btn-sm">
                    <Settings className="w-4 h-4" />
                    Configuración
                </button>
                <button className="btn btn-outline btn-sm">
                    <VolumeX className="w-4 h-4" />
                    Silenciar
                </button>
            </div>
        </div>
    );
}



// <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-100">
//     <button
//         className={`mb-4 px-4 py-2 rounded-lg text-white font-bold shadow-lg transition-all duration-200 ${grabando ? "bg-red-500" : "bg-green-500"
//             }`}
//         onClick={grabando ? detenerGrabacion : iniciarGrabacion}
//     >
//         {grabando ? "Detener" : "Reiniciar"}
//     </button>

//     <div className="w-full max-w-md p-4 text-center bg-white shadow rounded-xl">
//         <p className="mb-2 text-sm text-gray-500">
//             Estado: <span className="font-semibold">{estado}</span>
//         </p>
//         <p className="text-gray-700">
//             <strong>Tú:</strong> {transcripcion}
//         </p>
//         <p className="mt-2 text-gray-900">
//             <strong>Asistente:</strong> {respuesta}
//         </p>
//     </div>
// </div>