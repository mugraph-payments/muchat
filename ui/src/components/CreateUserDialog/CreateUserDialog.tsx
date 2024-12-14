import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog";
import Button from "../Button/Button";
import useChatContext from "@/useChatContext";
import { useCallback, useState } from "react";
import { Profile } from "@/lib/command";
import { Input } from "../Input";

const EmptyProfile: Profile = {
  displayName: "",
  fullName: "",
};

const CreateUserDialog = () => {
  const { client } = useChatContext();
  const [profile, setProfile] = useState<Profile>(EmptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCreateUser = useCallback(async () => {
    const corrId = await client.current?.apiCreateUser(profile);
    if (corrId) {
      const data = await client.current?.waitCommandResponse(corrId);
      if (data?.type === "chatCmdError") {
        switch (data.chatError.type) {
          case "error":
            setError(data.chatError.errorType.type);
            break;
          default:
            setError(data.chatError.type);
            break;
        }
      } else if (data?.type === "activeUser") {
        await client.current?.apiListUsers();
        setError(null);
        setProfile(EmptyProfile);
        setSubmitted(true);
      }
    }
  }, [profile, client]);

  const handleProfileUpdate = useCallback(
    <F extends keyof Profile>(field: F, value: Profile[F]) => {
      setProfile((p) => ({ ...p, [field]: value }));
    },
    [],
  );

  const resetDialog = useCallback(() => {
    setProfile(EmptyProfile);
    setError(null);
    setSubmitted(false);
  }, []);

  return (
    <Dialog onOpenChange={resetDialog}>
      <DialogTrigger>Create user</DialogTrigger>
      <DialogContent aria-describedby="Create new user">
        <DialogHeader>
          <DialogTitle>Create a new user</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <form className="space-y-4">
            <Input
              placeholder="Display Name"
              onChange={(e) =>
                handleProfileUpdate("displayName", e.target.value)
              }
            ></Input>
            <Input
              placeholder="Full Name"
              onChange={(e) => handleProfileUpdate("fullName", e.target.value)}
            ></Input>
            {/* TODO: add image picker and set profile picture */}
          </form>
          <div className="flex flex-col gap-2">
            <span className="text-red-500">
              {error ? `Error: ${error}` : null}
            </span>
            <span className="text-theme-green">
              {submitted ? `Profile created!` : null}
            </span>
            <Button onClick={handleCreateUser}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
