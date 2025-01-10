import { Card } from "@repo/ui/card"
import type { OnRampStatus } from "@prisma/client";

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        id: Number,
        time: Date,
        amount: number,
        status: OnRampStatus,
        provider: string
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="pt-2">
            {transactions.map(t => <div key={Number(t.id)} className="flex justify-between">
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
}