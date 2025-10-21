import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4 bg-card/50 backdrop-blur-xl border-white/10">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-24 w-full" />
    </Card>
  </div>
);

export const TrainingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-4 bg-card/50 backdrop-blur-xl border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </Card>
    ))}
  </div>
);

export const NutritionSkeleton = () => (
  <div className="space-y-6">
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-background/50">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </Card>
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-32 w-full" />
    </Card>
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <Card className="max-w-[80%] p-4 bg-card/50 backdrop-blur-xl border-white/10">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    ))}
  </div>
);
