import "../../globals.css"
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { BalanceCard } from "../../../components/BalanceCard";
import { QuickActionsCard } from "../../../components/QuickActionsCard";
import { getCombinedTransactions } from "../../../lib/actions/getTransactions";
import { TransactionsCard } from "../../../components/TransactionsCard";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}
export default async function () {
    const balance = await getBalance();
    const transactions = await getCombinedTransactions();

    return <div className="w-screen custom-scrollbar overflow-auto p-8" style={{ height: 'calc(100vh - 57px' }}>
        <div className="text-3xl font-bold mb-6 ">
            Dashboard
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
            <QuickActionsCard />
        </div>
        <div className="pt-4">
            <TransactionsCard transactions={transactions.slice(0, 3)} />
        </div>
    </div>
}