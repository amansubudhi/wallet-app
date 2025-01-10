import { SendCard } from "../../../components/SendCard";

export default function () {
    return <div className="w-screen p-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-3xl font-bold mb-6 ">
                Send Money (P2P)
            </div>
            <SendCard />
        </div>
    </div>
}