"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { createOnrampTransaction } from "../lib/actions/createOnrampTransaction";
import { useSetRecoilState } from "recoil";
import { transactionsAtom } from "../store/transactionAtom";
import { toast } from "sonner"


const SUPPORTED_BANKS = [
    { name: "Select a Bank", isPlaceholder: true },
    { name: "State Bank of India" },
    { name: "Axis Bank" },
    { name: "HDFC Bank" },
    { name: "ICICI Bank" },
];


export const AddMoney = () => {
    const [amount, setAmount] = useState("");
    const [provider, setProvider] = useState<string>(SUPPORTED_BANKS[0]?.name || "");
    const setTransactions = useSetRecoilState(transactionsAtom);

    return <Card title="Add Money to Wallet">
        <div className="w-full pt-2">
            <TextInput label={"Amount (INR)"} placeholder={"Enter Amount"} value={amount} onChange={(value) => {
                if (/^\d*$/.test(value)) {
                    setAmount(value)
                }
            }} />
            <div className="py-4 text-left">Select Bank</div>
            <Select
                value={provider}
                onSelect={(value) => {
                    setProvider(value)
                }} options={SUPPORTED_BANKS.map(x => ({
                    key: x.name,
                    value: x.name,
                    disabled: x.isPlaceholder || false
                }))} />
            <div className="flex justify-center pt-4">
                <Button onClick={async () => {
                    if (Number(amount) <= 0) {
                        toast.error("Invalid amount");
                        return;
                    }

                    if (provider === "Select a Bank") {
                        toast.error("Bank not Selected");
                        return;
                    }
                    try {
                        const response = await createOnrampTransaction(Number(amount) * 100, provider);

                        if (response?.transaction) {
                            setTransactions((prev) => [response.transaction, ...prev]);
                            toast.success("Transaction Successful");
                            setAmount("")
                            setProvider(SUPPORTED_BANKS[0]?.name || "")
                        } else {
                            toast.error("Transaction Failed");
                        }
                    } catch (error) {
                        toast.error("Unable to process your request")
                    }
                }}>
                    Add Money
                </Button>
            </div>
        </div>
    </Card>
}