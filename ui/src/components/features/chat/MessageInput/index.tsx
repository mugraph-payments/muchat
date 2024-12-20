import { useRef, useState } from "react";
import classes from "@/components/features/chat/MessageInput/MessageInput.module.css";
import { Button } from "@/components/ui/Button";
import { commands as commandList } from "@/lib/command";

type MessageInputProps = {
  onChange?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => Promise<void>;
};

const MessageInput: React.FC<MessageInputProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement[]>([]);
  const [message, setMessage] = useState("");
  const [commands] = useState<string[]>([
    ...new Set(Object.values(commandList)),
  ]);
  const [activeCommandSuggestions, setActiveCommandSuggestions] = useState<
    string[]
  >([]);
  const [commandAutoCompleteEnabled, setCommandAutoCompleteEnabled] =
    useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "Enter") {
      props.onSubmit?.(message).then(() => setMessage(""));
      setCommandAutoCompleteEnabled(false);
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (commandAutoCompleteEnabled && activeCommandSuggestions.length > 0) {
        const nextIndex =
          focusedSuggestionIndex === -1 ? 0 : focusedSuggestionIndex;
        setFocusedSuggestionIndex(nextIndex);
        suggestionsRef.current[nextIndex]?.focus();
      }
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
    inputRef.current?.focus();
  };

  return (
    <div className={classes.messageBox}>
      {commandAutoCompleteEnabled && activeCommandSuggestions.length > 0 && (
        <div className={classes.suggestions}>
          {activeCommandSuggestions.map((command, index) => (
            <div
              key={index}
              ref={(el) => (suggestionsRef.current[index] = el!)}
              className={`${classes.suggestion} ${
                index === focusedSuggestionIndex ? classes.focused : ""
              }`}
              onClick={() => handleSuggestionSelection(command)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSuggestionSelection(command);
                } else if (event.key === "Tab" && !event.shiftKey) {
                  event.preventDefault();
                  const nextIndex =
                    focusedSuggestionIndex + 1 > activeCommandSuggestions.length
                      ? -1
                      : focusedSuggestionIndex + 1;
                  setFocusedSuggestionIndex(nextIndex);
                  suggestionsRef.current[nextIndex]?.focus();
                } else if (event.key === "Tab" && event.shiftKey) {
                  event.preventDefault();
                  const nextIndex =
                    focusedSuggestionIndex - 1 < 0
                      ? -1
                      : focusedSuggestionIndex - 1;
                  setFocusedSuggestionIndex(nextIndex);
                  suggestionsRef.current[nextIndex]?.focus();
                }
              }}
              tabIndex={-1}
            >
              {command}
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
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
