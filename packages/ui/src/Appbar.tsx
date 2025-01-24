import Link from "next/link";

interface AppbarProps {
    user?: {
        name?: string | null;
    },
    onSignin: any,
    onSignout: any
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return <div className="sticky top-4 flex flex-wrap justify-between items-center">
        <div className="text-xl font-semibold">
            <Link href="/dashboard">PayTM</Link>
        </div>
        <div className="flex items-center justify-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={user ? onSignout : onSignin}>
            <LogoutIcon />
            <span className="text-sm font-md">{user ? "Logout" : "Login"}</span>
        </div>
    </div>
}

function LogoutIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
}