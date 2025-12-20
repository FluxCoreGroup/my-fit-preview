import { useState } from "react";
import { useExerciseImage } from "@/hooks/useExerciseImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseImageProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
  showGif?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-full h-48"
};

export const ExerciseImage = ({
  exerciseName,
  size = "md",
  showGif = true,
  className,
  onClick
}: ExerciseImageProps) => {
  const { imageUrl, gifUrl, isLoading, source } = useExerciseImage(exerciseName);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine which URL to show
  const displayUrl = showGif && isHovered && gifUrl ? gifUrl : imageUrl;
  const isVideo = displayUrl?.includes(".mp4");

  if (isLoading) {
    return (
      <Skeleton className={cn(sizeClasses[size], "rounded-lg", className)} />
    );
  }

  if (hasError || source === "fallback") {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          "rounded-lg bg-muted/50 flex items-center justify-center",
          className
        )}
      >
        <ImageIcon className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-lg overflow-hidden relative cursor-pointer group",
        "bg-muted/30 border border-white/10",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isVideo ? (
        <video
          src={displayUrl}
          className="w-full h-full object-cover"
          autoPlay={isHovered}
          loop
          muted
          playsInline
          onError={() => setHasError(true)}
        />
      ) : (
        <img
          src={displayUrl}
          alt={exerciseName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      )}
      
      {/* Play indicator for GIF/video on hover */}
      {gifUrl && !isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      )}
    </div>
  );
};
