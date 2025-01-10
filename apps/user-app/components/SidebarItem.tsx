"use client"

import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return <div className={`flex text-sm font-medium rounded-md gap-4 items-center cursor-pointer px-4 py-2 hover:bg-gray-100`} onClick={() => {
        router.push(href);
    }}>
        <div className="">
            {icon}
        </div>
        <div className={``}>
            {title}
        </div>
    </div>
}