import useChatContext from "../../useChatContext";

function ContactListv2() {
  const { contacts } = useChatContext();

  return (
    <div className="flex flex-col">
      {[...contacts].map(([_, contact], index) => {
          return (
            <button
              key={index}
              className="hover:bg-gray-100/50 hover:rounded-md transition-colors duration-200 p-2 text-center"
            >
              {contact.localDisplayName}
            </button>
          );
        })}
    </div>
  );
}

export default ContactListv2;
