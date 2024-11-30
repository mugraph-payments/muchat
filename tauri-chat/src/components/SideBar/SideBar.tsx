import useChatContext from "@/useChatContext";
import ContactListv2 from "@/components/ContactList/ContactListV2";

function SideBar() {
  const { contacts } = useChatContext();

  return (
    <div className="bg-theme-mantle flex flex-col items-center p-5 gap-2 border-r-[1px] border-theme-base">
      <h1 className="text-2xl">
        Chats ({contacts.size})
      </h1>

      <div>
        <ContactListv2 />
      </div>
    </div>
  );
}

export default SideBar;
