"use client"

import { getCombinedTransactions } from "../../../lib/actions/getTransactions"
import { ArrowDownIcon, ArrowUpIcon, ClockCircleIcon, TransactionsCard } from "../../../components/TransactionsCard";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "../../../store/useWebSocket";
import { useRecoilState, useRecoilValue } from "recoil";
import { webSocketStateAtom } from "../../../store/webSocketAtom";
import { transactionsAtom } from "../../../store/transactionAtom";


interface Transaction {
    id: number;
    type: string;
    startTime: Date;
    amount: number;
    status: string;
    direction: string;
}

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

export default function TransactionsPage() {
    const { data: session } = useSession();
    const { connectWebSocket, disconnectWebSocket, socket, isConnected } = useWebSocket();
    const [transactions, setTransactions] = useRecoilState(transactionsAtom);
    const [hasFetchedTransactions, setHasFetchedTransactions] = useState(false);
    const isWebSocketActive = useRecoilValue(webSocketStateAtom);
    const hasConnectedOnce = useRef<boolean>(false);

    useEffect(() => {
        async function fetchTransactions() {
            if (!hasFetchedTransactions) {
                const txns = await getCombinedTransactions();
                setTransactions(txns);
                setHasFetchedTransactions(true);
            }
        }
        fetchTransactions();
    }, [hasFetchedTransactions]);

    useEffect(() => {
        if (!session?.accessToken || !hasFetchedTransactions || transactions.length === 0) {
            console.log("Skipping WebSocket Connection: Missing session or transactions not loaded");
            return;
        }


        const hasProcessingTransactions = transactions.some(txn => txn.type.startsWith("Bank Transfer") && txn.status === "Processing");
        console.log(hasProcessingTransactions);

        if (hasProcessingTransactions) {
            if (!isConnected && !hasConnectedOnce.current) {
                console.log("Websocket Attempting to Connect")
                connectWebSocket(session.accessToken);
                hasConnectedOnce.current = true;
            }
        } else {
            console.log("No processing transactions found, Websocket not required")
            disconnectWebSocket();
            hasConnectedOnce.current = false;
        }

    }, [session?.accessToken, transactions, hasFetchedTransactions, isConnected]);

    useEffect(() => {
        return () => {
            if (isConnected) {
                console.log("Disconnecting WebSocket...");
                disconnectWebSocket();
            }
        };
    }, [isConnected]);


    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log("WebSocket is connected, setting up event listeners");

        const handleTransactionUpdate = (updatedTransaction: { transactionId: number; amount: number; status: string }) => {
            console.log("Received transaction update:", updatedTransaction);

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
            console.log("Removing Websocket event listener")
            socket.off("transaction_update", handleTransactionUpdate);
        }
    }, [socket, isConnected]);


    const summary: TransactionSummary = transactions.reduce((acc, txn) => {
        txn.type.startsWith('Bank Transfer') || txn.type.includes('From')
            ? txn.status === 'Success'
                ? acc.received += txn.amount
                : acc.processing += txn.amount
            : txn.type.includes('To')
                ? acc.sent += txn.amount
                : acc
        return acc;
    },
        { received: 0, sent: 0, processing: 0 }
    );

    return <div className="w-screen custom-scrollbar overflow-auto p-8" style={{ height: 'calc(100vh - 57px' }}>
        <div className="max-w-4xl mx-auto">
            <div className="text-3xl font-bold mb-6 ">
                Transactions
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <AmountCard label="Received" icon={<ArrowDownIcon value="size-4" />} value={summary.received} />
                <AmountCard label="Sent" icon={<ArrowUpIcon value="size-4" />} value={summary.sent} />
                <AmountCard label="Processing" icon={<ClockCircleIcon value="size-4" />} value={summary.processing} />
            </div>
            <TransactionsCard transactions={transactions} />
            {!isWebSocketActive && (
                <div className="text-red-500 mt-4">WebSocket is not connected</div>
            )}
        </div>
    </div>
}


