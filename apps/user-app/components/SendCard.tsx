"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react"
import { p2pTransfer } from "../lib/actions/p2pTransfer";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");

    return <div className="h-[90vh]">
        <Card title="Transfer Details">
            <div className="min-w-72 pt-2">
                <TextInput placeholder={"Enter recipient's number"} label="Recipient" value={number} onChange={(value) => {
                    setNumber(value)
                }} />
                <TextInput placeholder={"Enter Amount"} label="Amount (INR)" value={amount} onChange={(value) => {
                    setAmount(value)
                }} />
                <div className="pt-4 flex justify-center">
                    <Button onClick={async () => {
                        await p2pTransfer(number, Number(amount) * 100)
                        setNumber("")
                        setAmount("")
                    }}>Send Money</Button>
                </div>
            </div>
        </Card>
    </div>
}