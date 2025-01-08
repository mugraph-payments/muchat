import { useCallback, useEffect, useRef, useState } from "react";
import { ServerResponse } from "@/lib/response";
import { ChatCommandMessage } from "@/lib/command";
import useChatContext from "@/useChatContext";
import MessageInput from "@/components/features/chat/MessageInput";
import { MessageBubble } from "@/components/features/chat/MessageBubble";
import { useVirtualizer } from "@tanstack/react-virtual";

const CommandConsole = () => {
  const consoleBoxRef = useRef<HTMLDivElement>(null);
  const { client, isConnected } = useChatContext();
  const [isActive, setIsActive] = useState(false);
  const [limitMessageLength, setLimitMessageLength] = useState(true);
  const [consoleMessages, setConsoleMessages] = useState<
    (ServerResponse | ChatCommandMessage)[]
  >([]);

  const virtualizer = useVirtualizer({
    count: consoleMessages.length,
    getScrollElement: () => consoleBoxRef.current,
    estimateSize: () => 150,
    overscan: 10,
  });

  const updateMessages = useCallback((msg: ServerResponse) => {
    setConsoleMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Backquote") {
        setIsActive((v) => !v);
      }
    };

    const currentClient = client.current;
    currentClient?.on("message", updateMessages);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      currentClient?.off("message", updateMessages);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [client, isConnected, updateMessages]);

  useEffect(() => {
    if (!consoleBoxRef.current) return;
    virtualizer.scrollToIndex(consoleMessages.length - 1, { align: "end" });
  }, [consoleMessages.length, virtualizer]);

  const handleCommandSubmit = useCallback(
    async (input: string) => {
      if (input.trim()) {
        await client.current?.sendChatCommandStr(input);
      }
    },
    [client],
  );

  if (!isActive) return null;

  return (
    <div className="z-50 space-y-4 mb-4 absolute top-0 left-0 w-full bg-background p-4 transition-opacity duration-150 shadow-md">
      <div className="flex gap-4 justify-between">
        <h3>Console</h3>
        <div className="flex gap-2">
          <span className="border-r pr-2">Count: {consoleMessages.length}</span>
          <span>
            <label htmlFor="limitMessageLength" className="mr-2">
              Limit message length
            </label>
            <input
              id="limitMessageLength"
              type="checkbox"
              checked={limitMessageLength}
              onChange={(e) => setLimitMessageLength(e.target.checked)}
            />
          </span>
        </div>
      </div>

      <div
        ref={consoleBoxRef}
        className="min-h-52 max-h-64 overflow-y-auto overflow-x-hidden bg-gray-800 p-2 rounded"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const message = consoleMessages[virtualRow.index];
            const sentCommand = client.current?.getCommandByCorrId(
              message.corrId ?? "",
            );

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageBubble
                  className="w-full"
                  heading={`> ${sentCommand?.cmd || ""}`}
                  data-corr-id={message.corrId}
                  limitMessageLenght={limitMessageLength}
                >
                  {typeof (message as ChatCommandMessage).cmd === "string"
                    ? `> ${(message as ChatCommandMessage).cmd}`
                    : JSON.stringify(message)}
                </MessageBubble>
              </div>
            );
          })}
        </div>
      </div>

      <MessageInput onSubmit={handleCommandSubmit} />
    </div>
  );
};

export default CommandConsole;
