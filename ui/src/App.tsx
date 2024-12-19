import Chat from "@/components/features/chat/Chat";
import SideBar from "@/components/ui/SideBar";
import { Toaster } from "@/components/ui/Sonner";

function App() {
  return (
    <>
      <main className="flex">
        <SideBar />
        <Chat />
      </main>
      <Toaster />
    </>
  );
}

export default App;
