import Chat from "@/components/features/chat/Chat";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar";
import { Toaster } from "@/components/ui/Sonner";
import { AppSidebar } from "./components/features/AppSidebar";

function App() {
  return (
    <SidebarProvider>
      <main className="flex w-full">
        <AppSidebar />
        <SidebarTrigger />
        <Chat />
      </main>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
