import { Card } from "@repo/ui/card";

export const BalanceCard = ({ amount, locked }: {
    amount: number;
    locked: number;
}) => {
    return <Card title={"Balance"}>
        <div className="flex justify-between items-center py-4">
            <span className="text-gray-600">Unlocked balance</span>
            <span className="font-medium">{amount / 100} INR</span>
        </div>
        <div className="flex justify-between items-center border-t py-4">
            <span className="text-gray-600">Total Locked Balance</span>
            <span className="font-medium">{locked / 100} INR</span>
        </div>
        <div className="flex justify-between items-center border-t py-4">
            <span className="text-gray-600">Total Balance</span>
            <span className="font-medium">{(locked + amount) / 100} INR</span>
        </div>
    </Card>
}