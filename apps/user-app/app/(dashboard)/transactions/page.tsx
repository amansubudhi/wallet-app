import { Card } from "@repo/ui/card";
import { getCombinedTransactions } from "../../../lib/actions/getTransactions"

type TransactionSummary = {
    received: number;
    sent: number;
    processing: number;
};

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


    // if (!transactions.length) {
    //     return <Card title="Transactions">
    //         <div className="text-center min-w-screen pb-8 pt-8">
    //             No transactions found
    //         </div>
    //     </Card>
    // }

    return <div className="w-screen p-8">
        <div className="max-w-4xl mx-auto">
            <div className="text-3xl font-bold mb-6 ">
                Transactions
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-sm font-medium">Total Received</span>
                        <ArrowDownIcon size={4} />
                    </div>
                    <div className="text-2xl font-bold">{summary.received / 100}</div>
                </div>
                <div className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between pb-2">
                        <span className="text-sm font-medium">Total Sent</span>
                        <ArrowUpIcon size={4} />
                    </div>
                    <div className="text-2xl font-bold">{summary.sent / 100}</div>
                </div>
                <div className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between pb-2">
                        <span className="text-sm font-medium">Processing</span>
                        <ClockCircleIcon size={4} />
                    </div>
                    <div className="text-2xl font-bold">{summary.processing / 100}</div>
                </div>
            </div>
            <Card title="Transaction History">
                {transactions.length === 0 ? (
                    <div className="flex items-center justify-center text-gray-500">
                        No Transactions found
                    </div>
                ) : (
                    <div className="pt-4">
                        {transactions.map(t => <div key={Number(t.id)} className="flex items-center border-b justify-between py-4">
                            <div className="flex items-center gap-2">
                                {t.direction === 'in' ? (
                                    <ArrowDownIcon />
                                ) : (
                                    <ArrowUpIcon />
                                )}
                                <div className="">
                                    <p className="font-medium">{t.type}</p>
                                    <p className="text-sm text-gray-500">{t.time.toDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className={`flex flex-col justify-center ${t.direction === 'in' ? "text-green-600" : "text-red-600"}`}>
                                    {t.direction === 'in' ? '+' : '-'}Rs {t.amount / 100}
                                </div>
                                {t.status === 'Success' ? <CheckCircleIcon size={5} /> : <ClockCircleIcon size={5} />}
                            </div>
                        </div>)}
                    </div>
                )}
            </Card>
        </div>
    </div>
}


function ArrowDownIcon({ size = 6 }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-${size} text-green-600`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>

}

function ArrowUpIcon({ size = 6 }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-${size} text-red-600`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>

}

function CheckCircleIcon({ size = 6 }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-${size} text-green-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>

}

function ClockCircleIcon({ size = 6 }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-${size} text-orange-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>

}