import { createContext, useState, ReactNode, useCallback } from "react";
import {
  AChatItem,
  ChatInfoType,
  ChatItem,
  Contact,
  UserContactLink,
  ServerResponse,
  User,
  UserInfo,
} from "@/lib/response";
import { useSimplexCli } from "./useSimplexCli";

export interface ChatContextType {
  client: ReturnType<typeof useSimplexCli>;
  users: UserInfo[];
  setUsers: (users: UserInfo[]) => void;
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
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ServerResponse[]>([]);
  const [contacts, setContacts] = useState<Map<number, Contact>>(new Map([]));
  const [directChats, setDirectChats] = useState<Map<number, ChatItem[]>>(
    new Map(),
  );
  const [selectedChatId, setSelectedChatId] = useState(-1);
  const [activeUser, setActiveUser] = useState<null | User>(null);
  const [contactLink, setContactLink] = useState<UserContactLink | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const addMessage = useCallback(
    (msg: ServerResponse) => setMessages((msgs) => [...msgs, msg]),
    [],
  );
  const updateDirectChats = useCallback(
    (chats: AChatItem[]) => {
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
      });
    },
    [contacts],
  );
  const setContact = useCallback(
    (c: Contact) =>
      setContacts((curContacts) => {
        const newContacts = new Map(curContacts);
        newContacts.set(c.contactId, c);
        return newContacts;
      }),
    [],
  );
  const client = useSimplexCli({
    onData: addMessage,
    onConnected: setIsConnected,
    onActiveUser: (data) => {
      client.current?.apiListContacts(data.user.userId.toString());
      setActiveUser(data.user);
    },
    onNewChatItems: (data) => updateDirectChats(data.chatItems),
    onUserList: (data) => setUsers(data.users),
    onUserContactLink: (data) => setContactLink(data.contactLink),
    onContactsList: (data) =>
      setContacts(
        new Map(data.contacts.map((contact) => [contact.contactId, contact])),
      ),
  });

  return (
    <ChatContext.Provider
      value={{
        client,
        isConnected,
        activeUser,
        users,
        setUsers,
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
        setContact,
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
