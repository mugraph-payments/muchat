import { createContext, useState, ReactNode, useCallback } from "react";
import {
  AChatItem,
  ChatItem,
  Contact,
  UserContactLink,
  ServerResponse,
  User,
  UserInfo,
  ChatInfoType,
  Group,
  GroupInfo,
} from "@/lib/response";
import { useSimplexCli } from "./useSimplexCli";
import { ChatType } from "./lib/command";

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
  directChats: Map<string, ChatItem[]>;
  setDirectChats: (chats: AChatItem[]) => void;
  selectedChatId: string;
  setSelectedChatId: (id: string) => void;
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  contactLink: UserContactLink | null;
  setContactLink: (c: UserContactLink) => void;
  groups: Map<number, Group>;
  setGroups: (groups: Map<number, Group>) => void;
}

export const getChatKey = ({
  contact,
  group,
}: {
  contact?: Contact;
  group?: GroupInfo;
}) => {
  return contact
    ? `${ChatType.Direct}${contact.contactId}`
    : group
      ? `${ChatType.Group}${group.groupId}`
      : "";
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ServerResponse[]>([]);
  const [contacts, setContacts] = useState<Map<number, Contact>>(new Map([]));
  const [groups, setGroups] = useState<Map<number, Group>>(new Map());
  const [directChats, setDirectChats] = useState<Map<string, ChatItem[]>>(
    new Map(),
  );
  const [selectedChatId, setSelectedChatId] = useState("");

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

            // Append to contacts if not there
            if (!contacts.has(contact.contactId)) {
              setContacts((c) => {
                const newContacts = new Map(c);
                newContacts.set(contact.contactId, contact);
                return newContacts;
              });
            }

            const chatKey = getChatKey({ contact });
            const currentMessages = updatedDirectChats.get(chatKey) ?? [];
            updatedDirectChats.set(chatKey, [...currentMessages, msg.chatItem]);
          }

          if (msg.chatInfo.type === ChatInfoType.Group) {
            const group = msg.chatInfo.groupInfo;

            // Append to groups if not there
            if (!groups.has(group.groupId)) {
              setGroups((g) => {
                const newGroups = new Map(g);
                newGroups.set(group.groupId, { groupInfo: group, members: [] });
                return newGroups;
              });
            }

            const chatKey = getChatKey({ group });
            const currentMessages = updatedDirectChats.get(chatKey) ?? [];
            updatedDirectChats.set(chatKey, [...currentMessages, msg.chatItem]);
          }
        });
        return updatedDirectChats;
      });
    },
    [contacts, groups],
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
      if (!users.find((u) => u.user.userId === data.user.userId)) {
        // Update users to include new user
        client.current?.apiListUsers();
      }
      client.current?.apiListContacts(data.user.userId.toString());
      setActiveUser(data.user);
      setSelectedChatId("");
    },
    onChat: (data) => {
      switch (data.chat.chatInfo.type) {
        case ChatInfoType.Direct: {
          const newChatItems = data.chat.chatItems;
          const contact = data.chat.chatInfo.contact;
          setDirectChats((chats) => {
            chats.set(getChatKey({ contact }), newChatItems);
            return chats;
          });
          break;
        }
        case ChatInfoType.Group: {
          const newChatItems = data.chat.chatItems;
          const group = data.chat.chatInfo.groupInfo;
          setDirectChats((chats) => {
            chats.set(getChatKey({ group }), newChatItems);
            return chats;
          });
          break;
        }
      }
    },
    onNewChatItems: (data) => updateDirectChats(data.chatItems),
    onUserList: (data) => setUsers(data.users),
    onUserContactLink: (data) => setContactLink(data.contactLink),
    onContactsList: (data) => {
      // Fetch chat for each contact
      data.contacts.forEach((contact) => {
        client.current?.apiGetChat(ChatType.Direct, contact.contactId);
      });
      setContacts(
        new Map(data.contacts.map((contact) => [contact.contactId, contact])),
      );
    },
    onGroups: ({ groups }) => {
      const newGroups = new Map<number, Group>();
      groups.forEach(([groupInfo]) => {
        newGroups.set(groupInfo.groupId, { groupInfo, members: [] });
        client.current?.apiGetChat(ChatType.Group, groupInfo.groupId);
      });
      setGroups(newGroups);
    },
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
        groups,
        setGroups,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, ChatContext };
