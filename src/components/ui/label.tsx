import type { JSX } from "preact";

import { cn } from "../../lib/utils";

function Label({ class: className, ...props }: JSX.IntrinsicElements["label"]) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
