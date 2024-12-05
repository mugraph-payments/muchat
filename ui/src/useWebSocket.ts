import { useEffect, useRef } from "react";
import { ChatClient } from "./lib/client";
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export type WebSocketOptions = {
  onConnected?: () => void;
};

export function useWebSocket(options: WebSocketOptions) {
  const webSocketClient = useRef<ChatClient | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;

    console.log("🟩 Connecting...");
    async function connect() {
      webSocketClient.current = await ChatClient.create();
      options?.onConnected?.();
    }
    connect();

    return () => {
      console.log("🟥 Disconnecting");
      webSocketClient.current?.disconnect();
    };
  }, [webSocketClient, options]);

  return webSocketClient;
}
