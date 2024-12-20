import Chat from "@/components/features/chat/Chat";
import { SidebarProvider } from "@/components/ui/Sidebar";
import { Toaster } from "@/components/ui/Sonner";
import { AppSidebar } from "./components/features/AppSidebar";

function App() {
  return (
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col">
        <main className="flex flex-1 w-full overflow-hidden">
          <AppSidebar />
          <Chat />
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;
