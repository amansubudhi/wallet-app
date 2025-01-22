import { getServerSession } from "next-auth";
import { authOptions } from "../auth"
import prisma from "@repo/db/client";

export async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        throw new Error("User not authenticated");
    }

    const userId = Number(session.user.id);

    try {
        const txns = await prisma.onRampTransaction.findMany({
            where: {
                userId
            },
            orderBy: {
                startTime: "desc"
            }
        });

        return txns.map((txn) => ({
            id: txn.id,
            type: `Bank Transfer: ${txn.provider}`,
            startTime: txn.startTime,
            amount: txn.amount,
            status: txn.status,
            direction: "in",
        }));
    } catch (error) {
        console.error("Error fetching on-ramp transactions:", error);
        throw new Error("Failed to fetch on-ramp transactions");
    }

}
// return txns.map(t => ({
//     id: t.id,
//     time: t.startTime,
//     amount: t.amount,
//     status: t.status,
//     provider: t.provider
// }))


export async function getP2PTransactions() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        throw new Error("User not authenticated");
    }
    const userId = Number(session.user.id);

    try {

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                sentTransfers: {
                    include: { toUser: { select: { id: true, name: true, number: true } } },
                    orderBy: { timestamp: "desc" },
                },
                receivedTransfers: {
                    include: { fromUser: { select: { id: true, name: true, number: true } } },
                    orderBy: { timestamp: "desc" },
                },
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const sentTransfers = user.sentTransfers.map((txn) => ({
            id: txn.id,
            type: txn.toUser.name
                ? `To: ${txn.toUser.name}`
                : `To: ${txn.toUser.number}`,
            startTime: txn.timestamp,
            amount: txn.amount,
            status: "Success",
            direction: "out",
        }));

        const receivedTransfers = user.receivedTransfers.map((txn) => ({
            id: txn.id,
            type: txn.fromUser.name
                ? `From: ${txn.fromUser.name}`
                : `From: ${txn.fromUser.number}`,
            startTime: txn.timestamp,
            amount: txn.amount,
            status: "Success",
            direction: "in",
        }));

        const allTransactions = [...sentTransfers, ...receivedTransfers];

        return allTransactions;
    } catch (error) {
        console.error("Error fetching P2P transactions:", error);
        throw new Error("Failed to fetch P2P transactions");
    }

}


export async function getCombinedTransactions() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        throw new Error("User not authenticated");
    }

    const userId = Number(session.user.id);
    try {
        const [onRampTxns, p2pTxns] = await Promise.all([
            getOnRampTransactions(),
            getP2PTransactions()
        ]);


        const combinedTransactions = [...onRampTxns, ...p2pTxns].sort(
            (a, b) => b.startTime.getTime() - a.startTime.getTime()
        );

        return combinedTransactions;
    } catch (error) {
        console.error("Error fetching combined transactions:", error);
        throw new Error("Failed to fetch combined transactions")
    }
}