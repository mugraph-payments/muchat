import useChatContext from "../../useChatContext";
import Button from "../Button/Button";

function ContactListv2() {
  const { contacts } = useChatContext();

  return (
    <div className="flex flex-col gap-2">
      {[...contacts].map(([_, contact], index) => {
        return (
          <Button
            key={index}
          >
            {contact.localDisplayName}
          </Button>
        );
      })}
    </div>
  );
}

export default ContactListv2;
