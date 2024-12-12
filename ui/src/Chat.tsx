import { useMemo, useState } from "react";
import classes from "./chat.module.css";
import ContactList from "./components/ContactList/ContactList";
import useChatContext from "./useChatContext";
import { useWebSocket } from "./useWebSocket";
import { ChatItem, Contact, ServerResponse } from "./lib/response";
import { ChatType } from "./lib/command";
import CommandPanel from "./components/CommandPanel/CommandPanel";
import Button from "./components/Button/Button";
import { Avatar, AvatarFallback } from "./components/Avatar";

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
  const {
    activeUser,
    contacts,
    messages: allMessages,
    isConnected,
    directChats,
    selectedChatId,
  } = useChatContext();
  const selectedChat = useMemo(
    () =>
      selectedChatId === -1 ? [] : (directChats.get(selectedChatId) ?? []),
    [selectedChatId, directChats],
  );
  const selectedContact = useMemo(
    () => (selectedChatId === -1 ? null : contacts.get(selectedChatId)),
    [selectedChatId, contacts],
  );

  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      client.current?.apiSendMessages(ChatType.Direct, selectedChatId, [
        {
          msgContent: {
            type: "text",
            text: message,
          },
        },
      ]);
      setMessage("");
    }
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const DebugChat = (messages: ServerResponse[]) => {
    return messages.map((msg, index) => {
      return (
        <MessageBubble key={index} heading={msg.resp.type}>
          {JSON.stringify(msg)}
        </MessageBubble>
      );
    });
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
      <div className="p-4 bg-theme-mantle w-full border-b-[1px] border-theme-base flex">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>
              {contactName ? contactName.charAt(0).toUpperCase() : "D"}
            </AvatarFallback>
          </Avatar>
          <h2>{contactName ?? "Debug"}</h2>
        </div>
      </div>
      <div className="bg-gray-800"></div>

      <div className="h-screen w-64 text-white"></div>
      <div>
        <CommandPanel client={client} />
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
          ? DebugChat(allMessages)
          : DirectChat(selectedChat, selectedContact ?? null)}
      </div>
      <div className={classes.messageBox}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className={classes.messageInput}
        />
        <Button onClick={handleSendMessage} className={classes.sendButton}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
