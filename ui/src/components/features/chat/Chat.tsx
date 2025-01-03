import { useMemo } from "react";
import useChatContext from "@/useChatContext";
import { ChatItem, Contact } from "@/lib/response";
import { ChatType } from "@/lib/command";
import MessageInput from "@/components/features/chat/MessageInput";
import CommandConsole from "@/components/features/console/CommandConsole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { MessageBubble } from "./MessageBubble";
import { SidebarTrigger } from "@/components/ui/Sidebar";
import { GroupInvitationBubble } from "./GroupInvitationBubble";

const Chat = () => {
  const {
    client,
    activeUser,
    contacts,
    isConnected,
    directChats,
    selectedChatId,
  } = useChatContext();
  const selectedChat = useMemo(
    () =>
      selectedChatId === -1 ? [] : (directChats.get(selectedChatId) ?? []),
    [selectedChatId, directChats],
  );
  const selectedContact = useMemo(
    () => (selectedChatId === -1 ? null : contacts.get(selectedChatId)),
    [selectedChatId, contacts],
  );

  const handleSendMessage = async (message: string) => {
    if (message.trim() !== "") {
      await client.current?.apiSendMessages(ChatType.Direct, selectedChatId, [
        {
          msgContent: {
            type: "text",
            text: message,
          },
        },
      ]);
      toast("Your message has been successfully sent");
    }
  };

  const DirectChat = (messages: ChatItem[], contact: Contact | null) => {
    return messages.map((msg, index) => {
      switch (msg.content.type) {
        case "sndMsgContent":
          return (
            <MessageBubble
              heading={activeUser?.localDisplayName ?? "No Display Name"}
              key={index}
            >
              {msg.content.msgContent.text}
            </MessageBubble>
          );
        case "rcvMsgContent":
          return (
            <MessageBubble
              heading={contact?.localDisplayName ?? "No Display Name"}
              side="right"
              key={index}
            >
              {msg.content.msgContent.text}
            </MessageBubble>
          );
        case "rcvGroupInvitation":
          return (
            <GroupInvitationBubble
              key={index}
              groupInvitation={msg.content.groupInvitation}
              side="right"
            />
          );
        default:
          return (
            <MessageBubble
              heading={`Unkown Message: ${msg.content.type}`}
              side={msg.content.type.startsWith("snd") ? "left" : "right"}
              key={index}
            >
              {JSON.stringify(msg.content)}
            </MessageBubble>
          );
      }
    });
  };

  const contactName = selectedContact?.localDisplayName;
  const contactAvatar = selectedContact?.profile.image;

  return (
    <div className={`w-full h-full flex flex-col gap-2 overflow-hidden`}>
      <div className="p-4 bg-theme-mantle w-full border-b-[1px] border-theme-base flex items-center gap-2 shrink-0">
        <div className="mr-4">
          <SidebarTrigger />
        </div>

        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage
              src={contactAvatar}
              alt={selectedContact?.localDisplayName}
            />
            <AvatarFallback>
              {contactName ? contactName.charAt(0).toUpperCase() : "D"}
            </AvatarFallback>
          </Avatar>
          <h2>{contactName ?? "Debug"}</h2>
        </div>
        <Badge
          className="ml-auto"
          variant={isConnected ? "default" : "destructive"}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div>
        <CommandConsole />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2 overflow-hidden">
        <div
          id="messages"
          className={`overflow-y-auto overflow-x-hidden p-2 flex flex-col h-full max-h-full gap-2 flex-grow border-muted border rounded`}
        >
          {selectedChatId === -1
            ? null
            : DirectChat(selectedChat, selectedContact ?? null)}
        </div>
        <MessageInput onSubmit={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
