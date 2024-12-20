import { Button } from "@/components/ui/Button";
import useChatContext from "@/useChatContext";
import { useCallback, useRef } from "react";

export const AddContact = () => {
  const { client } = useChatContext();
  const contactInputRef = useRef<HTMLInputElement>(null);

  const addContact = useCallback(
    async (connLink: string) => {
      const res = await client.current?.waitCommandResponse(
        await client.current?.apiConnect(connLink),
      );
      return res;
    },
    [client],
  );

  const handleAddContactSubmit = useCallback(async () => {
    if (!contactInputRef.current || !contactInputRef.current.value) return;
    await addContact(contactInputRef.current.value);
    contactInputRef.current.value = "";
  }, [addContact]);

  const handleInput = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.code === "Enter") {
        handleAddContactSubmit();
      }
    },
    [handleAddContactSubmit],
  );

  return (
    <div className="flex gap-2 mt-2">
      <Button onClick={handleAddContactSubmit}>+</Button>
      <input
        ref={contactInputRef}
        placeholder="Connection Address"
        className="w-42 p-2 rounded"
        onKeyDown={handleInput}
      />
    </div>
  );
};
