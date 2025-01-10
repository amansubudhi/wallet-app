import { Card } from "@repo/ui/card";
import { getCombinedTransactions } from "../../../lib/actions/getTransactions"



export default async function () {
    const transactions = await getCombinedTransactions();


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
                {/* Hi there */}
                {/* <div>
                    <h1>Transactions</h1>
                    <ul>
                        {combinedTransactions.map((txn) => (
                            <li key={txn.id}>
                                <p>Type: {txn.type}</p>
                                <p>Time: {txn.time.toLocaleString()}</p>
                                <p>Amount: {txn.amount}</p>
                                <p>Direction: {txn.direction}</p>
                            </li>
                        ))}
                    </ul>
                </div> */}
            </div>
        </Card>
    </div>
}