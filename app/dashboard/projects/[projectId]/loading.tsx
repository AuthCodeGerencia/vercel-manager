import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
