import classes from './ContactList.module.css';
import useChatContext from '../../useChatContext';

function ContactList() {
  const { contacts } = useChatContext();
  return (
    <div className={classes.container}>
      <h3>Contact List</h3>
      <div className={classes.body}>
        {[...contacts].map(([cId], index) => {
          return (
            <button key={index} className={classes.item}>
              {cId}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContactList;
