import { atom } from "recoil";

interface Transaction {
    id: number;
    type: string;
    startTime: Date;
    amount: number;
    status: string;
    direction: string;
}

export const transactionsAtom = atom<Transaction[]>({
    key: "transactionsState",
    default: [],
});
