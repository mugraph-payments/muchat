import clsx from "clsx";

type MessageBubbleProps = {
  heading?: string;
  children: React.ReactNode;
  className?: string;
  limitMessageLenght?: boolean;
  side?: "left" | "right";
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  className,
  heading,
  children,
  limitMessageLenght = true,
  side = "left",
}) => {
  return (
    <div
      className={clsx(
        "p-2 px-4 rounded bg-theme-surface0 flex flex-col gap-1 w-fit",
        `${side === "right" && `ml-auto`}`,
        limitMessageLenght
          ? `max-h-44 overflow-hidden line-clamp-3 text-ellipsis`
          : null,
        className,
      )}
    >
      {heading && (
        <span
          className={`text-theme-blue p-2 rounded bg-theme-surface0 flex flex-col gap-1 w-full`}
        >
          {heading}
        </span>
      )}
      {children}
    </div>
  );
};
