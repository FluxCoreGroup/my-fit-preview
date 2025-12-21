interface CoachHeaderProps {
  name: string;
  role: string;
  avatar: string;
  isOnline?: boolean;
}

const CoachHeader = ({ name, role, avatar, isOnline = true }: CoachHeaderProps) => {
  return (
    <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-border"
          />
          {isOnline && (
            <span 
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"
              title="En ligne"
            />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {isOnline && (
              <>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-green-600 dark:text-green-400">En ligne</span>
                <span className="text-muted-foreground/50">•</span>
              </>
            )}
            <span>{role}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachHeader;
