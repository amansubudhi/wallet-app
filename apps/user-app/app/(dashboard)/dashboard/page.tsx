"use client"

import "../../globals.css"
import { BalanceCard } from "../../../components/BalanceCard";
import { QuickActionsCard } from "../../../components/QuickActionsCard";
import { getCombinedTransactions } from "../../../lib/actions/getTransactions";
import { TransactionsCard } from "../../../components/TransactionsCard";
import { getBalance } from "../../../lib/actions/getBalance";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../../store/useWebSocket";
import { useRecoilValue } from "recoil";
import { webSocketStateAtom } from "../../../store/webSocketAtom";

interface Balance {
    amount: number;
    locked: number;
}

interface Transaction {
    id: number;
    type: string;
    startTime: Date;
    amount: number;
    status: string;
    direction: string;
}


export default function DashBoardPage() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState<Balance>({ amount: 0, locked: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { socket, connectWebSocket, disconnectWebSocket, isConnected } = useWebSocket();
    const isWebSocketActive = useRecoilValue(webSocketStateAtom);
    const hasConnectedOnce = useRef<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            console.log("Fetching balance and transactions...")
            const initialBalance = await getBalance();
            setBalance(initialBalance);

            const txns = await getCombinedTransactions();
            setTransactions(txns.slice(0, 3));
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!session?.accessToken) {
            console.log("NO session found, webSocket will not connect");
            return
        };

        if (transactions.length === 0) {
            console.log("Transactions still loading, skipping webSocket connection")
            return
        };

        const hasProcessingTransaction = transactions.some(
            (txn) => txn.type.startsWith("Bank Transfer") && txn.status === "Processing"
        );

        if (hasProcessingTransaction) {
            if (!isConnected && !hasConnectedOnce.current) {
                console.log("Websocket Attempting to Connect...")
                connectWebSocket(session.accessToken);
                hasConnectedOnce.current = true
            }
        } else {
            console.log("No processing transactions found, Websocket not required")
            disconnectWebSocket();
            hasConnectedOnce.current = false;
        }

        return () => {
            if (!hasProcessingTransaction && isConnected) {
                console.log("Disconnecting Websocket")
                disconnectWebSocket();
            }
        };
    }, [session?.accessToken, transactions]);

    useEffect(() => {

        if (!socket || !isConnected) return;
        console.log("WebSocket is connected, setting up event listeners...")

        const handleTransactionUpdate = (updatedTransaction: { amount: number; transactionId: number; status: string }) => {
            setBalance((prevBalance) => ({
                ...prevBalance,
                amount: prevBalance.amount + updatedTransaction.amount,
            }));

            setTransactions((prevTransactions) =>
                prevTransactions.map((txn) =>
                    txn.id === updatedTransaction.transactionId
                        ? { ...txn, status: updatedTransaction.status }
                        : txn
                )
            );
        };

        socket.on("transaction_update", handleTransactionUpdate);

        return () => {
            console.log("Removing WebSocket event listener");
            socket.off("transaction_update", handleTransactionUpdate);
        };
    }, [socket]);



    return <div className="w-screen custom-scrollbar overflow-auto p-8" style={{ height: 'calc(100vh - 57px' }}>
        <div className="text-3xl font-bold mb-6 ">
            Dashboard
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
            <QuickActionsCard />
        </div>
        <div className="pt-4">
            <TransactionsCard transactions={transactions} />
        </div>
    </div>


}