import { createContext, useState, ReactNode } from 'react';
import { ServerResponse } from './useWebSocket';
import { AChatItem, ChatInfoType, ChatItem, Contact } from './lib/response';

interface ChatContextType {
  isConnected: boolean;
  setIsConnected: (c: boolean) => void;
  messages: ServerResponse[];
  setMessages: (msgs: ServerResponse[]) => void;
  addMessage: (msg: ServerResponse) => void;
  contacts: Map<number, Contact>;
  setContacts: (c: Contact) => void;
  directChats: Map<number, ChatItem[]>;
  setDirectChats: (chats: AChatItem[]) => void;
  selectedChatId: number;
  setSelectedChatId: (id: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ServerResponse[]>([]);
  const [contacts, setContacts] = useState<Map<number, Contact>>(new Map());
  const [directChats, setDirectChats] = useState<Map<number, ChatItem[]>>(
    new Map(),
  );
  const [selectedChatId, setSelectedChatId] = useState(-1);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        setIsConnected,
        selectedChatId,
        setSelectedChatId,
        messages,
        setMessages,
        addMessage: (msg) => setMessages((msgs) => [...msgs, msg]),
        contacts,
        setContacts: (c) =>
          setContacts((curContacts) => {
            const newContacts = new Map(curContacts);
            newContacts.set(c.contactId, c);
            return newContacts;
          }),
        directChats,
        setDirectChats: (chats) =>
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, ChatContext };
