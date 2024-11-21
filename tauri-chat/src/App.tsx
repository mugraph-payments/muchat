import Chat from './Chat';
import { useWebSocket } from './useWebSocket';

function App() {
  const webSocketClient = useWebSocket();
  return (
    <main>
      <Chat chatClient={webSocketClient} />
    </main>
  );
}

export default App;
