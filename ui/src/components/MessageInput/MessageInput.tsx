import { useState } from "react";
import classes from "./MessageInput.module.css";
import Button from "../Button/Button";

type MessageInputProps = {
  onChange?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => Promise<void>;
};

const MessageInput: React.FC<MessageInputProps> = (props) => {
  const [message, setMessage] = useState("");

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "Enter") {
      props.onSubmit?.(message).then(() => setMessage(""));
    }
  };

  return (
    <div className={classes.messageBox}>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        className={classes.messageInput}
      />
      <Button
        onClick={() => props.onSubmit?.(message)}
        className={classes.sendButton}
      >
        Send
      </Button>
    </div>
  );
};

export default MessageInput;
