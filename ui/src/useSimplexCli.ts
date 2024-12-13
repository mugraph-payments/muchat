import { useCallback, useEffect, useRef } from "react";
import {
  AChatItem,
  CRActiveUser,
  CRApiChats,
  CRContactsList,
  CRUserContactLink,
  CRUsersList,
  ServerResponse,
} from "./lib/response";
import useChatContext from "./useChatContext";
import { ChatClient } from "./lib/client";
import SimplexCli, { SpawnArgs } from "./lib/simplex";
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export enum SimplexError {
  AddressInUse,
}

export function useSimplexCli() {
  const cli = useRef<SimplexCli>(SimplexCli.getInstance());
  const connectionTimeout = useRef<NodeJS.Timeout>();
  const webSocketClient = useRef<ChatClient | null>(null);
  const firstRun = useRef(true);
  const {
    setIsConnected,
    addMessage,
    setDirectChats,
    setActiveUser,
    setContacts,
    setContactLink,
    setUsers,
  } = useChatContext();

  const serverResponseReducer = useCallback(
    (data: ServerResponse) => {
      addMessage(data);
      switch (data.resp.type) {
        case "newChatItems": {
          setDirectChats(data.resp.chatItems);
          break;
        }
        case "activeUser": {
          setActiveUser(data.resp.user);
          break;
        }
        default: {
          break;
        }
      }
    },
    [addMessage, setDirectChats, setActiveUser],
  );

  const initChatClient = useCallback(async () => {
    const client = webSocketClient.current;
    if (!client) throw new Error("Client is undefined");

    client.on("message", serverResponseReducer);
    await client.waitCommandResponse(await client.apiCreateAddress());

    const users = (await client.waitCommandResponse(
      await client.apiListUsers(),
    )) as CRUsersList;
    if (users.users.length) {
      setUsers(users.users);
    }

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

    const chatsData = (await client.waitCommandResponse(
      await client.apiGetChats(activeUserData.user.userId),
    )) as CRApiChats;
    chatsData?.chats?.forEach((chat) => {
      setDirectChats(
        chat.chatItems.map((chatItem) => ({
          chatInfo: chat.chatInfo,
          chatItem,
        })) as AChatItem[],
      );
    });
  }, [
    setUsers,
    setDirectChats,
    setActiveUser,
    setContacts,
    serverResponseReducer,
    setContactLink,
  ]);

  const connect = useCallback(
    async (retryIntervalMs = 1000, retries = 3) => {
      try {
        webSocketClient.current = await ChatClient.create(
          cli.current.options.serverDetails,
        );
        setIsConnected(true);
        initChatClient();
        console.log("🟩 Connected!");
      } catch (error) {
        if (retries > 0) {
          console.log(
            `🟨 Connection refused. Retrying in ${retryIntervalMs / 1000}s ... (${retries})`,
          );
          connectionTimeout.current = setTimeout(
            () => connect(retryIntervalMs, retries - 1),
            retryIntervalMs,
          );
        } else {
          console.log(`🟥 Connection Refused!\n`, error);
        }
      }
    },
    [setIsConnected, initChatClient],
  );

  const disconnect = useCallback(async () => {
    await webSocketClient.current?.disconnect();
    webSocketClient.current = null;
  }, []);

  const onCliReady: SpawnArgs["onReady"] = useCallback(() => {
    connect();
  }, [connect]);

  const onCliClose: SpawnArgs["onClose"] = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;

    async function spawnSimplexProcess() {
      await cli.current.spawn({
        onClose: onCliClose,
        onReady: onCliReady,
      });
    }
    spawnSimplexProcess();
  }, [onCliClose, onCliReady]);

  return webSocketClient;
}
