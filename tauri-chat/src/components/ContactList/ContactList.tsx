import classes from "./ContactList.module.css";
import useChatContext from "../../useChatContext";
import Button from "./Button/Button";

function ContactList() {
  const { contacts, setSelectedChatId, selectedChatId } = useChatContext();

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
      <div>
        <Button>+ Add new contact</Button>
      </div>
    </div>
  );
}

export default ContactList;
