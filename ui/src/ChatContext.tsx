import { createContext, useState, ReactNode, useCallback } from "react";
import {
  AChatItem,
  ChatInfoType,
  ChatItem,
  Contact,
  UserContactLink,
  ServerResponse,
  User,
  CRContactsList,
  CRActiveUser,
  CRUserContactLink,
} from "@/lib/response";
import { useWebSocket } from "./useWebSocket";

interface ChatContextType {
  client: ReturnType<typeof useWebSocket>;
  isConnected: boolean;
  setIsConnected: (c: boolean) => void;
  messages: ServerResponse[];
  setMessages: (msgs: ServerResponse[]) => void;
  addMessage: (msg: ServerResponse) => void;
  contacts: Map<number, Contact>;
  setContacts: (contacts: Map<number, Contact>) => void;
  setContact: (c: Contact) => void;
  directChats: Map<number, ChatItem[]>;
  setDirectChats: (chats: AChatItem[]) => void;
  selectedChatId: number;
  setSelectedChatId: (id: number) => void;
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  contactLink: UserContactLink | null;
  setContactLink: (c: UserContactLink) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const ws = useWebSocket({
    onConnected: () => {
      setIsConnected(true);
      initChatClient();
    },
  });
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ServerResponse[]>([]);
  const [contacts, setContacts] = useState<Map<number, Contact>>(new Map([]));
  const [directChats, setDirectChats] = useState<Map<number, ChatItem[]>>(
    new Map(),
  );
  const [selectedChatId, setSelectedChatId] = useState(-1);
  const [activeUser, setActiveUser] = useState<null | User>(null);
  const [contactLink, setContactLink] = useState<UserContactLink | null>(null);

  const addMessage = useCallback(
    (msg: ServerResponse) => setMessages((msgs) => [...msgs, msg]),
    [],
  );

  const updateDirectChats = useCallback(
    (chats: AChatItem[]) =>
      setDirectChats((curChats) => {
        const updatedDirectChats = new Map(curChats);
        chats.forEach((msg) => {
          if (msg.chatInfo.type === ChatInfoType.Direct) {
            const contact = msg.chatInfo.contact;

            if (!contacts.has(contact.contactId)) {
              setContacts((c) => {
                const newContacts = new Map(c);
                newContacts.set(contact.contactId, contact);
                return newContacts;
              });
            }

            const currentMessages =
              updatedDirectChats.get(contact.contactId) ?? [];
            updatedDirectChats.set(contact.contactId, [
              ...currentMessages,
              msg.chatItem,
            ]);
          }
        });
        return updatedDirectChats;
      }),
    [contacts],
  );

  const serverResponseReducer = useCallback(
    (data: ServerResponse) => {
      addMessage(data);
      switch (data.resp.type) {
        case "newChatItems": {
          updateDirectChats(data.resp.chatItems);
          break;
        }
        default: {
          break;
        }
      }
    },
    [addMessage, updateDirectChats],
  );

  const initChatClient = useCallback(async () => {
    const client = ws.current;
    if (!client) throw new Error("Client is undefined");
    client?.on("message", serverResponseReducer);
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
    if (contactsData) {
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
  }, [setActiveUser, setContacts, serverResponseReducer, setContactLink, ws]);

  return (
    <ChatContext.Provider
      value={{
        client: ws,
        isConnected,
        activeUser,
        setActiveUser,
        contactLink,
        setContactLink,
        setIsConnected,
        selectedChatId,
        setSelectedChatId,
        messages,
        setMessages,
        addMessage,
        contacts,
        setContact: (c) =>
          setContacts((curContacts) => {
            const newContacts = new Map(curContacts);
            newContacts.set(c.contactId, c);
            return newContacts;
          }),
        setContacts,
        directChats,
        setDirectChats: updateDirectChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, ChatContext };
