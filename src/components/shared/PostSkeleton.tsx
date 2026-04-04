import { Skeleton } from "../ui/skeleton";

export default function PostSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Author Row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-14 rounded-md" />
      </div>
      {/* CTA */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
