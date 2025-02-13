"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useEffect, useRef, useState } from "react"
import { p2pTransfer } from "../lib/actions/p2pTransfer";
import { searchUser } from "../lib/actions/getUsers";

type UserSuggesion = {
    id: number;
    name: string | null;
    number: string;
}

export function SendCard() {
    const [details, setDetails] = useState("");
    const [amount, setAmount] = useState("");
    const [suggestions, setSuggestions] = useState<UserSuggesion[]>([]);
    const [loading, setLoading] = useState(false)
    const suggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: Event) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        }

        document.addEventListener("click", handleClickOutside, true);
        return () => document.removeEventListener("click", handleClickOutside, true);
    }, []);

    useEffect(() => {
        if (details.length < 3) {
            setSuggestions([])
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const users = await searchUser(details);
                setSuggestions(users);
            } catch (error) {
                console.error("Error fetching suggestions:", error)
            }
            setLoading(false);
        }, 300)

        return () => clearTimeout(delayDebounce);
    }, [details])

    return <div className="h-fit">
        <Card title="Transfer Details">
            <div className="min-w-72 pt-2">
                <div className="relative" ref={suggestionRef}>
                    <TextInput
                        placeholder={"Enter recipient's details"}
                        label="Recipient"
                        value={details}
                        onChange={(value) => { setDetails(value) }}
                    />

                    {suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full rounded-xl shadow mt-1 z-50">
                            {suggestions.map((user, index) => (
                                <li
                                    key={user.id}
                                    className={`p-2 hover: bg-white cursor-pointer
                                        ${index === 0 ? "rounded-t-xl border-b" : ""}
                                        ${index === suggestions.length - 1 ? "rounded-b-xl" : "border-b"}
                                    `}
                                    onClick={() => {
                                        setSuggestions([])
                                        setDetails(user.name ?? user.number)
                                    }}
                                >
                                    {user.name} - {user.number}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <TextInput placeholder={"Enter Amount"} label="Amount (INR)" value={amount} onChange={(value) => {
                    setAmount(value)
                }} />
                <div className="pt-4 flex justify-center">
                    <Button onClick={async () => {
                        await p2pTransfer(details, Number(amount) * 100)
                        setDetails("")
                        setAmount("")
                    }}>Send Money</Button>
                </div>
            </div>
        </Card>
    </div>
}