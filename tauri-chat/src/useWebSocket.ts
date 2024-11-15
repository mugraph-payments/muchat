import WebSocket, { Message } from '@tauri-apps/plugin-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AChatItem, ChatInfoType, ChatResponse, Contact, } from './lib/response';
import { ChatCommand, ChatType, cmdString, ComposedMessage } from './lib/command';
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
  const [isConnected, setIsConnected] = useState(false);
  const webSocketClient = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ServerResponse[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([])
  const firstRun = useRef(true);

  const disconnect = useCallback(async () => {
    await webSocketClient.current?.disconnect();
    setIsConnected(false);
  }, []);

  const handleNewChatMessages = useCallback((messages: AChatItem[]) => {
    const newContacts = new Set(contacts);
    messages.forEach((msg) => {
      switch (msg.chatInfo.type) {
        case ChatInfoType.Direct: {
          const contact = msg.chatInfo.contact;
          newContacts.add(contact);
          break;
        }
        default: {
          return;
        }
      }
    });
    setContacts([...newContacts]);
  }, [contacts])

  const serverResponseReducer = useCallback((data: ServerResponse) => {
    // Add to global messages
    setMessages((msgs) => [...msgs, data]);
    console.log(data);

    switch (data.resp.type) {
      case 'newChatItems': {
        handleNewChatMessages(data.resp.chatItems)
        break;
      }
      default:
        {
          break;
        }
    }
  }, [handleNewChatMessages])

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
  }, [handleServerMessages])

  const setAutoAccept = async (value: boolean): Promise<ClientResponseData> => {
    const corrId = await sendChatCommand({ type: 'addressAutoAccept', autoAccept: { acceptIncognito: value } });
    return corrId;
  }

  const createAddress = async (): Promise<ClientResponseData> => {
    const corrId = await sendChatCommand({ type: 'createMyAddress' });
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

  const sendChatCommand = async (command: ChatCommand): Promise<ClientResponseData> => {
    return sendChatCommandStr(cmdString(command));
  }

  const sendMessages = async (chatType: ChatType, chatId: number, messages: ComposedMessage[]): Promise<ClientResponseData> => {
    return sendChatCommand({ type: 'apiSendMessage', chatId, chatType, messages });
  }

  const initChatClient = useCallback(async () => {
    await createAddress();
    await getActiveUser();
    await setAutoAccept(true);
    // const res = await listUsers();
    await listContacts();
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

  const getChats = async (userId: number) => {
    return await sendChatCommand({ type: "apiGetChats", userId });
  }

  const listUsers = async () => {
    return await sendChatCommand({ type: "listUsers" });
  };

  const listContacts = async () => {
    return await sendChatCommand({ type: "listContacts" } as unknown as ChatCommand);
  }

  return {
    isConnected,
    messages,
    contacts,
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