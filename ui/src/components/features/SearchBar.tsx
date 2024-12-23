import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/Dialog";
import { useEffect, useState } from "react";

export function SearchBar() {
  const [open, setOpen] = useState(false);

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
            />
          </div>
        </DialogHeader>
        <DialogDescription>
          <p className="text-gray-400 text-sm">Recently viewed</p>
          <>
            <h1>Contact list soon here</h1>
          </>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
