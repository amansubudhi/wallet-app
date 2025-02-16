import { atom } from "recoil";

export const revalidateAtom = atom<boolean>({
    key: "revalidateTransactions",
    default: false,
});
