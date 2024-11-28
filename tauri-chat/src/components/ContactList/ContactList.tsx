import classes from "./ContactList.module.css";
import useChatContext from "../../useChatContext";
import Button from "./Button/Button";
import { useRef } from "react";
import { useWebSocket } from "../../useWebSocket";

type ContactListProps = {
  client: ReturnType<typeof useWebSocket>;
};

function ContactList({ client }: ContactListProps) {
  const { contacts, setSelectedChatId, selectedChatId } = useChatContext();
  const contactInputRef = useRef<HTMLInputElement>(null);

  const addContact = async (connLink: string) => {
    const res = await client.current?.waitCommandResponse(
      await client.current?.apiConnect(connLink),
    );
    return res;
  };

  const handleAddContactInput = async () => {
    if (!contactInputRef.current || !contactInputRef.current.value) return;
    await addContact(contactInputRef.current.value);
    contactInputRef.current.value = "";
  };

  return (
    <div className={classes.container}>
      <h3>Contact List</h3>
      <div className={classes.body}>
        <div className="flex gap-2">
          <Button
            className={`${classes.item} ${
              selectedChatId === -1 && classes.selected
            }`}
            onClick={() => setSelectedChatId(-1)}
          >
            Debug Chat
          </Button>
          {[...contacts].map(([cId, contact], index) => {
            return (
              <Button
                key={index}
                className={`${classes.item} ${
                  selectedChatId === cId && classes.selected
                }`}
                onClick={() => setSelectedChatId(cId)}
              >
                {cId} {contact.localDisplayName}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAddContactInput}>+ Add new contact</Button>
        <input
          ref={contactInputRef}
          placeholder="Connection Address"
          className="w-42 p-2 rounded"
        />
      </div>
    </div>
  );
}

export default ContactList;
