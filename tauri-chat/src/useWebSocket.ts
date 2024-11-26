import WebSocket, { Message } from '@tauri-apps/plugin-websocket';
import { useCallback, useEffect, useRef } from 'react';
import { ChatResponse } from './lib/response';
import { ChatCommand, ChatType, cmdString, ComposedMessage } from './lib/command';
import useChatContext from './useChatContext';
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export type ServerResponse = {
  corrId: string;
  resp: ChatResponse;
}

export type ClientResponseData = {
  corrId: string | null,
}

export function useWebSocket() {
  const corrId = useRef(0);
  const webSocketClient = useRef<WebSocket | null>(null);
  const firstRun = useRef(true);
  const { setIsConnected, addMessage, setDirectChats } = useChatContext();

  const disconnect = useCallback(async () => {
    await webSocketClient.current?.disconnect();
    setIsConnected(false);
  }, [setIsConnected]);

  const serverResponseReducer = useCallback((data: ServerResponse) => {
    addMessage(data);
    switch (data.resp.type) {
      case 'newChatItems': {
        setDirectChats(data.resp.chatItems);
        break;
      }
      default:
        {
          break;
        }
    }
  }, [addMessage, setDirectChats])

  const handleServerMessages = useCallback((message: Message) => {
    switch (message.type) {
      case 'Text': {
        const data = JSON.parse(message.data) as ServerResponse;
        serverResponseReducer(data);
        break;
      }
      case 'Close':
        disconnect();
        break;
      default:
        return;
    }
  }, [disconnect, serverResponseReducer]);

  const connectWebsocket = useCallback(async (): Promise<WebSocket> => {
    const ws = await WebSocket.connect('ws://localhost:5225');
    ws.addListener(handleServerMessages);
    return ws;
  }, [handleServerMessages]);

  const sendChatCommand = useCallback(async (command: ChatCommand): Promise<ClientResponseData> => {
    return sendChatCommandStr(cmdString(command));
  }, []);

  const setAutoAccept = useCallback(async (value: boolean): Promise<ClientResponseData> => {
    const corrId = await sendChatCommand({ type: 'addressAutoAccept', autoAccept: { acceptIncognito: value } });
    return corrId;
  }, [sendChatCommand]);

  const createAddress = useCallback(async (): Promise<ClientResponseData> => {
    const corrId = await sendChatCommand({ type: 'createMyAddress' });
    return corrId;
  }, [sendChatCommand])

  const getActiveUser = useCallback(async (): Promise<string | null> => {
    if (!webSocketClient.current) {
      return null;
    }
    const corrId = Date.now().toString();
    await webSocketClient.current.send(JSON.stringify({
      cmd: `/u`,
      corrId,
    }));

    return corrId;
  }, []);

  const sendChatCommandStr = async (cmd: string): Promise<ClientResponseData> => {
    if (!webSocketClient.current) return { corrId: null };
    const id = `${++corrId.current}`;
    const payload = {
      corrId: id,
      cmd
    };
    await webSocketClient.current?.send(JSON.stringify(payload));
    return { corrId: id };
  }

  const sendMessages = async (chatType: ChatType, chatId: number, messages: ComposedMessage[]): Promise<ClientResponseData> => {
    return sendChatCommand({ type: 'apiSendMessage', chatId, chatType, messages });
  }

  const listContacts = useCallback(async () => {
    return await sendChatCommand({ type: "listContacts" } as unknown as ChatCommand);
  }, [sendChatCommand]);

  const initChatClient = useCallback(async () => {
    await createAddress();
    await getActiveUser();
    await setAutoAccept(true);
    // const res = await listUsers();
    await listContacts();
  }, [createAddress, getActiveUser, setAutoAccept, listContacts]);

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
  ]);

  const getChats = async (userId: number) => {
    return await sendChatCommand({ type: "apiGetChats", userId });
  }

  const listUsers = async () => {
    return await sendChatCommand({ type: "listUsers" });
  };

  return {
    setAutoAccept,
    createAddress,
    getActiveUser,
    sendChatCommand,
    sendMessages,
    getChats,
    listUsers,
    listContacts,
  }
}