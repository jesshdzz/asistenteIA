import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "asistenteIA",
    description: "Asistente de IA para la gestión personal",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="es">
            <body className={`${inter.className} antialiased min-h-dvh grid grid-rows-[auto_1fr_auto]`}>
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
