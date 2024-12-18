import Chat from "@/Chat";
import SideBar from "@/components/SideBar/SideBar";
import { Toaster } from "@/components/Sonner";

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
