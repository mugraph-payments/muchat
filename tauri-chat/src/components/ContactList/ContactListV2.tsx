import useChatContext from "../../useChatContext";
import Button from "../Button/Button";

function ContactListv2() {
  const { contacts, setSelectedChatId, selectedChatId } = useChatContext();

  return (
    <div className="flex flex-col gap-2">
      {[...contacts].map(([cId, contact], index) => {
        return (
          <Button
            key={index}
            className={selectedChatId == cId ? "bg-theme-text text-background" : "bg-muted text-muted-foreground"}
            onClick={() => setSelectedChatId(cId)}
          >
            {contact.localDisplayName}
          </Button>
        );
      })}
    </div>
  );
}

export default ContactListv2;
