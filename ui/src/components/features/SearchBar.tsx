import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/Dialog";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ContactCard from "./contacts/ContactCard";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleFilterInput(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);

    const matches = (await invoke("match_array", {
      pattern: query,
      paths: ["Miguel Oliveira"],
    })) as string[];

    setFilteredContacts(matches);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4">Find or start a conversation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="m-0">
            <input
              type="text"
              autoFocus
              className="block w-full bg-transparent border-transparent rounded-lg p-2 text-sm text-gray-300 placeholder:text-gray-400 placeholder:text-lg transition-shadow focus:outline-none focus:ring-0"
              placeholder="Search"
              onChange={handleFilterInput}
            />
          </div>
        </DialogHeader>
        <DialogDescription>
          <p className="text-gray-400 text-sm">Recently viewed</p>
          <ContactCard contactsList={filteredContacts} />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
