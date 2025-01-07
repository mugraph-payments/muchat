import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { Settings } from "lucide-react";
import ContactList from "./contacts/ContactList";
import { UserSettingsDialog } from "./user/UserSettings";
import ActiveUserSelect from "./user/ActiveUserSelect";
import useChatContext from "@/useChatContext";

const items = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    node: UserSettingsDialog,
  },
];

export function AppSidebar() {
  const { client, activeUser, users } = useChatContext();

  return (
    <Sidebar>
      <SidebarHeader className="mt-4">Muchat</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <ContactList />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto mb-4">
          <SidebarGroupContent>
            <div className="flex flex-col gap-4">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.node ? (
                        <div className="py-4">
                          <item.node>
                            <span className="flex items-center gap-2">
                              <item.icon />
                              <span className="relative translate-y-[1px]">
                                {item.title}
                              </span>
                            </span>
                          </item.node>
                        </div>
                      ) : (
                        <a href={item.url} className="inline-flex items-start">
                          <item.icon />
                          <span className="relative translate-y-[1px]">
                            {item.title}
                          </span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <ActiveUserSelect
                activeUser={activeUser}
                users={users}
                onSelect={(userId) => {
                  client.current?.apiSetActiveUser(userId);
                }}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
