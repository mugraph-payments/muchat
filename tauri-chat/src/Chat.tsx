import { useMemo, useState } from "react";
import classes from "./chat.module.css";
import ContactList from "./components/ContactList/ContactList";
import useChatContext from "./useChatContext";
import { ServerResponse, useWebSocket } from "./useWebSocket";
import { ChatItem, Contact } from "./lib/response";
import { ChatType } from "./lib/command";

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
      client.sendMessages(ChatType.Direct, selectedChatId, [
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
        <div className={classes.chatItem} key={index}>
          <span style={{ display: "block" }}>{msg.resp.type}</span>
          <span>{JSON.stringify(msg)}</span>
        </div>
      );
    });
  };

  const DirectChat = (messages: ChatItem[], contact: Contact | null) => {
    return messages.map((msg, index) => {
      return (
        <>
          <span>
            {msg.content.type === "rcvMsgContent" && (
              <div key={index}>
                <span>{contact?.localDisplayName}</span>
                <div>{msg.content.msgContent.text}</div>
              </div>
            )}
            {msg.content.type === "sndMsgContent" && (
              <div key={index}>
                <span>{activeUser?.localDisplayName}</span>
                <div>{msg.content.msgContent.text}</div>
              </div>
            )}
          </span>
        </>
      );
    });
  };

  return (
    <div className={classes.container}>

    <div className="bg-gray-800"></div>

  <div className="h-screen w-64 text-white">
    </div>
      <div>
        <div
          className={`${classes.status} ${
            isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </div>
        <ContactList />
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
        <button onClick={handleSendMessage} className={classes.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
