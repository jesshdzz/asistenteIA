// app/page.tsx
"use client";

import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    RotateCcw,
    Settings,
    BotMessageSquare,
    CirclePause,
    CircleUser,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { detectarYEjecutarAccion } from "@/lib/comandos";
import { SideMenu } from "@/components/SideMenu";

type Estado = "esperando" | "escuchando" | "procesando" | "hablando";

export default function Home() {
    const [transcripcion, setTranscripcion] = useState("");
    const [respuesta, setRespuesta] = useState("");
    const [estado, setEstado] = useState<Estado>("esperando");
    const [grabando, setGrabando] = useState(false);
    const [silenciado, setSilenciado] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const detenerRef = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
                const res = await fetch("/api/deepgram/stt", { method: "POST", body: formData });
                const data = await res.json();
                setTranscripcion(data.transcripcion);

                const chatRes = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mensaje: data.transcripcion }),
                });
                const chatData = await chatRes.json();

                const texto = await detectarYEjecutarAccion(chatData.accion || chatData.respuesta || chatData.error || "No entendí tu solicitud");
                setRespuesta(texto);

                setEstado("hablando");
                console.log("=> ", silenciado);
                
                const utter = await fetch("/api/murf", {
                    method: "POST",
                    body: JSON.stringify({ text: texto }),
                });
                const audioData = await utter.json();

                if (!silenciado) {

                    const audio = new Audio(audioData.audio);
                    audioRef.current = audio;
                    audio.play();
                    audio.onended = () => {
                        if (!detenerRef.current) iniciarGrabacion();
                        else setEstado("esperando");
                    };
                }else {
                    // Si está silenciado, reiniciar grabación sin reproducir audio
                    setTimeout(() => {
                        if (!detenerRef.current) iniciarGrabacion();
                        else setEstado("esperando");
                    }, 3000);
                }
            } catch (e) {
                setRespuesta("Error: " + e);
                setEstado("esperando");
            }
        };

        mediaRecorder.start();
        setGrabando(true);

        // 7s máx por ciclo
        setTimeout(() => {
            if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                setGrabando(false);
            }
        }, 7000);
    }, [silenciado]);

    const detenerGrabacion = () => {
        detenerRef.current = true;
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        audioRef.current?.pause();
        audioRef.current = null;
        setGrabando(false);
        setEstado("esperando");
    };

    const reiniciarGrabacion = () => {
        detenerGrabacion();
        setTranscripcion("");
        setRespuesta("");
        setSilenciado(false);
        setEstado("esperando");
    };

    return (
        <div className="grid grid-cols-[300px_1fr] min-h-full">
            <SideMenu />
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

                {/* Botón principal */}
                <div className="relative mb-12">
                    {estado === "escuchando" && (
                        <>
                            <div className="absolute inset-0 border-4 rounded-full opacity-75 border-error animate-ping"></div>
                            <div className="absolute inset-0 border-4 rounded-full opacity-50 border-error animate-ping animation-delay-75"></div>
                        </>
                    )}

                    {estado === "hablando" && (
                        <div className="absolute inset-0 border-4 rounded-full border-info opacity-60 animate-pulse"></div>
                    )}

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
                </div>

                {/* Estado */}
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
                    {estado === "esperando" && (
                        <div className="alert">
                            <Mic className="w-5 h-5" />
                            <span>Listo para escuchar</span>
                        </div>
                    )}
                </div>

                {/* Mensaje usuario */}
                {transcripcion && (
                    <div className="w-full max-w-2xl mb-6 shadow-lg card bg-base-200">
                        <div className="card-body">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <CircleUser className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-base-content/70">Tu mensaje:</h3>
                                    <p>{transcripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Respuesta IA */}
                {respuesta && (
                    <div className="w-full max-w-2xl mb-6 shadow-lg card bg-primary/10">
                        <div className="card-body">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <BotMessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold text-base-content/70">Respuesta:</h3>
                                        {estado === "hablando" && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
                                    </div>
                                    <p>{respuesta}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-4">
                    <button
                        className={`btn btn-outline btn-sm ${grabando ? "text-error" : ""}`}
                        onClick={detenerGrabacion}
                        disabled={estado === "esperando"}
                    >
                        <CirclePause className="w-4 h-4" />
                        Detener conversación
                    </button>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={reiniciarGrabacion}
                        disabled={estado === "escuchando" || estado === "procesando"}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Nueva Conversación
                    </button>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSilenciado(!silenciado)}
                    >
                        {silenciado ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {silenciado ? "Silenciado" : "Silenciar"}
                    </button>
                    <button className="btn btn-outline btn-sm">
                        <Settings className="w-4 h-4" />
                        Config
                    </button>
                </div>
            </div>
        </div>
    );
}
