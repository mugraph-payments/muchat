import { useEffect, useMemo, useRef, useState } from "react";
import { ServerResponse } from "@/lib/response";
import { ChatCommandMessage } from "@/lib/command";
import useChatContext from "@/useChatContext";
import MessageInput from "@/components/MessageInput/MessageInput";

const CommandConsole = () => {
  const consoleBoxRef = useRef<HTMLDivElement>(null);
  const { client, isConnected } = useChatContext();
  const [isActive, setIsActive] = useState(false);

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

  const handleCommandSubmit = async (input: string) => {
    if (input.trim()) {
      const corrId = (await client.current?.sendChatCommandStr(input)) ?? "";
      setConsoleMessages((prev) => {
        prev.push({ corrId, cmd: input });
        return prev;
      });
    }
  };

  const Messages = useMemo(
    () => (
      <>
        {consoleMessages.map((cmd, index) => (
          <div
            key={`${index}-${cmd.corrId}`}
            className="text-sm w-full break-all"
          >
            {typeof (cmd as ChatCommandMessage).cmd === "string"
              ? `> ${(cmd as ChatCommandMessage).cmd}`
              : JSON.stringify(cmd)}
          </div>
        ))}
      </>
    ),
    [consoleMessages],
  );

  return (
    <div
      className={`space-y-4 mb-4 absolute top-0 left-0 w-full bg-background p-4 ${
        isActive ? "opacity-100 visible" : "opacity-0 invisible"
      } transition-opacity duration-150 shadow-md`}
    >
      <h3>Console</h3>
      <div
        ref={consoleBoxRef}
        className="min-h-52 max-h-64 overflow-y-auto overflow-x-hidden bg-gray-800 p-2 rounded"
      >
        {Messages}
      </div>
      <MessageInput onSubmit={handleCommandSubmit} />
    </div>
  );
};

export default CommandConsole;
