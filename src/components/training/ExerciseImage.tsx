import { useState, useEffect } from "react";
import { useExerciseImage } from "@/hooks/useExerciseImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseImageProps {
  exerciseName: string;
  englishName?: string;
  size?: "sm" | "md" | "lg";
  showGif?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-full h-48",
};

export const ExerciseImage = ({
  exerciseName,
  englishName,
  size = "md",
  showGif = true,
  className,
  onClick,
}: ExerciseImageProps) => {
  const { imageUrl, gifUrl, isLoading, source } = useExerciseImage(
    exerciseName,
    englishName,
  );
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // For lg size, autoplay GIF without needing hover
  const autoPlayGif = size === "lg" && showGif && gifUrl;

  // Determine which URL to show - autoplay for lg, hover for others
  const displayUrl = autoPlayGif
    ? gifUrl
    : showGif && isHovered && gifUrl
      ? gifUrl
      : imageUrl;

  const isVideo = displayUrl?.includes(".mp4");

  // Reset error state when exercise changes
  useEffect(() => {
    setHasError(false);
  }, [exerciseName]);

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
          className,
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
        "bg-gradient-to-r from-muted/30 via-white/80 to-muted/30 border border-border/20",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isVideo ? (
        <video
          src={displayUrl}
          className="w-[60%] h-full mx-auto relative z-10"
          autoPlay={!!autoPlayGif || isHovered}
          loop
          muted
          playsInline
          onError={() => setHasError(true)}
        />
      ) : (
        <img
          src={displayUrl}
          alt={exerciseName}
          className="w-[60%] md:w-[20%] h-full object-cover transition-transform group-hover:scale-105 mx-auto relative z-10"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      )}

      {/* Play indicator for GIF/video - only show for non-lg sizes */}
      {gifUrl && !autoPlayGif && !isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      )}
    </div>
  );
};
