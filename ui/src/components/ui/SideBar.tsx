import useChatContext from "@/useChatContext";
import ContactListv2 from "@/components/features/contacts/ContactList";
import { Separator } from "@/components/ui/Separator";
import ActiveUserToggle from "@/components/features/user/ActiveUserSelect";
import { UserSettingsDialog } from "../features/user/UserSettings";
import SearchBar from "../features/contacts/SearchBar";

function SideBar() {
  const { client, activeUser, contacts, users } = useChatContext();
  return (
    <div className="bg-theme-mantle flex flex-col p-4 gap-2 border-r-[1px] border-theme-base">
      <h1 className="text-2xl">Chats ({contacts.size})</h1>
      <Separator />
      <div>
        <SearchBar />
        <ContactListv2 />
      </div>
      <div className="mt-auto space-y-2">
        <UserSettingsDialog />
        <ActiveUserToggle
          activeUser={activeUser}
          users={users}
          onSelect={(userId) => {
            client.current?.apiSetActiveUser(userId);
          }}
        />
      </div>
    </div>
  );
}

export default SideBar;
