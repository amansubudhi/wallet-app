import express, { Request, Response } from "express"
import { z } from "zod";
import cors from "cors";
import db from "@repo/db/client"
import { Server } from "socket.io"
import http from "http"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

enum TransactionStatus {
    Processing = "Processing",
    Success = "Success",
    Failed = "Failed"
}

dotenv.config()
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || "wss"
console.log(JWT_SECRET)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const webhookSchema = z.object({
    token: z.string(),
    user_identifier: z.number(),
    amount: z.number(),
});

// WebSocket Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    // console.log("Works 1")

    console.log("Received WebSocket Token:", token);

    if (!token) {
        console.error("Authentication error: No token provided");
        return next(new Error("Authentication error: No token provided"))
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        console.log("Decoded JWT:", decoded)
        socket.data.userId = Number(decoded.id);
        next();
    } catch (error) {
        console.error("Websocket authentication failed:", error);
        return next(new Error("Authentication error: Invalid token"));
    }
});

// WebSocket Connection Handling
io.on("connection", (socket) => {
    console.log("New websocket connection received!")

    const userId = socket.data.userId;
    console.log(`User ${userId} attempting to connect to Websockets`);

    socket.join(`user_${userId}`);

    socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
    })
})

//Webhook Handling for Transactions
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

        const transaction = await db.onRampTransaction.findUnique({
            where: { token: paymentInformation.token },
            select: { id: true },
        });

        if (!transaction) {
            console.error(`Transaction not found for token: ${paymentInformation.token}`);
            return res.status(404).json({ message: "Transaction not found" });
        }

        io.to(`user_${paymentInformation.user_identifier}`).emit("transaction_update", {
            transactionId: transaction.id,
            amount: paymentInformation.amount,
            status: TransactionStatus.Success
        });

        console.log("Transaction emitted");

        res.status(200).json({
            message: "Transaction updated successfully"
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Error while processing webhook"
        })
    }
})

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "Webhook app is running" });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Webhook app running on port ${PORT}`);
});
