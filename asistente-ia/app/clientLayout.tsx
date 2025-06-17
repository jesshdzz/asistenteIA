'use client';

import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header";
import { usePathname } from 'next/navigation';

export default function CLientLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const pathname = usePathname();
    const ocultarHeader = ["/login", "/signup"].includes(pathname);
    const ocultarFooter = ["/login", "/signup", "/asistente"].includes(pathname);
    return (
        <>
            {!ocultarHeader && <Header />}
            <main>
                {children}
            </main>
            {!ocultarFooter && <Footer />}
        </>
    );
}
