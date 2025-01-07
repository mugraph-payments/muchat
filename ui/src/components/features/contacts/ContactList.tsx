import useChatContext from "@/useChatContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { Contact, GroupInfo } from "@/lib/response";
import { AddContact } from "./AddContact";
import { getChatKey } from "@/ChatContext";
import { useState } from "react";
import { toastError } from "@/lib/error";
import { toast } from "sonner";

type ContactContextMenuProps = {
  children: React.ReactNode;
  items: Array<{
    label: string;
    callback: () => void;
  }>;
};

export function ContactContextMenu({
  children,
  items,
}: ContactContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full rounded-md">
        <div>{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {items.map(({ label, callback }) => (
          <ContextMenuItem onClick={callback}>{label}</ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface ContactListProps {
  showGroups?: boolean;
}

export function ContactCard({ contact }: { contact: Contact }) {
  {
    const {
      client,
      setSelectedChatId,
      selectedChatId,
      directChats,
      activeUser,
    } = useChatContext();
    const contactId = contact ? contact.contactId : -1;
    const displayName = contact ? contact.localDisplayName : "No display name";
    const chatKey = getChatKey({ contact });
    const message = directChats.get(getChatKey({ contact }))?.at(-1);

    const lastMessage =
      message?.content.type === "sndMsgContent" &&
      message.content.msgContent?.text;

    const onDelete = () => {
      if (!contact) return;
      client.current
        ?.apiDeleteContact(contact.contactId)
        .then(async (corrId: string) => {
          // TODO: display feedback
          await client.current?.waitCommandResponse(corrId);
          client.current?.apiListContacts(`${activeUser?.userId ?? 0}`);
        });
    };

    return (
      <ContactContextMenu
        key={contactId}
        items={[{ label: "Delete", callback: onDelete }]}
      >
        <Button
          className={`w-full h-full flex items-center justify-between gap-3 px-3 py-2 rounded ${
            selectedChatId == chatKey
              ? "bg-theme-text text-background"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => {
            setSelectedChatId(chatKey);
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                {displayName.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="font-medium truncate">{displayName}</span>
              <p className="text-sm text-theme-subtext0">
                {lastMessage ?? "teste"}
              </p>
            </div>
          </div>
        </Button>
      </ContactContextMenu>
    );
  }
}

export function GroupContactCard({ group }: { group: GroupInfo }) {
  {
    const { client, directChats, setSelectedChatId, selectedChatId } =
      useChatContext();
    const [isLoading, setLoading] = useState(false);
    const contactId = group ? group.groupId : -1;
    const chatKey = getChatKey({ group });
    const displayName = group ? group.localDisplayName : "No display name";
    const message = directChats.get(chatKey)?.at(-1);

    const lastMessage =
      message?.content.type === "sndMsgContent" &&
      message.content.msgContent?.text;

    const onLeave = () => {
      if (!group) return;
      setLoading(true);
      client.current
        ?.leaveGroup(group.groupId)
        .then(async (corrId) => {
          const data = await client.current?.waitCommandResponse(corrId);
          if (data?.type === "chatCmdError") {
            toastError(data);
          } else {
            toast(`Left ${group.localDisplayName}`);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    return (
      <ContactContextMenu
        key={contactId}
        items={[{ label: "Leave", callback: onLeave }]}
      >
        <Button
          className={`w-full h-full flex items-center justify-between gap-3 px-3 py-2 rounded ${
            selectedChatId == chatKey
              ? "bg-theme-text text-background"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => {
            setSelectedChatId(chatKey);
          }}
          loading={isLoading}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                {displayName.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="font-medium truncate">{displayName}</span>
              <p className="text-sm text-theme-subtext0">{lastMessage ?? ""}</p>
            </div>
          </div>
        </Button>
      </ContactContextMenu>
    );
  }
}

function ContactList({ showGroups = true }: ContactListProps) {
  const { contacts, groups } = useChatContext();

  return (
    <div className="flex flex-col gap-2">
      {[...contacts].map(([cId, contact]) => (
        <ContactCard contact={contact} key={cId} />
      ))}
      {showGroups &&
        [...groups].map(([cId, group]) => (
          <GroupContactCard group={group.groupInfo} key={cId} />
        ))}
      <AddContact />
    </div>
  );
}

export default ContactList;
