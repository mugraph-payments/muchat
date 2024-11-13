import './App.css';
import { useWebSocket } from './useWebSocket';

function App() {
  const client = useWebSocket();

  return (
    <main id="chatBody">
      <div>
        <div>{client.isConnected ? 'Connected' : 'Disconnected'}</div>
      </div>

      <div id="messages">
        {client.messages.map((msg) => {
          return <div>{JSON.stringify(msg)}</div>;
        })}
      </div>
    </main>
  );
}

export default App;
