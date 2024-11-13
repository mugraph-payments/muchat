import { useWebSocket } from './useWebSocket';
import classes from './chat.module.css';

function App() {
  const client = useWebSocket();

  return (
    <main className={classes.container}>
      <div>
        <div className={`${classes.status} ${client.isConnected ? classes.connected : classes.disconnected }`}>{client.isConnected ? 'Connected' : 'Disconnected'}</div>
      </div>

      <div id="messages" className={classes.chatBody}>
        {client.messages.map((msg, index) => {
          return <div className={classes.chatItem} key={index}>{JSON.stringify(msg)}</div>;
        })}
      </div>
    </main>
  );
}

export default App;
