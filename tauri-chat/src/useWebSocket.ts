import WebSocket, { Message } from '@tauri-apps/plugin-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AChatItem, ChatInfoType, ChatItem, ChatResponse, Contact } from './lib/response';
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
  const [contacts, setContacts] = useState<Map<number, Contact>>(new Map())
  const [directChats, setDirectChats] = useState<Map<number, ChatItem[]>>(new Map());
  const firstRun = useRef(true);

  const handleNewChatMessages = useCallback((newMessages: AChatItem[]) => {
    setContacts((prevContacts) => {
      const updatedContacts = new Map(prevContacts);
      newMessages.forEach((msg) => {
        if (msg.chatInfo.type === ChatInfoType.Direct) {
          const contact = msg.chatInfo.contact;
          if (!updatedContacts.has(contact.contactId)) {
            updatedContacts.set(contact.contactId, contact);
          }
        }
      });
      return updatedContacts;
    });

    setDirectChats((prevDirectChats) => {
      const updatedDirectChats = new Map(prevDirectChats);
      newMessages.forEach((msg) => {
        if (msg.chatInfo.type === ChatInfoType.Direct) {
          const contact = msg.chatInfo.contact;
          const currentMessages = updatedDirectChats.get(contact.contactId) ?? [];
          updatedDirectChats.set(contact.contactId, [...currentMessages, msg.chatItem]);
        }
      });
      return updatedDirectChats;
    });
  }, []);

  const disconnect = useCallback(async () => {
    await webSocketClient.current?.disconnect();
    setIsConnected(false);
  }, []);

  const serverResponseReducer = useCallback((data: ServerResponse) => {
    setMessages((msgs) => [...msgs, data]);
    switch (data.resp.type) {
      case 'newChatItems': {
        handleNewChatMessages(data.resp.chatItems);
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
    messages,
    contacts,
    directChats,
    isConnected,
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