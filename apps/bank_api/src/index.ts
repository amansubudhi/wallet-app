import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv"

type TransactionData = {
    token: string;
    userId: number;
    amount: number;
    status: string;
}

type ProcessRequestBody = {
    token: string;
    userId: number;
    amount: number;
}

dotenv.config()
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json())


app.post("/process", (req: Request<{}, {}, ProcessRequestBody>, res: Response) => {
    const { token, userId, amount } = req.body;
    console.log("Transaction recieved with details")

    if (!token || !userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    setTimeout(() => {
        const transaction = {
            token,
            userId,
            amount,
            status: "Success"
        };

        sendWebhook(transaction);
    }, Math.random() * 5000 + 2000);

    res.status(200).json({ message: "Transaction is being processed" });
});



async function sendWebhook(transaction: TransactionData) {
    const webhookUrl = process.env.WEBHOOK_URL || "";

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-webhook-secret": process.env.WEBHOOK_SECRET || "test-secret",
            },
            body: JSON.stringify({
                token: transaction.token,
                user_identifier: transaction.userId,
                amount: transaction.amount,
                status: transaction.status,
            }),
        })

        if (!response.ok) {
            throw new Error("Webhook request failed");
        }

    } catch {
        return;
    }


}

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Bank API is running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Bank API running on port ${PORT}`);
});
