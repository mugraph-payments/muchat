import { useState } from 'react';
import classes from './chat.module.css';
import { useWebSocket } from './useWebSocket';
import ContactList from './components/ContactList/ContactList';

type ChatProps = {
  chatClient: ReturnType<typeof useWebSocket>;
};

const Chat = ({ chatClient }: ChatProps) => {
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

  return (
    <div className={classes.container}>
      <div>
        <div
          className={`${classes.status} ${
            chatClient.isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {chatClient.isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <ContactList chatClient={chatClient} />
      </div>

      <div id="messages" className={classes.chatBody}>
        {chatClient.messages.map((msg, index) => {
          return (
            <div className={classes.chatItem} key={index}>
              <span style={{ display: 'block' }}>{msg.resp.type}</span>
              {msg.resp.type === 'newChatItems' && (
                <span>
                  {msg.resp.chatItems.map((item, index) =>
                    item.chatItem.content.type === 'rcvMsgContent' ? (
                      <div key={index}>
                        {item.chatItem.content.msgContent.text}
                      </div>
                    ) : (
                      <div key={index}>Other message type</div>
                    ),
                  )}
                </span>
              )}
              {msg.resp.type !== 'newChatItems' && (
                <span>{JSON.stringify(msg)}</span>
              )}
            </div>
          );
        })}
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
