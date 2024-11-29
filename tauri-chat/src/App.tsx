import Chat from "./Chat";
import SideBar from "./components/SideBar/SideBar";

function App() {
  return (
    <main className="flex gap-4">
      <SideBar />
      <Chat />
    </main>
  );
}

export default App;
