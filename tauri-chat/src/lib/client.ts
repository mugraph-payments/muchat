import WebSocket, { Message } from "@tauri-apps/plugin-websocket";
import { HOST, PORT } from "../config";
import { ServerResponse } from "../useWebSocket";
import { ChatCommand, ChatType, cmdString, ComposedMessage } from "./command";
import { ChatResponseTag } from "./response";

export interface ChatServer {
  readonly host: string;
  readonly port?: string;
}

export const localServer: ChatServer = {
  host: HOST,
  port: PORT,
};

export type ChatClientEvents = "message" | ChatResponseTag;

export class ChatClient {
  private corrId = 0;
  private static instance: ChatClient;
  private ws: WebSocket;
  private callbacks: Map<string, ((data: ServerResponse) => void)[]> =
    new Map();
  // private sentCommands: Map<string, ChatCommand> = new Map();
  public isConnected = false;

  private constructor(ws: WebSocket) {
    this.ws = ws;
  }

  static async create(
    serverDetails: ChatServer | string = localServer,
  ): Promise<ChatClient> {
    if (ChatClient.instance) return ChatClient.instance;
    const ws = await WebSocket.connect(
      typeof serverDetails === "string"
        ? serverDetails
        : `${serverDetails.host}:${serverDetails.port}`,
    );
    const chatClient = new ChatClient(ws);
    chatClient.setIsConnected = true;
    ChatClient.instance = chatClient;

    ws.addListener(chatClient.handleServerMessages.bind(chatClient));

    return ChatClient.instance;
  }

  async handleServerMessages(message: Message) {
    switch (message.type) {
      case "Text": {
        const data = JSON.parse(message.data) as ServerResponse;

        // Notify corrId listeners
        const corrId = data.corrId;
        if (corrId) {
          const corrIdCallbacks = this.callbacks.get(corrId);
          corrIdCallbacks?.forEach((c) => c(data));
        }

        // Notify event listeners
        const eventCallbacks = this.callbacks.get(message.type);
        eventCallbacks?.forEach((c) => c(data));

        const messageCallbacks = this.callbacks.get("message");
        messageCallbacks?.forEach((c) => c(data));
        break;
      }
      case "Close":
        this.disconnect();
        break;
      default:
        return;
    }
  }

  public async sendCommandSync(
    command: ChatCommand,
  ): Promise<ServerResponse["resp"]> {
    const corrId = await this.sendChatCommandStr(cmdString(command));
    return new Promise((resolve) => {
      this.callbacks.set(corrId, [(data) => resolve(data.resp)]);
    });
  }

  public async waitCommandResponse(corrId: string) {
    return new Promise((resolve) =>
      this.callbacks.set(corrId, [(data) => resolve(data.resp)]),
    );
  }

  public on(
    messageType: ChatClientEvents,
    cb: (data: ServerResponse) => Promise<void> | void,
  ) {
    const current = this.callbacks.get(messageType);
    this.callbacks.set(messageType, [...(current ?? []), cb]);
  }

  public async sendChatCommand(command: ChatCommand): Promise<string> {
    return this.sendChatCommandStr(cmdString(command));
  }

  public async sendChatCommandStr(cmd: string): Promise<string> {
    const id = `${this.corrId++}`;
    const payload = {
      corrId: id,
      cmd,
    };
    await this.ws.send(JSON.stringify(payload));
    return id;
  }

  async apiSendMessages(
    chatType: ChatType,
    chatId: number,
    messages: ComposedMessage[],
  ): Promise<string> {
    return this.sendChatCommand({
      type: "apiSendMessage",
      chatId,
      chatType,
      messages,
    });
  }

  async apiListContacts(userId: string) {
    return await this.sendChatCommand({
      type: "listContacts",
      userId,
    });
  }

  async apiSetAutoAccept() {
    return await this.sendChatCommand({
      type: "addressAutoAccept",
      autoAccept: { acceptIncognito: true },
    });
  }

  async apiCreateAddress() {
    return await this.sendChatCommand({ type: "createMyAddress" });
  }

  async apiGetActiveUser() {
    return await this.sendChatCommand({ type: "showActiveUser" });
  }

  async apiListUsers() {
    return await this.sendChatCommand({ type: "listUsers" });
  }

  async apiGetChats(userId: number) {
    return await this.sendChatCommand({ type: "apiGetChats", userId });
  }

  public async disconnect() {
    await this.ws.disconnect();
    this.setIsConnected = false;
  }

  public get getIsConnected() {
    return this.isConnected;
  }

  public set setIsConnected(value: boolean) {
    this.isConnected = value;
  }
}
