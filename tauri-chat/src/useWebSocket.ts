import WebSocket, { Message } from '@tauri-apps/plugin-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export async function connectWebsocket(): Promise<WebSocket> {
  const ws = await WebSocket.connect('ws://localhost:5225');
  return ws;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketClient = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const firstRun = useRef(true);
  const handleServerMessages = useCallback((message: Message) => {
    console.log(message);
    switch (message.type) {
      case 'Text': {
        const data = JSON.parse(message.data);
        setMessages((msgs) => {
          msgs.push(data);
          return msgs;
        });
        break;
      }
      case 'Binary':
        break;
      case 'Close':
        break;
      default:
        return;
    }
  }, []);

  const setAutoAccept = async (value: boolean) => {
    if (!webSocketClient.current) {
      return;
    }
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/auto_accept ${value ? 'on' : 'false'}`,
      corrId: Date.now().toString(),
    }));
  }

  const createAddress = async () => {
    if (!webSocketClient.current) {
      return;
    }
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/address`,
      corrId: Date.now().toString(),
    }));
  }

  const getActiveUser = async () => {
    if (!webSocketClient.current) {
      return;
    }
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/u`,
      corrId: Date.now().toString(),
    }));
  }

  useEffect(() => {
    const connect = async () => {
      webSocketClient.current = await connectWebsocket();
      webSocketClient.current.addListener(handleServerMessages);
      // await createAddress();
      await getActiveUser();
      await setAutoAccept(true);
      setIsConnected(true);
    };

    const disconnect = async () => {
      await webSocketClient.current?.disconnect();
    }

    if (firstRun) {
      connect();
    }

    firstRun.current = false;
    return () => {
      firstRun.current = true;
      disconnect();
    }
  }, [handleServerMessages]);


  return {
    isConnected,
    messages,
  }
}