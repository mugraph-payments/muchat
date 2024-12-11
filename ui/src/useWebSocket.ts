import { useCallback, useEffect, useRef } from "react";
import {
  CRActiveUser,
  CRContactsList,
  CRUserContactLink,
  ServerResponse,
} from "./lib/response";
import useChatContext from "./useChatContext";
import { ChatClient } from "./lib/client";
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export function useWebSocket() {
  const webSocketClient = useRef<ChatClient | null>(null);
  const firstRun = useRef(true);
  const {
    setIsConnected,
    addMessage,
    setDirectChats,
    setActiveUser,
    setContacts,
    setContactLink,
  } = useChatContext();

  const serverResponseReducer = useCallback(
    (data: ServerResponse) => {
      addMessage(data);
      switch (data.resp.type) {
        case "newChatItems": {
          setDirectChats(data.resp.chatItems);
          break;
        }
        default: {
          break;
        }
      }
    },
    [addMessage, setDirectChats],
  );

  const initChatClient = useCallback(async () => {
    const client = webSocketClient.current;
    if (!client) throw new Error("Client is undefined");

    client.on("message", serverResponseReducer);
    await client.waitCommandResponse(await client.apiCreateAddress());

    const activeUserData = (await client.waitCommandResponse(
      await client.apiGetActiveUser(),
    )) as CRActiveUser;
    setActiveUser(activeUserData.user);
    await client.apiSetAutoAccept();

    if (!activeUserData.user) return;
    const contactsData = (await client.waitCommandResponse(
      await client.apiListContacts(activeUserData.user.userId.toString()),
    )) as CRContactsList;
    if (contactsData && contactsData.contacts?.length) {
      const newContacts = new Map();
      contactsData.contacts.forEach((c) => {
        newContacts.set(c.contactId, c);
      });
      setContacts(newContacts);
    }

    const contactLink = (await client.waitCommandResponse(
      await client.apiGetUserAddress(),
    )) as CRUserContactLink;
    setContactLink(contactLink.contactLink ?? null);
  }, [setActiveUser, setContacts, serverResponseReducer, setContactLink]);

  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;

    console.log("🟩 Connecting...");
    async function connect() {
      webSocketClient.current = await ChatClient.create();
      setIsConnected(true);
      initChatClient();
    }
    connect();

    return () => {
      console.log("🟥 Disconnecting");
      webSocketClient.current?.disconnect();
    };
  }, [webSocketClient, setIsConnected, initChatClient]);

  return webSocketClient;
}
