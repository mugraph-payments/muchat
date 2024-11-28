import useChatContext from "../../../useChatContext";
import { useWebSocket } from "../../../useWebSocket";

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
          <span className="text-gray-500 p-2 bg-black w-fit rounded">
            {contactLink?.connReqContact}
          </span>
        </div>

        <div>Active User: "{activeUser?.localDisplayName}"</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            client?.current?.apiListContacts(
              (activeUser?.userId ?? 0).toString(),
            )
          }
        >
          List Contacts
        </button>

        <button
          onClick={() => {
            client?.current?.apiGetChats(activeUser?.userId ?? 0);
          }}
        >
          Get Gets
        </button>
        <button
          onClick={() => {
            client?.current?.apiCreateAddress();
          }}
        >
          Create address
        </button>
        <button
          onClick={() => {
            client?.current?.apiGetUserAddress();
          }}
        >
          Get Address
        </button>
      </div>
    </div>
  );
};

export default CommandPanel;
