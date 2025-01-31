import express, { Request, Response } from "express"
import { z } from "zod";
import cors from "cors";
import db from "@repo/db/client"


const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors())
app.use(express.json())

const webhookSchema = z.object({
    token: z.string(),
    user_identifier: z.number(),
    amount: z.number(),
});

app.post("/webhook", async (req: Request, res: Response) => {
    const webhooksecret = process.env.WEBHOOK_SECRET || "test-secret";
    const incomingSecret = req.headers["x-webhook-secret"];

    if (incomingSecret !== webhooksecret) {
        console.error("Unauthorized webhook request.");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const validation = webhookSchema.safeParse(req.body);
    if (!validation.success) {
        console.error("Invalid webhook payload:", validation.error.format());
        return res.status(400).json({ message: "Invalid payload", errors: validation.error.format() });

    }
    const paymentInformation = validation.data;

    try {
        await db.$transaction([
            db.balance.upsert({
                where: {
                    userId: paymentInformation.user_identifier
                },
                update: {
                    amount: {
                        increment: paymentInformation.amount
                    }
                },
                create: {
                    amount: Number(paymentInformation.amount),
                    locked: 0,
                    user: {
                        connect: {
                            id: Number(paymentInformation.user_identifier)
                        }
                    }
                }
            }),
            db.onRampTransaction.update({
                where: {
                    token: paymentInformation.token,
                },
                data: {
                    status: "Success"
                }
            })
        ]);
        console.log(`Transaction ${paymentInformation.token} successfully processed.`);
        res.status(200).json({
            message: "captured"
        })
    } catch (e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }
})

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "Webhook app is running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Webhook app running on port ${PORT}`);
});
