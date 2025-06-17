// app/page.tsx
"use client";

import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Settings, BotMessageSquare, CirclePause, CircleUser } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react";
import { detectarYEjecutarAccion } from "@/lib/comandos";

import { Sidemenu } from "@/components/Sidemenu";

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
        <div className="grid grid-cols-[300px_1fr] min-h-full">
            <Sidemenu />
            <div className="flex flex-col min-h-full items-center p-16 mx-auto">
                {/* Header */}
                <div className="mb-12 text-center flex flex-col items-center gap-5">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary">
                        <BotMessageSquare className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-primary-content/60">Asistente Virtual</h1>
                        <p className="text-base-content/70">Presiona el micrófono y comienza a hablar</p>
                    </div>
                </div>

                {/* Simulacion de voz */}
                {estado == "escuchando" && (
                    <div className="flex items-center justify-center gap-1 mb-8">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 transition-all duration-150 rounded-full bg-primary"
                                style={{
                                    height: `${Math.max(4, (audioLevel + Math.random() * 20) * 0.8)}px`,
                                    opacity: 0.3 + (audioLevel / 100) * 0.7,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Boton de voz */}
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

                    {estado === "escuchando" && (
                        <>
                            <div className="absolute inset-0 border-4 rounded-full opacity-75 border-error animate-ping"></div>
                            <div className="absolute inset-0 border-4 rounded-full opacity-50 border-error animate-ping animation-delay-75"></div>
                        </>
                    )}

                    {estado === "hablando" && (
                        <div className="absolute inset-0 border-4 rounded-full border-info opacity-60 animate-pulse"></div>
                    )}
                </div>

                {/* Status */}
                <div className="mb-8 text-center">
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

                {/* Transcripcion */}
                {transcripcion && (
                    <div className="w-full max-w-2xl mb-6 shadow-lg card bg-base-200">
                        <div className="card-body">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                                    <CircleUser className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-1 text-sm font-semibold text-base-content/70">Tu mensaje:</h3>
                                    <p className="text-base-content">{transcripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Respuesta */}
                {respuesta && (
                    <div className="w-full max-w-2xl mb-6 shadow-lg card bg-primary/10">
                        <div className="card-body">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                                    <BotMessageSquare className="w-5 h-5" />

                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold text-base-content/70">Respuesta:</h3>
                                        {estado === "hablando" && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
                                    </div>
                                    <p className="text-base-content">{respuesta}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de accion */}
                <div className="flex gap-4">
                    <button className={`btn btn-outline btn-sm ${grabando ? 'text-error' : ''}`} onClick={detenerGrabacion} disabled={estado === "esperando"}>
                        <CirclePause className="w-4 h-4" />
                        Detener conversación
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={iniciarGrabacion} disabled={estado === "escuchando" || estado === "procesando"}>
                        <RotateCcw className="w-4 h-4" />
                        Nueva Conversación
                    </button>
                    <button className="btn btn-outline btn-sm">
                        <VolumeX className="w-4 h-4" />
                        Silenciar
                    </button>
                    <button className="btn btn-outline btn-sm">
                        <Settings className="w-4 h-4" />
                        Configuración
                    </button>

                </div>
            </div>
        </div>
    );
}
