import express from "express"
import db from "@repo/db/client"

const app = express();
app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    // Add zod validation
    // Check if this request actually came from hdfc bank, use a webhook secret here
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {
        await db.$transaction([
            db.balance.upsert({
                where: {
                    userId: paymentInformation.userId
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
                            id: Number(paymentInformation.userId)
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

app.listen(3003);