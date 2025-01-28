import express from "express";


const app = express();
app.use(express.json())

app.post("/bankapi", (req, res) => {
    const { token, userId, amount } = req.body;


})