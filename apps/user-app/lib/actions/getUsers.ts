"use server"

import { ErrorHandler } from "../error";
import { getUserSession } from "./getTransactions"
import prisma from "@repo/db/client"

export async function searchUser(searchQuery: string) {
    try {
        if (!searchQuery.trim()) {
            return [];
        }
        const userId = await getUserSession();

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    { number: { startsWith: searchQuery } }
                ]
            },
            select: {
                id: true,
                name: true,
                number: true
            },
            take: 5
        })

        return users.filter((u) => Number(u.id) !== Number(userId))
    } catch (error) {
        throw new ErrorHandler("Failed to fetch users", "INTERNAL_SERVER_ERROR", error);
    }
}