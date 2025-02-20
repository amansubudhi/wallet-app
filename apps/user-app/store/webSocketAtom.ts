import { atom } from "recoil";



export const webSocketStateAtom = atom<boolean>({
    key: "webSocketState",
    default: false,
})
