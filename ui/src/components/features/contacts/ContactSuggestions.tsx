import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Contact } from "@/lib/response";

type ContactSuggestionsProps = {
  contactsList: Contact[];
};

function ContactSuggestions({ contactsList }: ContactSuggestionsProps) {
  return (
    <div className="flex gap-3 p-2">
      {contactsList.map(({ contactId, localDisplayName, profile }) => (
        <button
          key={contactId}
          className="flex flex-col items-center min-w-fit focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.image} alt={profile.displayName} />
            <AvatarFallback>
              {profile.displayName.at(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-gray-300 mt-1 max-w-[64px] truncate">
            {localDisplayName}
          </p>
        </button>
      ))}
    </div>
  );
}

export default ContactSuggestions;
