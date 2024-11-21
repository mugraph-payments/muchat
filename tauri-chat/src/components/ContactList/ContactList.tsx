import { useMemo } from 'react';
import classes from './ContactList.module.css';
import { useWebSocket } from '../../useWebSocket';

function ContactList({
  chatClient,
}: {
  chatClient: ReturnType<typeof useWebSocket>;
}) {
  const contacts = useMemo(() => chatClient.directChats.keys(), [chatClient]);

  return (
    <div className={classes.container}>
      <h3>Contact List</h3>
      <div className={classes.body}>
        {[...contacts].map((c, index) => {
          return (
            <button key={index} className={classes.item}>
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContactList;
