import { AddMoney } from "../../../components/AddMoneyCard";

export default async function () {
    return <div className="w-screen p-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-3xl font-bold mb-6 ">
                Transfer
            </div>
            <AddMoney />
        </div>
    </div>
}