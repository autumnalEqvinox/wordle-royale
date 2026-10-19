"use client"

import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlayLayout({ children, }: 
    {children: ReactNode;}) 
    
    {
    const router = useRouter();

    return(
        <div>
            <header>
                <div>
                    <button onClick={() => router.push("/login")}>
                        <Settings size={30} aria-hidden="true"/>
                    </button>

                </div>
            </header>

            { children }
        </div>

    )
}