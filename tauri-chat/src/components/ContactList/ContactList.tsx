import classes from "./ContactList.module.css";
import useChatContext from "../../useChatContext";

function ContactList() {
  const { contacts, setSelectedChatId, selectedChatId } = useChatContext();

  return (
    <div className={classes.container}>
      <h3>Contact List</h3>
      <div className={classes.body}>
        <button
          className={`${classes.item} ${
            selectedChatId === -1 && classes.selected
          }`}
          onClick={() => setSelectedChatId(-1)}
        >
          Debug Chat
        </button>
        {[...contacts].map(([cId, contact], index) => {
          return (
            <button
              key={index}
              className={`${classes.item} ${
                selectedChatId === cId && classes.selected
              }`}
              onClick={() => setSelectedChatId(cId)}
            >
              {cId} {contact.localDisplayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContactList;
