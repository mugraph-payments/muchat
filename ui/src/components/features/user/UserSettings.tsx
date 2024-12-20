import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { CreateUserForm } from "@/components/forms/CreateUser";
import { Separator } from "@/components/ui/Separator";
import { parseSimplexWsChatError } from "@/lib/utils";
import useChatContext from "@/useChatContext";
import { useCallback, useState } from "react";

type UserSettingsDialogProps = {
  children: React.ReactNode;
};

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent aria-describedby="User Settings">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <UserSettings />
      </DialogContent>
    </Dialog>
  );
};

export type UserSettingsViews = "home" | "add";

export type UserSettingsViewProps = {
  setView: (view: UserSettingsViews) => void;
};

export const UserSettings = () => {
  const [view, setView] = useState<UserSettingsViews>("home");
  return (
    <div>
      {view === "home" && <UserSettingsHome setView={setView} />}
      {view === "add" && <CreateUserView setView={setView} />}
    </div>
  );
};

const CreateUserView = ({ setView }: UserSettingsViewProps) => {
  return (
    <>
      <Button onClick={() => setView("home")}>Back</Button>
      <CreateUserForm onSubmit={() => setView("home")} />
    </>
  );
};

const UserSettingsHome = ({ setView }: UserSettingsViewProps) => {
  const { client, activeUser, users } = useChatContext();
  const [error, setError] = useState("");

  const deleteUser = useCallback(
    (userId: number) => {
      client.current?.apiDeleteUser(userId).then(async (corrId) => {
        const data = await client.current?.waitCommandResponse(corrId);
        if (data?.type === "chatCmdError") {
          setError(parseSimplexWsChatError(data));
        } else {
          setError("");
          client.current?.apiListUsers();
        }
      });
    },
    [client],
  );

  const setActive = useCallback(
    (userId: number) => {
      client.current?.apiSetActiveUser(userId).then(async (corrId) => {
        const data = await client.current?.waitCommandResponse(corrId);
        if (data?.type === "chatCmdError") {
          setError(parseSimplexWsChatError(data));
        } else {
          setError("");
        }
      });
    },
    [client],
  );

  const createUser = () => setView("add");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between w-full items-center">
        Active User:{" "}
        {activeUser?.profile.fullName || activeUser?.profile.displayName} (id:{" "}
        {activeUser?.userId})<Button onClick={createUser}>Create User</Button>
      </div>
      <Separator />
      <div className="max-h-full overflow-y-auto space-y-2">
        {users.map(({ user }, index) => (
          <div className="flex gap-2 justify-between" key={index}>
            <span>
              {user.activeUser ? <span className="text-red-500">*</span> : ""}
              {user.profile.displayName}(id: {user.userId})
            </span>
            <span>
              <Button
                disabled={user.activeUser}
                onClick={() => setActive(user.userId)}
              >
                Set Active
              </Button>
            </span>
            <span>
              <Button disabled>Update User</Button>
            </span>
            <span>
              <Button
                onClick={() => deleteUser(user.userId)}
                className="bg-red-800"
              >
                Delete User
              </Button>
            </span>
          </div>
        ))}
      </div>
      <span className="text-red-500">{error ? `Error: ${error}` : null}</span>
      <div className="flex gap-2"></div>
    </div>
  );
};
