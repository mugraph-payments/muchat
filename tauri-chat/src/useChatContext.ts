import { useContext } from "react";
import { ChatContext } from "./ChatContext";

const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatContext must be used within MyProvider");
  return context;
};

export default useChatContext;