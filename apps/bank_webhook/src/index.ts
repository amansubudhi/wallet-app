import express from "express"
import db from "@repo/db/client"

const app = express();

app.post("/", async (req, res) => {
    // Add zod validation
    // Check if this request actually came from hdfc bank, use a webhook secret here
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    }
    // Update balance in db, add txn
    await db.balance.update({
        where: {
            userId: paymentInformation.userId
        },
        data: {
            amount: {
                increment: paymentInformation.amount
            }
        }
    });

    await db.onRampTransaction.update({
        where: {
            token: paymentInformation.token,
        },
        data: {
            status: "Success"
        }
    })
    res.status(200).json({
        message: "captured"
    })
})

