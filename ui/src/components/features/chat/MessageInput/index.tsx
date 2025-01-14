import { useCallback, useEffect, useRef, useState } from "react";
import classes from "@/components/features/chat/MessageInput/MessageInput.module.css";
import { Button } from "@/components/ui/Button";
import { commands as commandList } from "@/lib/command";

type MessageInputProps = {
  showCommandSuggestions?: boolean;
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
  const [history, setHistory] = useState<Array<string>>([]);
  const [, setHistoryIndex] = useState(-1);

  const handleDismiss = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && commandAutoCompleteEnabled) {
        setCommandAutoCompleteEnabled(false);
        inputRef.current?.focus();
      }
    },
    [commandAutoCompleteEnabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleDismiss);
    return () => window.removeEventListener("keydown", handleDismiss);
  }, [handleDismiss]);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    switch (event.key) {
      case "Enter": {
        props.onSubmit?.(message).then(() => {
          if (message) {
            setHistory((h) => {
              const newHistory = [message, ...h];
              setMessage("");
              return newHistory;
            });
          }
        });
        setCommandAutoCompleteEnabled(false);
        break;
      }
      case "Tab": {
        event.preventDefault();
        if (commandAutoCompleteEnabled && activeCommandSuggestions.length > 0) {
          const nextIndex =
            focusedSuggestionIndex === -1 ? 0 : focusedSuggestionIndex;
          setFocusedSuggestionIndex(nextIndex);
          suggestionsRef.current[nextIndex]?.focus();
        }
        break;
      }
      case "ArrowUp": {
        if (commandAutoCompleteEnabled && activeCommandSuggestions.length > 0) {
          const nextIndex = Math.max(focusedSuggestionIndex - 1, -1);
          setFocusedSuggestionIndex(nextIndex);
          suggestionsRef.current[nextIndex]?.focus();
          return;
        }

        setHistoryIndex((i) => {
          const newIndex = Math.min(i + 1, history.length - 1);
          setMessage(history[newIndex]);
          return newIndex;
        });
        break;
      }
      case "ArrowDown": {
        if (commandAutoCompleteEnabled && activeCommandSuggestions.length > 0) {
          const nextIndex = Math.min(
            focusedSuggestionIndex + 1,
            activeCommandSuggestions.length - 1,
          );
          setFocusedSuggestionIndex(nextIndex);
          suggestionsRef.current[nextIndex]?.focus();
          return;
        }
        setHistoryIndex((i) => {
          const newIndex = Math.max(i - 1, -1);
          if (newIndex === -1) {
            setMessage("");
          } else {
            setMessage(history[newIndex]);
          }
          return newIndex;
        });
        break;
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMessage(value);

    if (!props.showCommandSuggestions) return;
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
              role="option"
              aria-selected={index === focusedSuggestionIndex}
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
