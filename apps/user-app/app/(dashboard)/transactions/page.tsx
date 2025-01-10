import { Card } from "@repo/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id)
        },
        orderBy: {
            startTime: "desc"
        }
    });
    return txns.map(t => ({
        id: t.id,
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }))
}

export default async function () {
    const transactions = await getOnRampTransactions();

    if (!transactions.length) {
        return <Card title="Transactions">
            <div className="text-center min-w-screen pb-8 pt-8">
                No transactions found
            </div>
        </Card>
    }
    return <div className="w-full h-screen">
        <Card title="Transactions">
            <div className="pt-4">
                {transactions.map(t => <div key={Number(t.id)} className="flex justify-between pt-4">
                    <div>
                        <div className="text-sm">
                            Received INR
                        </div>
                        <div className="text-slate-600 text-xs">
                            {t.time.toDateString()}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        + Rs {t.amount / 100}
                    </div>
                </div>)}
            </div>
        </Card>
    </div>
}