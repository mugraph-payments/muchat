import useChatContext from "@/useChatContext";
import ContactListv2 from "@/components/ContactList/ContactListV2";
import { Separator } from "@/components/Separator";

function SideBar() {
  const { contacts } = useChatContext();

  return (
    <div className="bg-theme-mantle flex flex-col p-4 gap-2 border-r-[1px] border-theme-base w-1/12">
      <h1 className="text-2xl">Chats ({contacts.size})</h1>
      <Separator />
      <div>
        <ContactListv2 />
      </div>
    </div>
  );
}

export default SideBar;
