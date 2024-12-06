import { useState } from "react";
import classes from "./MessageInput.module.css";
import Button from "../Button/Button";
import { commands as commandList } from "../../lib/command";

type MessageInputProps = {
  onChange?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => Promise<void>;
};

const MessageInput: React.FC<MessageInputProps> = (props) => {
  const [message, setMessage] = useState("");
  const [commands] = useState<string[]>(Object.values(commandList));
  const [activeCommandSuggestions, setActiveCommandSuggestions] = useState<
    string[]
  >([]);
  const [commandAutoCompleteEnabled, setCommandAutoCompleteEnabled] =
    useState(false);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "Enter") {
      props.onSubmit?.(message).then(() => setMessage(""));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMessage(value);

    // Handle command input
    if (value.endsWith("/")) {
      setCommandAutoCompleteEnabled(true);
      setActiveCommandSuggestions(commands);
    } else if (value.startsWith("/") && commandAutoCompleteEnabled) {
      const query = value || "";
      setActiveCommandSuggestions(
        commands.filter((cmd) =>
          cmd.toLowerCase().startsWith(query.toLowerCase()),
        ),
      );
    } else {
      setCommandAutoCompleteEnabled(false);
      setActiveCommandSuggestions([]);
    }
  };

  const handleSuggestionSelection = (command: string) => {
    setMessage(command);
    setCommandAutoCompleteEnabled(false);
    setActiveCommandSuggestions([]);
  };

  return (
    <div className={classes.messageBox}>
      {commandAutoCompleteEnabled && activeCommandSuggestions.length > 0 && (
        <div className={classes.suggestions}>
          {activeCommandSuggestions.map((command, index) => (
            <div
              key={index}
              className={classes.suggestion}
              onClick={() => handleSuggestionSelection(command)}
            >
              {command}
            </div>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
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
