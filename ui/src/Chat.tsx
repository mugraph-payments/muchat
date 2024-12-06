import { useMemo } from "react";
import classes from "./chat.module.css";
import ContactList from "./components/ContactList/ContactList";
import useChatContext from "./useChatContext";
import { useWebSocket } from "./useWebSocket";
import { ChatItem, Contact } from "./lib/response";
import { ChatType } from "./lib/command";
import CommandConsole from "./components/CommandConsole/CommandConsole";
import MessageInput from "./components/MessageInput/MessageInput";

type MessageBubbleProps = {
  heading: string;
  children: React.ReactNode;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ heading, children }) => {
  return (
    <div className={classes.chatItem}>
      <span>{heading}</span>
      <div className="w-full">
        <span className="break-all">{children}</span>
      </div>
    </div>
  );
};

const Chat = () => {
  const client = useWebSocket();
  const { activeUser, contacts, isConnected, directChats, selectedChatId } =
    useChatContext();
  const selectedChat = useMemo(
    () =>
      selectedChatId === -1 ? [] : (directChats.get(selectedChatId) ?? []),
    [selectedChatId, directChats],
  );
  const selectedContact = useMemo(
    () => (selectedChatId === -1 ? null : contacts.get(selectedChatId)),
    [selectedChatId, contacts],
  );

  const handleSendMessage = async (message: string) => {
    if (message.trim() !== "") {
      await client.current?.apiSendMessages(ChatType.Direct, selectedChatId, [
        {
          msgContent: {
            type: "text",
            text: message,
          },
        },
      ]);
    }
  };

  const DirectChat = (messages: ChatItem[], contact: Contact | null) => {
    return messages.map((msg, index) => {
      return (
        <div key={index}>
          {msg.content.type === "rcvMsgContent" && (
            <MessageBubble
              heading={contact?.localDisplayName ?? "No Display Name"}
              key={index}
            >
              {msg.content.msgContent.text}
            </MessageBubble>
          )}
          {msg.content.type === "sndMsgContent" && (
            <MessageBubble
              heading={activeUser?.localDisplayName ?? "No Display Name"}
              key={index}
            >
              {msg.content.msgContent.text}
            </MessageBubble>
          )}
        </div>
      );
    });
  };

  const contactName = contacts.get(selectedChatId)?.localDisplayName;

  return (
    <div className={classes.container}>
      <div className="p-4 bg-theme-mantle w-full border-b-[1px] border-theme-base">
        <h2>{contactName ?? "Debug"}</h2>
      </div>
      <div className="bg-gray-800"></div>

      <div className="h-screen w-64 text-white"></div>
      <div>
        <CommandConsole client={client} />
        <div
          className={`${classes.status} ${
            isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </div>

        <ContactList client={client} />
      </div>

      <div id="messages" className={classes.chatBody}>
        {selectedChatId === -1
          ? null
          : DirectChat(selectedChat, selectedContact ?? null)}
      </div>
      <MessageInput onSubmit={handleSendMessage} />
    </div>
  );
};

export default Chat;
