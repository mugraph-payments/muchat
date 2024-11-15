import { useState } from 'react';
import classes from './chat.module.css';
import { useWebSocket } from './useWebSocket';

const Chat = () => {
  const client = useWebSocket();
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

  console.log(client.contacts);

  return (
    <div className={classes.container}>
      <div>
        <div
          className={`${classes.status} ${
            client.isConnected ? classes.connected : classes.disconnected
          }`}
        >
          {client.isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div id="messages" className={classes.chatBody}>
        {client.messages.map((msg, index) => {
          return (
            <div className={classes.chatItem} key={index}>
              <span style={{ display: 'block' }}>{msg.resp.type}</span>
              {msg.resp.type === 'newChatItems' && (
                <span>
                  {msg.resp.chatItems.map((item, index) =>
                    item.chatItem.content.type === 'rcvMsgContent' ? (
                      <div key={index}>{item.chatItem.content.msgContent.text}</div>
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

      <div>
        {
          client.contacts.map((client) => {
            return (
              <div>
                ContactId: {
                  client.contactId
                }

                DisplayName: {
                  client.localDisplayName
                }
                </div>
            )
          })
        }
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
