import useChatContext from "@/useChatContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { Contact } from "@/lib/response";
import { AddContact } from "./AddContact";

type ContactContextMenuProps = {
  children: React.ReactNode;
  contact: Contact;
  onDelete: () => void;
};

export function ContactContextMenu({
  children,
  onDelete,
}: ContactContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full rounded-md">
        <div>{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={onDelete}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ContactListv2() {
  const {
    client,
    contacts,
    setSelectedChatId,
    selectedChatId,
    directChats,
    activeUser,
  } = useChatContext();

  return (
    <div className="flex flex-col gap-2">
      {[...contacts].map(([cId, contact], index) => {
        const message = directChats.get(cId)?.at(-1);

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
          <ContactContextMenu key={index} onDelete={onDelete} contact={contact}>
            <Button
              className={`w-full h-full flex items-center justify-between gap-3 px-3 py-2 rounded ${
                selectedChatId == cId
                  ? "bg-theme-text text-background"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => {
                setSelectedChatId(cId);
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    {contact.localDisplayName.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-medium truncate">
                    {contact.localDisplayName}
                  </span>
                  <p className="text-sm text-theme-subtext0">
                    {lastMessage ?? "teste"}
                  </p>
                </div>
              </div>
            </Button>
          </ContactContextMenu>
        );
      })}
      <AddContact />
    </div>
  );
}

export default ContactListv2;
