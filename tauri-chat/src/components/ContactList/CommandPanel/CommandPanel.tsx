import useChatContext from "../../../useChatContext";
import { useWebSocket } from "../../../useWebSocket";

type CommandPanelProps = {
  client: ReturnType<typeof useWebSocket>;
};

const CommandPanel = ({ client }: CommandPanelProps) => {
  const { activeUser } = useChatContext();

  return (
    <div>
      <h3>Command Panel</h3>
      {/* listUsers
      listContacts
      startChat
      apiStopChat
      apiGetChats
      apiGetChat */}
      <button
        onClick={() =>
          client.listContacts((activeUser?.userId ?? 0).toString())
        }
      >
        List Contacts
      </button>
    </div>
  );
};

export default CommandPanel;
