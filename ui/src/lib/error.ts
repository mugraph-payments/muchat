import { toast } from "sonner";
import { CRChatCmdError } from "./response";

export async function toastError(error: CRChatCmdError) {
  let message = "Error: ";
  switch (error.chatError.type) {
    case "error":
      message += error.chatError.errorType.type
      break;
    case "errorAgent":
      message += error.chatError.agentError.type
      break;
    case "errorStore":
      message += error.chatError.storeError.type
      break;
  }

  toast(message);
}