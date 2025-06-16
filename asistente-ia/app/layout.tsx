import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "@/app/clientLayout";
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
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
