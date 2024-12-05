import { useWebSocket } from "@/useWebSocket";
import Button from "@/components/Button/Button";
import { useEffect, useRef, useState } from "react";
import { ServerResponse } from "@/lib/response";
import { ChatCommandMessage } from "@/lib/command";
import useChatContext from "@/useChatContext";

type CommandConsoleProps = {
  client: ReturnType<typeof useWebSocket>;
};

const CommandConsole = ({ client }: CommandConsoleProps) => {
  const consoleBoxRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useChatContext();
  const [isActive, setIsActive] = useState(true);
  const [input, setInput] = useState("");
  const [consoleMessages, setConsoleMessages] = useState<
    (ServerResponse | ChatCommandMessage)[]
  >([]);

  useEffect(() => {
    if (!isConnected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Backquote") {
        setIsActive((v) => !v);
      }
    };

    client.current?.on("message", (msg) => {
      setConsoleMessages((prev) => [...prev, msg]);
    });

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [client, isConnected]);

  useEffect(() => {
    if (!consoleBoxRef.current) return;
    consoleBoxRef.current.scrollTop = consoleBoxRef.current?.scrollHeight + 200;
  }, [consoleMessages]);

  const handleCommandSubmit = async () => {
    if (input.trim()) {
      const corrId = (await client.current?.sendChatCommandStr(input)) ?? "";
      setConsoleMessages((prev) => [...prev, { corrId, cmd: input }]);
      setInput("");
    }
  };

  return (
    <div
      className={`space-y-4 mb-4 absolute top-0 left-0 w-full bg-background p-4 ${isActive ? "block" : "hidden"}`}
    >
      <h3>Command Panel</h3>
      <div
        ref={consoleBoxRef}
        className="min-h-52 max-h-64 overflow-y-auto overflow-x-hidden bg-gray-800 p-2 rounded"
      >
        {consoleMessages.map((cmd, index) => (
          <div key={index} className="text-sm w-full break-all">
            {typeof (cmd as ChatCommandMessage).cmd === "string"
              ? `> ${(cmd as ChatCommandMessage).cmd}`
              : JSON.stringify(cmd)}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 bg-theme-surface0 text-foreground rounded"
          placeholder="Enter command"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommandSubmit();
          }}
        />
        <Button onClick={handleCommandSubmit}>Send</Button>
      </div>
    </div>
  );
};

export default CommandConsole;
