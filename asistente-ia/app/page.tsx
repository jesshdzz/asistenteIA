import { ArrowRight, Bot, Sparkles, Zap } from "lucide-react"
import Link from "next/link";

export default function Home() {
    return (
        <section className="px-4 py-24 mx-auto sm:px-6 lg:px-8 lg:py-32">
            <div className="text-center">
                {/* Badge */}
                <div className="px-4 py-2 mb-6 badge badge-soft badge-neutral">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Potenciado por IA
                </div>

                {/* Main heading */}
                <h1 className="max-w-4xl mx-auto text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                    Tu{" "}
                    <span className="text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-purple-600 bg-clip-text">
                        Asistente Virtual
                    </span>{" "}
                    Inteligente
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl mx-auto mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                    Automatiza tareas, obtén respuestas instantáneas y aumenta tu productividad con nuestro asistente virtual
                    impulsado por inteligencia artificial.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center justify-center gap-4 mt-10 sm:flex-row">
                    <Link href={"/signup"} className="inline-flex items-center justify-center px-8 py-3 text-lg text-white rounded-md group bg-primary-content/65 hover:bg-primary-content/40">
                        Comenzar Gratis
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-3">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10">
                            <Bot className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">IA Conversacional</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Conversaciones naturales y contextuales</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Respuestas Instantáneas</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Obtén información al instante, 24/7</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Personalización</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Se adapta a tus necesidades específicas</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
