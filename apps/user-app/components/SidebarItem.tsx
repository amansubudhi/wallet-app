"use client"

import { useRouter } from "next/navigation";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();

    return <button className={`flex w-full text-sm font-medium rounded-md gap-4 items-center cursor-pointer px-4 py-2 hover:bg-gray-100 
        focus:outline-none focus-visible:ring-blue-500`} onClick={() => {
            router.push(href);
        }}>
        <div>{icon}</div>
        <div>{title}</div>
    </button>
}