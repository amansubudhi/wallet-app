import { useRecoilState } from "recoil"
import { webSocketStateAtom } from "./webSocketAtom"
import io, { Socket } from "socket.io-client"
import { useEffect, useRef } from "react";



export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useRecoilState(webSocketStateAtom);
    const socketRef = useRef<typeof Socket | null>(null)

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        }
    }, []);

    const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3003";

    const connectWebSocket = (token: string) => {
        if (socketRef.current && socketRef.current.connected) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
        });

        socketRef.current = newSocket;

        newSocket.on("connect", () => {
            console.log("Connected to WebSocket")
            setIsConnected(true);

        })

        newSocket.on("disconnect", () => {
            console.log("Disconnected from WebSocket");
            socketRef.current = null;
            setIsConnected(false);
        });
    };

    const disconnectWebSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
    };

    return { socket: socketRef.current, connectWebSocket, disconnectWebSocket, isConnected };
};
