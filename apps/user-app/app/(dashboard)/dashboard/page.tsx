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
import { useRecoilState } from "recoil";
import { balanceAtom } from "../../../store/balanceAtom";
import { transactionsAtom } from "../../../store/transactionAtom";


export default function DashBoardPage() {
    const { data: session } = useSession();
    const [balance, setBalance] = useRecoilState(balanceAtom);
    const [transactions, setTransactions] = useRecoilState(transactionsAtom);
    const { socket, connectWebSocket, disconnectWebSocket, isConnected } = useWebSocket();
    const hasConnectedOnce = useRef<boolean>(false);
    const [hasFetchedData, setHasFetchedData] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!hasFetchedData) {
                const newBalance = await getBalance();
                setBalance(newBalance);

                const txns = await getCombinedTransactions();
                setTransactions(txns);

                setHasFetchedData(true);
            }
        }
        fetchData();
    }, [hasFetchedData]);

    useEffect(() => {
        if (!session?.accessToken || !hasFetchedData || transactions.length === 0) {
            return;
        };

        const hasProcessingTransaction = transactions.some(
            (txn) => txn.type.startsWith("Bank Transfer") && txn.status === "Processing"
        );

        if (hasProcessingTransaction) {
            if (!isConnected && !hasConnectedOnce.current) {
                connectWebSocket(session.accessToken);
                hasConnectedOnce.current = true
            }
        } else {
            disconnectWebSocket();
            hasConnectedOnce.current = false;
        }
    }, [session?.accessToken, transactions, hasFetchedData, isConnected]);

    useEffect(() => {
        return () => {
            if (isConnected) {
                disconnectWebSocket();
            }
        }
    }, [isConnected])

    useEffect(() => {
        if (!socket || !isConnected) return;

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
            socket.off("transaction_update", handleTransactionUpdate);
        };
    }, [socket, isConnected]);



    return <div className="w-screen custom-scrollbar overflow-auto p-8" style={{ height: 'calc(100vh - 57px' }}>
        <div className="text-3xl font-bold mb-6 ">
            Dashboard
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
            <QuickActionsCard />
        </div>
        <div className="pt-4">
            <TransactionsCard transactions={transactions.slice(0, 3)} />
        </div>
    </div>


}
