import ContactListv2 from "../ContactList/ContactListV2";

function SideBar() {
  return (
    <div className="bg-theme-mantle flex flex-col items-center p-5 gap-2">
      <h1 className="text-2xl">Chats</h1>

      <div>
        <ContactListv2 />
      </div>
    </div>
  );
}

export default SideBar;
