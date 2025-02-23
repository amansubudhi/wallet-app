"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { createOnrampTransaction } from "../lib/actions/createOnrampTransaction";
import { useSetRecoilState } from "recoil";
import { transactionsAtom } from "../store/transactionAtom";

const SUPPORTED_BANKS = [{
    name: "State Bank of India",
    redirectUrl: "https://www.onlinesbi.sbi/"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}, {
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "ICICI Bank",
    redirectUrl: "https://www.icicibank.com/"
}
];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [amount, setAmount] = useState(0);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const setTransactions = useSetRecoilState(transactionsAtom);

    return <Card title="Add Money to Wallet">
        <div className="w-full pt-2">
            <TextInput label={"Amount (INR)"} placeholder={"Enter Amount"} value={amount} onChange={(value) => {
                setAmount(Number(value))
            }} />
            <div className="py-4 text-left">
                Select Bank
            </div>
            <Select onSelect={(value) => {
                setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "")
                setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "")
            }} options={SUPPORTED_BANKS.map(x => ({
                key: x.name,
                value: x.name
            }))} />
            <div className="flex justify-center pt-4">
                <Button onClick={async () => {
                    if (amount <= 0) {
                        alert('Not allowed')
                    } else {
                        const response = await createOnrampTransaction(amount * 100, provider)
                        if (response.transaction) {
                            setTransactions((prev) => [response.transaction, ...prev]);
                        }
                    }
                }}>
                    Add Money
                </Button>
            </div>
        </div>
    </Card>
}