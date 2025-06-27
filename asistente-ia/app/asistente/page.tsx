"use client"

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
    Menu,
    X,
} from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { detectarYEjecutarAccion } from "@/lib/comandos"
import { SideMenu } from "@/components/SideMenu"
import { Usuario, usuarioStorage } from "@/lib/storage"

type Estado = "esperando" | "escuchando" | "procesando" | "hablando"

export default function AsistentePage() {
    const [transcripcion, setTranscripcion] = useState("")
    const [respuesta, setRespuesta] = useState("")
    const [estado, setEstado] = useState<Estado>("esperando")
    const [grabando, setGrabando] = useState(false)
    const [silenciado, setSilenciado] = useState(false)
    const [usuario, setUsuario] = useState<Usuario>()
    const [sideMenuOpen, setSideMenuOpen] = useState(false)

    const router = useRouter()
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const detenerRef = useRef(false)
    const streamRef = useRef<MediaStream | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Verificar autenticación
    useEffect(() => {
        const usuarioActual = usuarioStorage.obtenerActual()
        if (!usuarioActual) {
            router.push("/login")
            return
        }
        setUsuario(usuarioActual)
    }, [router])

    const iniciarGrabacion = useCallback(async () => {
        setEstado("escuchando")
        detenerRef.current = false
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
            if (detenerRef.current) return
            setEstado("procesando")
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            const formData = new FormData()
            formData.append("audio", blob)

            try {
                const res = await fetch("/api/deepgram/stt", { method: "POST", body: formData })
                const data = await res.json()
                setTranscripcion(data.transcripcion)

                const chatRes = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mensaje: data.transcripcion }),
                })
                const chatData = await chatRes.json()

                const texto = await detectarYEjecutarAccion(chatData)

                setRespuesta(texto)

                setEstado("hablando")
                console.log("=> ", silenciado)

                if (!silenciado) {
                    const utter = await fetch("/api/murf", {
                        method: "POST",
                        body: JSON.stringify({ text: texto }),
                    })
                    const audioData = await utter.json()

                    const audio = new Audio(audioData.audio)
                    audioRef.current = audio
                    audio.play()
                    audio.onended = () => {
                        if (chatData.fin) detenerGrabacion()
                        else if (!detenerRef.current) iniciarGrabacion()
                        else setEstado("esperando")
                    }
                } else {
                    // Si está silenciado, reiniciar grabación sin reproducir audio
                    setTimeout(() => {
                        if (!detenerRef.current) iniciarGrabacion()
                        else setEstado("esperando")
                    }, 3000)
                }
            } catch (e) {
                setRespuesta("Error: " + e)
                setEstado("esperando")
            }
        }

        mediaRecorder.start()
        setGrabando(true)

        setTimeout(() => {
            if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop()
                setGrabando(false)
            }
        }, 8000)
    }, [silenciado])

    const detenerGrabacion = () => {
        detenerRef.current = true
        mediaRecorderRef.current?.stop()
        streamRef.current?.getTracks().forEach((t) => t.stop())
        audioRef.current?.pause()
        audioRef.current = null
        setGrabando(false)
        setEstado("esperando")
    }

    const reiniciarGrabacion = () => {
        detenerGrabacion()
        setTranscripcion("")
        setRespuesta("")
        setSilenciado(false)
        setEstado("esperando")
    }

    // Mostrar loading si no hay usuario
    if (!usuario) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen lg:grid lg:grid-cols-[300px_1fr]">
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-100 shadow-lg lg:hidden"
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
            >
                {sideMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Side Menu - Mobile Overlay */}
            <div className={`fixed inset-0 z-40 lg:relative lg:z-auto ${sideMenuOpen ? "block" : "hidden"} lg:block`}>
                <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setSideMenuOpen(false)} />
                <div className="relative w-80 h-full bg-base-100 lg:w-full">
                    <SideMenu />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 p-4 mx-auto sm:p-8 lg:p-16">
                {/* Header */}
                <div className="mb-8 text-center sm:mb-12">
                    <div className="flex flex-col items-center gap-3 sm:gap-5">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary sm:w-20 sm:h-20">
                            <BotMessageSquare className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <div>
                            <h1 className="mb-2 text-2xl font-bold text-primary-content/60 sm:text-3xl">Hola, {usuario.nombre}</h1>
                            <p className="text-sm text-base-content/70 sm:text-base">Presiona el micrófono y comienza a hablar</p>
                        </div>
                    </div>
                </div>

                {/* Botón principal */}
                <div className="relative mb-8 sm:mb-12">
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
                        className={`btn btn-circle w-24 h-24 text-xl relative overflow-hidden transition-all duration-300 sm:w-32 sm:h-32 sm:text-2xl ${estado === "escuchando"
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
                            <span className="loading loading-spinner loading-md sm:loading-lg"></span>
                        ) : estado === "escuchando" ? (
                            <MicOff className="w-8 h-8 sm:w-12 sm:h-12" />
                        ) : estado === "hablando" ? (
                            <Volume2 className="w-8 h-8 sm:w-12 sm:h-12" />
                        ) : (
                            <Mic className="w-8 h-8 sm:w-12 sm:h-12" />
                        )}
                    </button>
                </div>

                {/* Estado */}
                <div className="mb-6 text-center sm:mb-8">
                    {estado === "escuchando" && (
                        <div className="alert alert-info">
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Escuchando... Habla ahora</span>
                        </div>
                    )}
                    {estado === "procesando" && (
                        <div className="alert alert-warning">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="text-sm sm:text-base">Procesando tu solicitud...</span>
                        </div>
                    )}
                    {estado === "hablando" && (
                        <div className="alert alert-info">
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Reproduciendo respuesta...</span>
                        </div>
                    )}
                    {estado === "esperando" && (
                        <div className="alert">
                            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Listo para escuchar</span>
                        </div>
                    )}
                </div>

                {/* Mensaje usuario */}
                {transcripcion && (
                    <div className="w-full max-w-2xl mb-4 shadow-lg card bg-base-200 sm:mb-6">
                        <div className="p-3 card-body sm:p-4">
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary sm:w-8 sm:h-8">
                                    <CircleUser className="w-3 h-3 sm:w-5 sm:h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-semibold text-base-content/70 sm:text-sm">Tu mensaje:</h3>
                                    <p className="text-sm sm:text-base">{transcripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Respuesta IA */}
                {respuesta && (
                    <div className="w-full max-w-2xl mb-4 shadow-lg card bg-primary/10 sm:mb-6">
                        <div className="p-3 card-body sm:p-4">
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary sm:w-8 sm:h-8">
                                    <BotMessageSquare className="w-3 h-3 sm:w-5 sm:h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xs font-semibold text-base-content/70 sm:text-sm">Respuesta:</h3>
                                        {estado === "hablando" && <Volume2 className="w-3 h-3 text-primary animate-pulse sm:w-4 sm:h-4" />}
                                    </div>
                                    <p className="text-sm sm:text-base">{respuesta}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    <button
                        className={`btn btn-outline btn-xs sm:btn-sm ${grabando ? "text-error" : ""}`}
                        onClick={detenerGrabacion}
                        disabled={estado === "esperando"}
                    >
                        <CirclePause className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Detener conversación</span>
                        <span className="sm:hidden">Detener</span>
                    </button>
                    <button
                        className="btn btn-outline btn-xs sm:btn-sm"
                        onClick={reiniciarGrabacion}
                        disabled={estado === "escuchando" || estado === "procesando"}
                    >
                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Nueva Conversación</span>
                        <span className="sm:hidden">Nueva</span>
                    </button>
                    <button className="btn btn-outline btn-xs sm:btn-sm" onClick={() => setSilenciado(!silenciado)}>
                        {silenciado ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                        {silenciado ? "Silenciado" : "Silenciar"}
                    </button>
                    <button className="btn btn-outline btn-xs sm:btn-sm">
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Config</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
