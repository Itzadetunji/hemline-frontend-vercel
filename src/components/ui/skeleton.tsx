import { cn } from "@/lib/utils";
import { ComponentProps } from "preact";

function Skeleton({ class: className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-accent animate-pulse rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
