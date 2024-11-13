import WebSocket, { Message } from '@tauri-apps/plugin-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

type CommandPayload = {
  corrId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resp: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketClient = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<CommandPayload[]>([]);
  const firstRun = useRef(true);

  const disconnect = useCallback(async () => {
    await webSocketClient.current?.disconnect();
    setIsConnected(false);
  }, []);

  const handleServerMessages = useCallback((message: Message) => {
    switch (message.type) {
      case 'Text': {
        const data = JSON.parse(message.data);
        setMessages((msgs) => [...msgs, data]);
        break;
      }
      case 'Close':
        disconnect();
        break;
      default:
        return;
    }
  }, [disconnect]);

  const connectWebsocket = useCallback(async (): Promise<WebSocket> => {
    const ws = await WebSocket.connect('ws://localhost:5225');
    ws.addListener(handleServerMessages);
    return ws;
  }, [handleServerMessages])

  const setAutoAccept = async (value: boolean): Promise<string | null> => {
    if (!webSocketClient.current) {
      return null;
    }
    const corrId = Date.now().toString();
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/auto_accept ${value ? 'on' : 'false'}`,
      corrId,
    }));
    return corrId;
  }

  const createAddress = async (): Promise<string | null> => {
    if (!webSocketClient.current) {
      return null;
    }
    const corrId = Date.now().toString();
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/address`,
      corrId,
    }));
    return corrId;
  }

  const getActiveUser = async (): Promise<string | null> => {
    if (!webSocketClient.current) {
      return null;
    }
    const corrId = Date.now().toString();
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/u`,
      corrId,
    }));
    return corrId;
  }

  const initChatClient = useCallback(async () => {
    // await createAddress();
    await getActiveUser();
    await setAutoAccept(true);
  }, []);

  const connect = useCallback(async () => {
    webSocketClient.current = await connectWebsocket();
    setIsConnected(true);
    initChatClient();
  }, [
    initChatClient,
    setIsConnected,
    connectWebsocket
  ]);

  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;

    console.log("🟩 Connecting...");
    connect();

    return () => {
      console.log("🟥 Disconnecting")
      disconnect();
    }
  }, [
    connect,
    disconnect,
    isConnected
  ]);

  return {
    isConnected,
    messages,
    setAutoAccept,
    createAddress,
    getActiveUser
  }
}