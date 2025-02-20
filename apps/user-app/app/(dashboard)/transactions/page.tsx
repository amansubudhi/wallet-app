"use client"

import { getCombinedTransactions } from "../../../lib/actions/getTransactions"
import { ArrowDownIcon, ArrowUpIcon, ClockCircleIcon, TransactionsCard } from "../../../components/TransactionsCard";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "../../../store/useWebSocket";
import { useRecoilState } from "recoil";
import { transactionsAtom } from "../../../store/transactionAtom";


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
            return;
        }

        const hasProcessingTransactions = transactions.some(txn => txn.type.startsWith("Bank Transfer") && txn.status === "Processing");

        if (hasProcessingTransactions) {
            if (!isConnected && !hasConnectedOnce.current) {
                connectWebSocket(session.accessToken);
                hasConnectedOnce.current = true;
            }
        } else {
            disconnectWebSocket();
            hasConnectedOnce.current = false;
        }

    }, [session?.accessToken, transactions, hasFetchedTransactions, isConnected]);

    useEffect(() => {
        return () => {
            if (isConnected) {
                disconnectWebSocket();
            }
        };
    }, [isConnected]);


    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleTransactionUpdate = (updatedTransaction: { transactionId: number; amount: number; status: string }) => {
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
        </div>
    </div>
}


