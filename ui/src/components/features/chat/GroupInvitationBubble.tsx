import { MessageBubble } from "./MessageBubble";
import { GroupInvitation } from "@/lib/response";
import { Button } from "@/components/ui/Button";
import useChatContext from "@/useChatContext";

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
  return (
    <MessageBubble
      {...props}
      heading={`You received an invitation to ${groupInvitation.localDisplayName}!`}
      side={side}
    >
      <Button
        onClick={async () => {
          await client.current?.joinGroup(groupInvitation.localDisplayName);
          // TODO: provide proper feedback here
        }}
      >
        Accept
      </Button>
      <Button disabled>Deny</Button>
    </MessageBubble>
  );
};
