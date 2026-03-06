interface MessageBubbleProps {
  message: any;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg ${
          message.isMe
            ? "bg-primary text-primary-foreground rounded-l-2xl rounded-tr-2xl rounded-br-md"
            : "bg-muted rounded-r-2xl rounded-tl-2xl rounded-bl-md"
        } p-3`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}
