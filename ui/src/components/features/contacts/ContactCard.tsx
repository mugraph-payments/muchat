import { Avatar, AvatarFallback } from "@/components/ui/Avatar";

type ContactCardProps = {
  contactsList: string[];
};

function ContactCard({ contactsList }: ContactCardProps) {
  return (
    <div className="flex gap-3 p-2">
      {[...contactsList].map((name) => (
        <div className="flex flex-col items-center min-w-fit">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{name.at(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-gray-300 mt-1 max-w-[64px] truncate">
            {name}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ContactCard;
