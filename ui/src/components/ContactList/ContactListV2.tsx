import useChatContext from "@/useChatContext";
import Button from "@/components/Button/Button";
import { Avatar, AvatarFallback } from "../Avatar";

function ContactListv2() {
  const { contacts, setSelectedChatId, selectedChatId, directChats } =
    useChatContext();

  return (
    <div className="flex flex-col gap-2">
      {[...contacts].map(([cId, contact], index) => {
        const message = directChats.get(cId)?.at(-1);

        const lastMessage =
          message?.content.type === "sndMsgContent" &&
          message.content.msgContent?.text;

        return (
          <Button
            key={index}
            className={`flex items-center justify-between gap-3 px-3 py-2 rounded ${
              selectedChatId == cId
                ? "bg-theme-text text-background"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setSelectedChatId(cId)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  {contact.localDisplayName.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-medium truncate">
                  {contact.localDisplayName}
                </span>
                <p className="text-sm text-theme-subtext0">
                  {lastMessage ?? "teste"}
                </p>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

export default ContactListv2;
