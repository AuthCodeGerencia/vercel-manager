import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-md" />
    </div>
  );
}
