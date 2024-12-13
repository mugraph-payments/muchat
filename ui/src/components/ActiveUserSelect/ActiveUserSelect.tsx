import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";
import { ChatContextType } from "@/ChatContext";

type ActiveUserSelectProps = Pick<ChatContextType, "users" | "activeUser"> & {
  onSelect: (userId: number) => void;
};

const ActiveUserSelect = ({ users, activeUser, onSelect }: ActiveUserSelectProps) => {
  return (
    <Select value={activeUser?.userId.toString()} onValueChange={(newUserId) => onSelect(parseInt(newUserId))}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Users" />
      </SelectTrigger>
      <SelectContent>
        {users.map(({ user }) => (
          <SelectItem value={user.userId.toString()}>
            {user.profile.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ActiveUserSelect;
