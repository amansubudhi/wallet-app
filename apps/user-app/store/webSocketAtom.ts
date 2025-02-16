import { atom } from "recoil";
import io from "socket.io-client";
import type { Socket } from "socket.io-client"


export const webSocketStateAtom = atom<boolean>({
    key: "webSocketState",
    default: false,
})

// export const webSocketMa