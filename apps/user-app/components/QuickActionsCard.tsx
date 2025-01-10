"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useRouter } from "next/navigation";

export function QuickActionsCard() {
    const router = useRouter();
    return (
        <Card title={"Quick Actions"}>
            <div className="flex gap-4 pt-2">
                <Button onClick={() => { router.push("/transfer") }}>Add Money</Button>
                <Button onClick={() => { router.push("/p2p") }}>Send Money</Button>
            </div>
        </Card>
    )
}