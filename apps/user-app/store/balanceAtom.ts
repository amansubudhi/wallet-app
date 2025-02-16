import { atom } from "recoil";

export const balanceAtom = atom({
    key: "balanceState",
    default: { amount: 0, locked: 0 },
});
