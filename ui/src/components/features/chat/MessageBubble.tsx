import clsx from "clsx";

type MessageBubbleProps = {
  heading?: string;
  children: React.ReactNode;
  className?: string;
  limitMessageLenght?: boolean;
  side?: "left" | "right";
  key?: string | number;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  className,
  heading,
  children,
  limitMessageLenght = false,
  side = "left",
  key,
}) => {
  return (
    <div
      key={key}
      className={clsx(
        "p-2 px-4 rounded bg-theme-surface0 flex flex-col gap-1 w-fit max-w-full break-words",
        `${side === "right" && `ml-auto`}`,
        limitMessageLenght
          ? `max-h-44 overflow-hidden line-clamp-3 text-ellipsis`
          : null,
        className,
      )}
    >
      {heading && (
        <span
          className={`text-theme-blue rounded bg-theme-surface0 flex flex-col gap-1 w-full`}
        >
          {heading}
        </span>
      )}
      {children}
    </div>
  );
};
