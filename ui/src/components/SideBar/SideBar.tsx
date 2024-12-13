import useChatContext from "@/useChatContext";
import ContactListv2 from "@/components/ContactList/ContactListV2";
import { Separator } from "@/components/Separator";
import ActiveUserToggle from "../ActiveUserSelect/ActiveUserSelect";
import { useSimplexCli } from "@/useSimplexCli";

type SideBarProps = {
  client: ReturnType<typeof useSimplexCli>;
};

function SideBar({ client }: SideBarProps) {
  const { activeUser, contacts, users } = useChatContext();
  return (
    <div className="bg-theme-mantle flex flex-col p-4 gap-2 border-r-[1px] border-theme-base">
      <h1 className="text-2xl">Chats ({contacts.size})</h1>
      <Separator />
      <div>
        <ContactListv2 />
      </div>
      <div className="mt-auto">
        <ActiveUserToggle
          activeUser={activeUser}
          users={users}
          onSelect={(userId) => client.current?.apiSetActiveUser(userId)}
        />
      </div>
    </div>
  );
}

export default SideBar;
