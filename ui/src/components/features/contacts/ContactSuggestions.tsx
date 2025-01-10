import React from "react";

import { getChatKey } from "@/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Contact } from "@/lib/response";
import useChatContext from "@/useChatContext";

type ContactSuggestionsProps = {
  contactsList: Contact[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function ContactSuggestions({
  contactsList,
  setOpen,
}: ContactSuggestionsProps) {
  const { setSelectedChatId } = useChatContext();

  function handleContactSelection(contact: Contact) {
    const chatKey = getChatKey({ contact });
    setSelectedChatId(chatKey);
    setOpen(false);
  }

  return (
    <div className="flex gap-3 p-2">
      {contactsList.map((contact) => {
        const { contactId, localDisplayName, profile } = contact;

        return (
          <button
            key={contactId}
            onClick={() => handleContactSelection(contact)}
            className="flex flex-col items-center min-w-fit w-10 h-16 p-1 rounded-lg focus:outline-none hover:bg-theme-surface1 transition-colors duration-200 ease-in-out"
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={profile.image} alt={profile.displayName} />
              <AvatarFallback>
                {profile.displayName.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-gray-300 mt-1 max-w-[64px] truncate">
              {localDisplayName}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default ContactSuggestions;
