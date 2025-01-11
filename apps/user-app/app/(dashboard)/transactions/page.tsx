import { getCombinedTransactions } from "../../../lib/actions/getTransactions"
import { ArrowDownIcon, ArrowUpIcon, ClockCircleIcon, TransactionsCard } from "../../../components/TransactionsCard";

type TransactionSummary = {
    received: number;
    sent: number;
    processing: number;
};

function AmountCard({ label, icon, value }: { label: string, icon: React.ReactNode, value: number }) {
    return <div className="bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium">{`Total ${label}`}</span>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value / 100}</div>
    </div>
}

export default async function () {
    const transactions = await getCombinedTransactions();
    const summary: TransactionSummary = transactions.reduce((acc, txn) => {
        txn.type === 'Bank Transfer' || txn.type.includes('From')
            ? txn.status === 'Success'
                ? acc.received += txn.amount
                : acc.processing += txn.amount
            : acc.sent += txn.amount
        return acc;
    },
        { received: 0, sent: 0, processing: 0 }
    )


    return <div className="w-screen p-8">
        <div className="max-w-4xl mx-auto">
            <div className="text-3xl font-bold mb-6 ">
                Transactions
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <AmountCard label="Received" icon={<ArrowDownIcon size={4} />} value={summary.received} />
                <AmountCard label="Sent" icon={<ArrowUpIcon size={4} />} value={summary.sent} />
                <AmountCard label="Processing" icon={<ClockCircleIcon size={4} />} value={summary.processing} />
            </div>
            <TransactionsCard transactions={transactions} />
        </div>
    </div>
}


