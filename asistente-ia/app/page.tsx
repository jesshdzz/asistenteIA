import { ArrowRight, Bot, Sparkles, Zap } from "lucide-react"

export default function Home() {
    return (
        <section className="relative overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                <div className="text-center">
                    {/* Badge */}
                    <div className="badge badge-soft badge-neutral mb-6 px-4 py-2">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Potenciado por IA
                    </div>

                    {/* Main heading */}
                    <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Tu{" "}
                        <span className="bg-gradient-to-r from-blue-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Asistente Virtual
                        </span>{" "}
                        Inteligente
                    </h1>

                    {/* Subheading */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                        Automatiza tareas, obtén respuestas instantáneas y aumenta tu productividad con nuestro asistente virtual
                        impulsado por inteligencia artificial.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button className="group px-8 py-3 text-lg inline-flex items-center justify-center rounded-md bg-primary-content/65 text-white hover:bg-primary-content/40">
                            Comenzar Gratis
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <Bot className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">IA Conversacional</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Conversaciones naturales y contextuales</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Respuestas Instantáneas</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Obtén información al instante, 24/7</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Personalización</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Se adapta a tus necesidades específicas</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
