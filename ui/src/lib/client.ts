import WebSocket, { Message } from "@tauri-apps/plugin-websocket";
import { HOST, PORT } from "@/config";
import {
  ChatCommand,
  ChatCommandMessage,
  ChatPagination,
  ChatType,
  cmdString,
  ComposedMessage,
  Profile,
} from "@/lib/command";
import { ChatResponse, ChatResponseTag, ServerResponse } from "@/lib/response";

export interface SimplexServerDetails {
  readonly host: string;
  readonly port?: string;
}

export type ChatClientEvents = "message" | ChatResponseTag;
export type ChatClientMessageBundle = ChatCommandMessage & {
  response?: ChatResponse;
};

export enum ConnReqType {
  Invitation = "invitation",
  Contact = "contact",
}

export class ChatClient {
  private corrId = 0;
  private static instance: ChatClient | null = null;
  private ws: WebSocket;
  private callbacks: Map<string, ((data: ServerResponse) => void)[]> =
    new Map();
  private sentCommands: Map<string, ChatClientMessageBundle> = new Map();
  public isConnected = false;
  static localServer: SimplexServerDetails = {
    host: HOST,
    port: PORT,
  };

  private constructor(ws: WebSocket) {
    this.ws = ws;
  }

  static async create(
    serverDetails: SimplexServerDetails | string = ChatClient.localServer,
  ): Promise<ChatClient> {
    // TODO: detect change in server endpoint and disconnect if needed
    if (ChatClient.instance) return ChatClient.instance;
    const simplexEndpoint =
      typeof serverDetails === "string"
        ? serverDetails
        : `${serverDetails.host}:${serverDetails.port}`;

    console.log(`🟦 Connecting to ${simplexEndpoint}`);
    const ws = await WebSocket.connect(simplexEndpoint);
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
        // this.disconnect();
        break;
      default:
        return;
    }
  }

  public async sendCommandSync(
    command: ChatCommand,
  ): Promise<ServerResponse["resp"]> {
    const corrId = await this.sendChatCommandStr(cmdString(command));
    return this.waitCommandResponse(corrId);
  }

  public async waitCommandResponse(
    corrId: string,
  ): Promise<ServerResponse["resp"]> {
    const commandBundle = this.sentCommands.get(corrId);
    if (commandBundle?.response) return commandBundle.response;
    return new Promise((resolve) => {
      const callbacks = this.callbacks.get(corrId);
      const callback = (data: ServerResponse) => resolve(data.resp);
      if (callbacks) {
        callbacks.push(callback);
      } else {
        this.callbacks.set(corrId, [callback]);
      }
    });
  }

  public on(
    messageType: ChatClientEvents,
    cb: (data: ServerResponse) => Promise<void> | void,
  ) {
    const current = this.callbacks.get(messageType);
    this.callbacks.set(messageType, [...(current ?? []), cb]);
  }

  // TODO: remove event listener

  public async sendChatCommand(command: ChatCommand): Promise<string> {
    return this.sendChatCommandStr(cmdString(command));
  }

  public async sendChatCommandStr(cmd: string): Promise<string> {
    const id = `${this.corrId++}`;
    const payload: ChatClientMessageBundle = {
      corrId: id,
      cmd,
    };

    this.sentCommands.set(id, payload);
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

  async apiGetUserAddress() {
    return await this.sendChatCommand({ type: "showMyAddress" });
  }

  async apiGetActiveUser() {
    return await this.sendChatCommand({ type: "showActiveUser" });
  }

  async apiListUsers() {
    return await this.sendChatCommand({ type: "listUsers" });
  }

  async apiCreateUser(
    profile: Profile,
    sameServers?: boolean,
    pastTimestamp?: boolean,
  ) {
    return await this.sendChatCommand({
      type: "createActiveUser",
      profile,
      sameServers: sameServers || true,
      pastTimestamp: pastTimestamp || false,
    });
  }

  async apiDeleteUser(userId: number, delSMPQueues = true) {
    return await this.sendChatCommand({
      type: "apiDeleteUser",
      userId,
      delSMPQueues,
    });
  }

  async apiGetChats(userId: number) {
    return await this.sendChatCommand({ type: "apiGetChats", userId });
  }

  async apiSetActiveUser(userId: number) {
    return await this.sendChatCommand({
      type: "apiSetActiveUser",
      userId,
    });
  }

  async apiGetChat(
    chatType: ChatType,
    chatId: number,
    pagination: ChatPagination = { count: 100 },
    search: string | undefined = undefined,
  ) {
    return await this.sendChatCommand({
      type: "apiGetChat",
      chatType,
      chatId,
      pagination,
      search,
    });
  }

  async apiConnect(connReq: string) {
    return await this.sendChatCommand({ type: "connect", connReq });
  }

  public async disconnect() {
    console.log(`🟥 Disconnecting ...`);
    await this.ws.disconnect().catch((e) => console.error(e));
    ChatClient.instance = null;
    this.setIsConnected = false;
  }

  public get getIsConnected() {
    return this.isConnected;
  }

  public set setIsConnected(value: boolean) {
    this.isConnected = value;
  }
}
