import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { AddMoney } from "../../../components/AddMoneyCard";
// import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransaction";


// async function getBalance() {
//     const session = await getServerSession(authOptions);
//     const balance = await prisma.balance.findFirst({
//         where: {
//             userId: Number(session?.user?.id)
//         }
//     });
//     return {
//         amount: balance?.amount || 0,
//         locked: balance?.locked || 0
//     }
// }

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id)
        },
        orderBy: {
            startTime: "desc"
        },
        take: 3
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
    // const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return <div className="w-screen p-8">
        <div className="text-3xl font-bold mb-6 ">
            Transfer
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <AddMoney />
            </div>
            <div>
                {/* <BalanceCard amount={balance.amount} locked={balance.locked} /> */}
                <div className="pt-4">
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}