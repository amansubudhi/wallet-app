import { getServerSession } from "next-auth";
import { authOptions } from "../auth"
import prisma from "@repo/db/client";

export async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id)
        },
        orderBy: {
            startTime: "desc"
        }
    });
    return txns.map(t => ({
        id: t.id,
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }))
}

export async function getP2PTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.p2pTransfer.findMany({
        where: {
            OR: [
                { fromUserId: Number(session?.user?.id) },
                { toUserId: Number(session?.user?.id) },
            ]
        }
    });
    return txns.map((t) => ({
        id: t.id,
        time: t.timestamp,
        amount: t.amount,
        from: t.fromUserId,
        to: t.toUserId
    }))
}

export async function getCombinedTransactions() {
    const session = await getServerSession(authOptions);
    const [onRampTxns, p2pTxns] = await Promise.all([
        getOnRampTransactions(),
        getP2PTransactions()
    ]);


    const formattedOnRamp = onRampTxns.map((txn) => ({
        id: txn.id,
        type: "Bank Transfer",
        time: txn.time,
        amount: txn.amount,
        status: txn.status,
        direction: "in", // Incoming transaction
    }));

    const formattedP2P = p2pTxns.map((txn) => ({
        id: txn.id,
        type: txn.from === Number(session?.user?.id) ? `To: ${txn.to}` : `From: ${txn.from}`,
        time: txn.time,
        amount: txn.amount,
        status: 'Success',
        direction: txn.from === Number(session?.user?.id) ? 'out' : 'in'
    }));


    const combinedTransactions = [...formattedOnRamp, ...formattedP2P].sort(
        (a, b) => b.time.getTime() - a.time.getTime()
    );

    return combinedTransactions;
}