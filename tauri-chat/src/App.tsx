import { useWebSocket } from './useWebSocket';
import classes from './chat.module.css';

function App() {
  const client = useWebSocket();

  return (
    <main className={classes.container}>
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
                  {msg.resp.chatItems.map((item) =>
                    item.chatItem.content.type === 'rcvMsgContent' ? (
                      <div>{item.chatItem.content.msgContent.text}</div>
                    ) : (
                      <div>Other message type</div>
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
    </main>
  );
}

export default App;
