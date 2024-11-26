import { useMemo, useState } from 'react';
import classes from './chat.module.css';
import ContactList from './components/ContactList/ContactList';
import useChatContext from './useChatContext';
import { ServerResponse, useWebSocket } from './useWebSocket';
import { ChatItem } from './lib/response';

const Chat = () => {
  useWebSocket();
  const {
    messages: allMessages,
    isConnected,
    directChats,
    selectedChatId,
  } = useChatContext();
  const selectedChat = useMemo(
    () => (selectedChatId === -1 ? [] : directChats.get(selectedChatId) ?? []),
    [selectedChatId, directChats],
  );

  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      // client.sendMessages()
      setMessage('');
    }
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const DebugChat = (messages: ServerResponse[]) => {
    return messages.map((msg, index) => {
      return (
        <div className={classes.chatItem} key={index}>
          <span style={{ display: 'block' }}>{msg.resp.type}</span>
          {msg.resp.type !== 'newChatItems' && (
            <span>{JSON.stringify(msg)}</span>
          )}
        </div>
      );
    });
  };

  const DirectChat = (messages: ChatItem[]) => {
    return messages.map((msg, index) => {
      return (
        <>
          <span>
            {msg.content.type === 'rcvMsgContent' ? (
              <div key={index}>{msg.content.msgContent.text}</div>
            ) : (
              <div key={index}>Other message type</div>
            )}
          </span>
        </>
      );
    });
  };

  return (
    <div className={classes.container}>
      <div>
        <div
          className={`${classes.status} ${
            isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <ContactList />
      </div>

      <div id="messages" className={classes.chatBody}>
        {selectedChatId === -1
          ? DebugChat(allMessages)
          : DirectChat(selectedChat)}
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
