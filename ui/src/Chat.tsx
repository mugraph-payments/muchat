import { useMemo } from "react";
import classes from "@/chat.module.css";
import ContactList from "./components/ContactList/ContactList";
import useChatContext from "./useChatContext";
import { useWebSocket } from "./useWebSocket";
import { ChatItem, Contact, ServerResponse } from "./lib/response";
import { ChatType } from "./lib/command";
import CommandPanel from "./components/CommandPanel/CommandPanel";
import Button from "./components/Button/Button";
import { toast } from "sonner";
import useChatContext from "@/useChatContext";
import { ChatItem, Contact } from "@/lib/response";
import { ChatType } from "@/lib/command";
import MessageInput from "@/components/MessageInput/MessageInput";
import CommandConsole from "./components/CommandConsole/CommandConsole";
import { Avatar, AvatarFallback, AvatarImage } from "./components/Avatar";
import clsx from "clsx";

type MessageBubbleProps = {
  heading?: string;
  children: React.ReactNode;
  className?: string;
  limitMessageLenght?: boolean;
  side?: "left" | "right";
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  className,
  heading,
  children,
  limitMessageLenght = true,
  side = "left",
}) => {
  return (
    <div
      className={clsx(
        classes.chatItem,
        `${side === "right" && classes.chatItemRight}`,
        limitMessageLenght
          ? `max-h-44 overflow-hidden line-clamp-3 text-ellipsis`
          : null,
        className,
      )}
    >
      {heading && (
        <span className={`${classes.chatItemHeading}`}>{heading}</span>
      )}
      {children}
    </div>
  );
};

const Chat = () => {
  const {
    client,
    activeUser,
    contacts,
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
      setMessage("");
      toast("message sent successfully!");
    }
  };

  const DirectChat = (messages: ChatItem[], contact: Contact | null) => {
    return messages.map((msg, index) => {
      return msg.content.type === "sndMsgContent" ||
        msg.content.type === "rcvMsgContent" ? (
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
      ) : null;
    });
  };

  const contactName = selectedContact?.localDisplayName;
  const contactAvatar = selectedContact?.profile.image;

  return (
    <div className={classes.container}>
      <div className="p-4 bg-theme-mantle w-full border-b-[1px] border-theme-base flex">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage
              src={contactAvatar}
              alt={selectedContact?.localDisplayName}
            />
            <AvatarFallback>
              {contactName ? contactName.charAt(0).toUpperCase() : "D"}
            </AvatarFallback>
          </Avatar>
          <h2>{contactName ?? "Debug"}</h2>
        </div>
      </div>
      <div>
        <CommandConsole />
        <div
          className={`${classes.status} ${
            isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>
      <div className="flex flex-col h-full p-4 gap-2 overflow-hidden">
        <div id="messages" className={classes.chatBody}>
          {selectedChatId === -1
            ? null
            : DirectChat(selectedChat, selectedContact ?? null)}
        </div>
        <MessageInput onSubmit={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
