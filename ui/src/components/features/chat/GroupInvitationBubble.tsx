import { MessageBubble } from "./MessageBubble";
import { GroupInvitation } from "@/lib/response";
import { Button } from "@/components/ui/Button";
import useChatContext from "@/useChatContext";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/error";

type GroupInvitationBubbleProps = {
  groupInvitation: GroupInvitation;
  side: "left" | "right";
};

export const GroupInvitationBubble: React.FC<GroupInvitationBubbleProps> = ({
  groupInvitation,
  side,
  ...props
}) => {
  const { client } = useChatContext();
  const [isLoading, setLoading] = useState(false)

  const acceptInvitation = useCallback(async () => {
    if (isLoading) return;
    setLoading(true);
    const corrId = await client.current?.joinGroup(groupInvitation.localDisplayName);
    if (!corrId) {
      setLoading(false);
      return toast("Error sending join request.");
    }
    const data = await client.current?.waitCommandResponse(corrId);
    if (data?.type === 'chatCmdError') {
      toastError(data);
    } else {
      toast(`Joined ${groupInvitation.localDisplayName}`);
    }
    setLoading(false);
  }, [client, groupInvitation, isLoading]);

  return (
    <MessageBubble
      {...props}
      heading={`You received an invitation to ${groupInvitation.localDisplayName}!`}
      side={side}
    >
      <Button
        loading={isLoading}
        onClick={() => acceptInvitation()}
        className="hover:bg-secondary"
      >
        Accept
      </Button>
      <Button disabled>Deny</Button>
    </MessageBubble>
  );
};
