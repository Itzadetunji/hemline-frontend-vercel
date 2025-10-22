import { cn } from "@/lib/utils";
import type { ComponentProps } from "preact";

function Skeleton({ class: className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />;
}

export { Skeleton };
