import Chat from "@/Chat";
import SideBar from "@/components/SideBar/SideBar";
import { useSimplexCli } from "./useSimplexCli";

function App() {
  const client = useSimplexCli();

  return (
    <main className="flex">
      <SideBar client={client} />
      <Chat client={client} />
    </main>
  );
}

export default App;
