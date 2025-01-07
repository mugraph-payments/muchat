import { useCallback, useEffect, useRef } from "react";
import {
  CRActiveUser,
  CRApiChat,
  CRApiChats,
  CRContactsList,
  CRGroupsList,
  CRNewChatItems,
  CRUserContactLink,
  CRUsersList,
  ServerResponse,
} from "./lib/response";
import { ChatClient } from "./lib/client";
import SimplexCli, { SpawnArgs } from "./lib/simplex";
// when using `"withGlobalTauri": true`, you may use
// const WebSocket = window.__TAURI__.websocket;

export enum SimplexError {
  AddressInUse,
}

type useSimplexProps = {
  onData?: (data: ServerResponse) => void;
  onNewChatItems?: (data: CRNewChatItems) => void;
  onActiveUser?: (data: CRActiveUser) => void;
  onUserList?: (data: CRUsersList) => void;
  onConnected?: (isConnected: boolean) => void;
  onUserContactLink?: (data: CRUserContactLink) => void;
  onContactsList?: (data: CRContactsList) => void;
  onChats?: (data: CRApiChats) => void;
  onChat?: (data: CRApiChat) => void;
  onGroups?: (data: CRGroupsList) => void;
};

export function useSimplexCli({ ...callbacks }: useSimplexProps) {
  const cli = useRef<SimplexCli>(SimplexCli.getInstance());
  const connectionTimeout = useRef<NodeJS.Timeout>();
  const webSocketClient = useRef<ChatClient | null>(null);
  const firstRun = useRef(true);

  const serverResponseReducer = useCallback(
    (data: ServerResponse) => {
      callbacks.onData?.(data);
      switch (data.resp.type) {
        case "newChatItems": {
          callbacks.onNewChatItems?.(data.resp);
          break;
        }
        case "activeUser": {
          callbacks.onActiveUser?.(data.resp);
          break;
        }
        case "userContactLink": {
          callbacks.onUserContactLink?.(data.resp);
          break;
        }
        case "usersList": {
          callbacks.onUserList?.(data.resp);
          break;
        }
        case "contactsList": {
          callbacks.onContactsList?.(data.resp);
          break;
        }
        case "apiChats": {
          callbacks.onChats?.(data.resp);
          break;
        }
        case "apiChat": {
          callbacks.onChat?.(data.resp);
          break;
        }
        case "groupsList": {
          callbacks.onGroups?.(data.resp);
          break;
        }
        default: {
          break;
        }
      }
    },
    [callbacks],
  );

  const initChatClient = useCallback(async () => {
    const client = webSocketClient.current;
    if (!client) throw new Error("Client is undefined");

    client.on("message", serverResponseReducer);

    await Promise.all([
      client.apiCreateAddress(),
      client.apiListUsers(),
      client.apiSetAutoAccept(),
      client.apiGetActiveUser(),
      client.listGroups(),
    ]);
  }, [serverResponseReducer]);

  const connect = useCallback(
    async (retryIntervalMs = 1000, retries = 3) => {
      try {
        webSocketClient.current = await ChatClient.create(
          cli.current.options.serverDetails,
        );
        callbacks.onConnected?.(true);
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
    [callbacks, initChatClient],
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
