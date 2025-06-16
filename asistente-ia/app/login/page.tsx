import React, { useState } from "react"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        console.log("Login attempt:", formData)
        setIsLoading(false)
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <LogIn className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
                <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@ejemplo.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={formData.rememberMe}
                                onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                            />
                            <Label htmlFor="remember" className="text-sm font-normal">
                                Recordarme
                            </Label>
                        </div>
                        <Button variant="link" className="px-0 font-normal text-sm">
                            ¿Olvidaste tu contraseña?
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                Iniciando sesión...
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Button variant="link" className="px-0 font-normal">
                            Regístrate aquí
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}