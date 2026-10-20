"use client"

import { Suspense } from "react"
import PlayPageShell from "@/page_shells/PlayShell"

export default function Loading() {
    return (
        <section>
            <Suspense fallback="Loading...">
                <PlayPageShell/>
            </Suspense>
        </section>

    );


}