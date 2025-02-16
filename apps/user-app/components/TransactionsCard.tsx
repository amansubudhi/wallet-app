import { Card } from "@repo/ui/card";

interface Transaction {
    id: number
    type: string
    startTime: Date;
    amount: number;
    status: string;
    direction: string;
}

interface TransactionProps {
    transactions: Transaction[]
}

export const TransactionsCard = ({ transactions }: TransactionProps) => {
    return <Card title="Transaction History">
        {transactions.length === 0 ? (
            <div className="flex items-center justify-center text-gray-500">
                No Transactions found
            </div>
        ) : (

            <div className="pt-4">
                {transactions.map((t, index) => <div key={`${t.id}-${index}`} className="flex items-center border-b justify-between py-4">
                    <div className="flex items-center gap-2">
                        {t.direction === 'in' ? (
                            <ArrowDownIcon />
                        ) : (
                            <ArrowUpIcon />
                        )}
                        <div>
                            <p className="font-medium">{t.type}</p>
                            <p className="text-sm text-gray-500">{t.startTime.toDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className={`flex flex-col justify-center ${t.direction === 'in' ? "text-green-600" : "text-red-600"}`}>
                            {t.direction === 'in' ? '+' : '-'}Rs {t.amount / 100}
                        </div>
                        {t.status === 'Success' ? <CheckCircleIcon /> : <ClockCircleIcon />}
                    </div>
                </div>
                )}
            </div>
        )}
    </Card>
}

export function ArrowDownIcon({ value = "size-6" }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`${value} text-green-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>

}

export function ArrowUpIcon({ value = "size-6" }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`${value} text-red-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>

}

export function CheckCircleIcon({ value = "size-5" }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`${value} text-green-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>

}

export function ClockCircleIcon({ value = "size-5" }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`${value} text-orange-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>

}