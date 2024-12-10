import { useCallback, useEffect, useRef } from "react";
import {
  CRActiveUser,
  CRContactsList,
  CRUserContactLink,
  ServerResponse,
} from "./lib/response";
import useChatContext from "./useChatContext";
import { ChatClient } from "./lib/client";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { path } from "@tauri-apps/api";
import { exists } from "@tauri-apps/plugin-fs";
import { DATABASE_DISPLAY_NAME, PORT } from "./config";
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export async function getBaseDirectory() {
  const dbPath = `${await path.appDataDir()}`;
  return dbPath;
}

export async function getDatabasePath() {
  return `${await getBaseDirectory()}/muchat-server.db_chat.db`;
}

export async function checkSimplexDatabase() {
  const dbPath = await getDatabasePath();
  return exists(dbPath);
}

export async function spawnSimplexServer() {
  const dbPath = await getDatabasePath();
  const command = Command.create("simplex-chat", ["-p", PORT, "-d", dbPath]);
  const child = await command.spawn();
  command.on("close", (data) => {
    console.log(
      `command finished with code ${data.code} and signal ${data.signal}`,
    );
  });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (line) => handleSimplexData(child, line));
  command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
  console.log(`🟦 Spawned process with PID ${child.pid}`);

  return child;
}

export async function handleSimplexData(process: Child, line: string) {
  console.log(`> ${line}`);
  if (line.match("No user profiles found, it will be created now.")) {
    console.log(`🟨 Initializing local database`);
    await process.write(DATABASE_DISPLAY_NAME + "\n");
  }
}

export function useWebSocket() {
  const simplexProcess = useRef<Child | null>(null);
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

    async function connect(retryIntervalMs = 1000, retries = 3) {
      try {
        webSocketClient.current = await ChatClient.create();
        setIsConnected(true);
        initChatClient();
        console.log("🟩 Connected!");
      } catch (error) {
        if (retries > 0) {
          console.log(
            `🟨 Connection refused. Retrying in ${retryIntervalMs / 1000}s ... (${retries})`,
          );
          setTimeout(
            () => connect(retryIntervalMs, retries - 1),
            retryIntervalMs,
          );
        } else {
          console.log(`🟥 Connection Refused!\n`, error);
        }
      }
    }

    if (!simplexProcess.current) {
      spawnSimplexServer().then((child) => {
        simplexProcess.current = child;
        setTimeout(() => connect(), 1000);
      });
    } else {
      connect();
    }

    return () => {
      // console.log("🟥 Disconnecting");
      webSocketClient.current?.disconnect();
    };
  }, [webSocketClient, setIsConnected, initChatClient]);

  return webSocketClient;
}
