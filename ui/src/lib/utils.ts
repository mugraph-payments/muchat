import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CRChatCmdError } from "./response";

export const parseSimplexWsChatError = ({ chatError }: CRChatCmdError) => {
  switch (chatError.type) {
    case "error":
      return chatError.errorType.type;
    default:
      return chatError.type;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
