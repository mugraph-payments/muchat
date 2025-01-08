import { useCallback, useMemo } from "react";
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
    groups,
    isConnected,
    directChats,
    selectedChatId,
  } = useChatContext();
  const selectedChat = useMemo(
    () =>
      selectedChatId === "" ? [] : (directChats.get(selectedChatId) ?? []),
    [selectedChatId, directChats],
  );
  const isGroup = useMemo(
    () => selectedChatId.startsWith(ChatType.Group),
    [selectedChatId],
  );

  const selectedContact = useMemo(() => {
    const contactId = parseInt(selectedChatId.substring(1));
    return contacts.get(contactId);
  }, [contacts, selectedChatId]);
  const selectedGroup = useMemo(() => {
    const contactId = parseInt(selectedChatId.substring(1));
    return groups.get(contactId);
  }, [groups, selectedChatId]);

  const contactId = useMemo(
    () =>
      (isGroup
        ? selectedGroup?.groupInfo.groupId
        : selectedContact?.contactId) ?? -1,
    [isGroup, selectedGroup, selectedContact],
  );

  const contactName = useMemo(
    () =>
      isGroup
        ? selectedGroup?.groupInfo.localDisplayName
        : selectedContact?.localDisplayName,
    [isGroup, selectedGroup, selectedContact],
  );
  const contactAvatarUrl = useMemo(
    () =>
      isGroup
        ? selectedGroup?.groupInfo.groupProfile.image
        : selectedContact?.profile.image,
    [isGroup, selectedContact, selectedGroup],
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (message.trim() !== "") {
        await client.current?.apiSendMessages(
          isGroup ? ChatType.Group : ChatType.Direct,
          contactId,
          [
            {
              msgContent: {
                type: "text",
                text: message,
              },
            },
          ],
        );
        toast("Your message has been successfully sent");
      }
    },
    [client, contactId, isGroup],
  );

  const ChatMessages = useCallback(
    (messages: ChatItem[], contact?: Contact) => {
      return [...messages].reverse().map((msg, index) => {
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
          case "rcvMsgContent": {
            let displayName = "No Display Name";
            switch (msg.chatDir.type) {
              case "groupRcv":
                displayName = msg.chatDir.groupMember.localDisplayName;
                break;
              case "directRcv":
                displayName = contact ? contact?.localDisplayName : displayName;
                break;
            }
            return (
              <MessageBubble heading={displayName} side="right" key={index}>
                {msg.content.msgContent.text}
              </MessageBubble>
            );
          }
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
    },
    [activeUser],
  );

  return (
    <div className={`w-full h-full flex flex-col gap-2 overflow-hidden`}>
      <div className="p-4 bg-theme-mantle w-full border-b-[1px] border-theme-base flex items-center gap-2 shrink-0">
        <div className="mr-4">
          <SidebarTrigger />
        </div>

        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage
              src={contactAvatarUrl}
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
          className="overflow-y-auto overflow-x-hidden p-2 flex flex-col-reverse h-full max-h-full gap-2 flex-grow border-muted border rounded"
        >
          {selectedChatId === ""
            ? null
            : ChatMessages(selectedChat, selectedContact)}
        </div>
        <MessageInput onSubmit={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
