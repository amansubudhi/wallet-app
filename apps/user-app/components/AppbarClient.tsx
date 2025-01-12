"use client"

import { Appbar } from "@repo/ui/appbar";
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";

export function AppbarClient() {
    const session = useSession();
    const router = useRouter();

    return (
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5">
            <Appbar onSignin={signIn} onSignout={async () => {
                await signOut()
                router.push("/api/auth/signin")
            }} user={session.data?.user} />
        </div>
    )
}