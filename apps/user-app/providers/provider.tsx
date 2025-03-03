"use client"

import { RecoilRoot } from "recoil"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return <RecoilRoot>
        <SessionProvider>
            {children}
            <Toaster />
        </SessionProvider>
    </RecoilRoot>
}