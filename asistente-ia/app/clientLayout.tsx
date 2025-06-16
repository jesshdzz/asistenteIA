'use client';

import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header";
import { usePathname } from 'next/navigation';

export default function CLientLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const pathname = usePathname();
    const ocultarLayout = ["/login", "/signup"].includes(pathname);

    return (
        <>
            {!ocultarLayout && <Header />}
            <main>
                {children}
            </main>
            {!ocultarLayout && <Footer />}
        </>
    );
}
