import useChatContext from "@/useChatContext";
import { useWebSocket } from "@/useWebSocket";
import Button from "@/components/Button/Button";

type CommandPanelProps = {
  client: ReturnType<typeof useWebSocket>;
};

const CommandPanel = ({ client }: CommandPanelProps) => {
  const { activeUser, contactLink } = useChatContext();

  return (
    <div className="space-y-4 mb-4">
      <h3>Command Panel</h3>
      <div className="my-2 flex flex-col justify-center gap-2">
        <div className="flex gap-2">
          Address:{" "}
          <span className="bg-theme-surface0 p-2 break-all w-fit rounded">
            {contactLink?.connReqContact}
          </span>
        </div>

        <div>Active User: "{activeUser?.localDisplayName}"</div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            client?.current?.apiListContacts(
              (activeUser?.userId ?? 0).toString(),
            )
          }
        >
          List Contacts
        </Button>

        <Button
          onClick={() => {
            client?.current?.apiGetChats(activeUser?.userId ?? 0);
          }}
        >
          Get Gets
        </Button>
        <Button
          onClick={() => {
            client?.current?.apiCreateAddress();
          }}
        >
          Create address
        </Button>
        <Button
          onClick={() => {
            client?.current?.apiGetUserAddress();
          }}
        >
          Get Address
        </Button>
      </div>
    </div>
  );
};

export default CommandPanel;
