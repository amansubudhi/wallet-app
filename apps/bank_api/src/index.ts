import express, { Request, Response } from "express";
import cors from "cors";

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

const app = express();
const PORT = process.env.PORT ||

    app.use(cors());
app.use(express.json())


app.post("/process", (req: Request<any, any, ProcessRequestBody>, res: Response) => {
    const { token, userId, amount } = req.body;

    if (!token || !userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`Processing transaction ${token}`);

    setTimeout(() => {
        const transaction = {
            token,
            userId,
            amount,
            status: "Success"
        };

        console.log(`Transaction processed:`, transaction);

        sendWebhook(transaction);
    }, Math.random() * 5000 + 2000);

    res.status(200).json({ message: "Transaction is being processed" });

});



function sendWebhook(transaction: TransactionData) {
    const webhookUrl = process.env.WEBHOOK_URL || "http://localhost:3003/webhook";

    fetch(webhookUrl, {
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

        .then((response) => {
            if (response.ok) {
                console.log(`Webhook sent successfully for transaction ${transaction.token}`);
            } else {
                console.log(`Failed to send webhook for transaction ${transaction.token}:`, response.statusText);
            }
        })
        .catch((error) => {
            console.error(`Error sending webhook for transaction ${transaction.token}:`, error);
        });
}

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Bank API is running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Bank API running on port ${PORT}`);
});