interface TypingIndicatorProps {
  avatar: string;
  name: string;
}

const TypingIndicator = ({ avatar, name }: TypingIndicatorProps) => {
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDuration: '0.6s', animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDuration: '0.6s', animationDelay: '150ms' }}
          />
          <span 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDuration: '0.6s', animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
