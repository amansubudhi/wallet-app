"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";


export async function createOnrampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const token = (Math.random() * 1000).toString();
    const userId = session?.user.id;
    if (!userId) {
        return {
            message: "User not logged in"
        }
    }
    try {
        await prisma.onRampTransaction.create({
            data: {
                userId: Number(userId),
                amount: amount,
                status: "Processing",
                startTime: new Date(),
                provider,
                token
            }
        })

        const bankupiURl = process.env.BANK_API_URL || "http://localhost:4000/process";

        const response = await fetch(bankupiURl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                userId: Number(userId),
                amount,
            }),
        });

        if (!response.ok) {
            console.error("Error communicating with BANK API:", await response.text());
            return {
                message: "Transaction added but failed to notify Bank API",
            };
        }

        console.log("Transaction sent to Bank API for processing.");
        return {
            message: "On ramp transaction added and sent for processing",
        };
    } catch (error) {
        console.error("Error creating on-ramp transaction:", error);
        return {
            message: "Failed to create on-ramp transaction",
        };
    }
}