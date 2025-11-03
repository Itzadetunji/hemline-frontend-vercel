import { Skeleton } from "@/components/ui/skeleton";

export const ClientSkeleton = () => {
  return (
    <div class="flex items-center gap-3.5">
      {/* Avatar skeleton */}
      <Skeleton class="size-8 shrink-0 rounded-xs" />
      {/* Name skeleton */}
      <div class="flex h-10 flex-1 items-center border-b border-b-line">
        <Skeleton class="h-4 w-32 rounded-xs" />
      </div>
    </div>
  );
};
