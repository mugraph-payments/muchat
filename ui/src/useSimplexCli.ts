import { useCallback, useEffect, useRef, useState } from "react";
import {
  CRActiveUser,
  CRContactsList,
  CRUserContactLink,
  ServerResponse,
} from "./lib/response";
import useChatContext from "./useChatContext";
import { ChatClient, ChatServer } from "./lib/client";
import { Child, Command, TerminatedPayload } from "@tauri-apps/plugin-shell";
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

export enum SimplexError {
  AddressInUse,
}

export async function spawnSimplexServer(
  serverDetails: ChatServer,
  onClose: (data: TerminatedPayload, error?: SimplexError) => void,
) {
  const dbPath = await getDatabasePath();
  const command = Command.create("simplex-chat", [
    "-p",
    serverDetails.port ?? PORT,
    "-d",
    dbPath,
  ]);
  const child = await command.spawn();
  let error_type: SimplexError | null = null;

  command.on("close", (data) => {
    onClose(data, error_type ?? undefined);
  });
  command.on("error", (error) => {
    console.error(`command error: "${error}"`);
  });
  command.stdout.on("data", (line) => handleSimplexData(child, line));
  command.stderr.on("data", (line) => handleSimplexStderr(line));
  console.log(`🟦 Spawned process with PID ${child.pid}`);

  async function handleSimplexStderr(line: string) {
    if (line.match("Address already in use")) {
      error_type = SimplexError.AddressInUse;
    }
  }

  async function handleSimplexData(process: Child, line: string) {
    console.log(`> ${line}`);
    if (line.match("No user profiles found, it will be created now.")) {
      console.log(`🟨 Initializing local database`);
      await process.write(DATABASE_DISPLAY_NAME + "\n");
    }
  }

  return child;
}

export function useSimplexCli() {
  const connectionTimeout = useRef<NodeJS.Timeout>();
  const simplexProcess = useRef<Child | null>(null);
  const webSocketClient = useRef<ChatClient | null>(null);
  const [serverDetails, setServerDetails] = useState(ChatClient.localServer);
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
        webSocketClient.current = await ChatClient.create(serverDetails);
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
    }

    async function handlePortInUse() {
      // Update port and try again
      ChatClient.localServer = {
        ...ChatClient.localServer,
        port: (parseInt(ChatClient.localServer.port ?? PORT) + 1).toString(),
      };

      // Disconnect WebSocket if connected
      if (webSocketClient.current) {
        await webSocketClient.current.disconnect();
        webSocketClient.current = null;
      }

      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
      }
      firstRun.current = true;
      simplexProcess.current = null;

      setServerDetails(ChatClient.localServer);
    }

    if (!simplexProcess.current) {
      spawnSimplexServer(serverDetails, (_, error) => {
        if (error === SimplexError.AddressInUse) {
          console.log(`🟨 Address already in use. Trying next available.`);
          handlePortInUse();
          simplexProcess.current = null;
        }
      }).then((child) => {
        simplexProcess.current = child;
        connectionTimeout.current = setTimeout(() => connect(), 1000);
      });
    } else {
      connect();
    }

    return () => {
      // webSocketClient.current?.disconnect();
    };
  }, [webSocketClient, setIsConnected, initChatClient, serverDetails]);

  useEffect(() => {
    return () => {
      webSocketClient.current?.disconnect();
    };
  }, [webSocketClient]);

  return webSocketClient;
}
