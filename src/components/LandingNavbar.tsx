import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  className?: string;
}

export const LandingNavbar = ({ className }: LandingNavbarProps) => {
  return (
    <nav class={cn("flex items-center justify-between", className)}>
      <a href="/" class="flex items-center gap-3.5">
        <img src="/assets/brand/logo.svg" alt="Logo" class="size-9" />
        <h1 class="text-2xl text-black">HEMLINE</h1>
      </a>
      <div class="flex items-center gap-8">
        <ul class="hidden items-center gap-6 md:flex">
          <li>
            <a href="/support" class="text-sm hover:underline">
              Support
            </a>
          </li>
          <li>
            <a href="/privacy-policy" class="text-sm hover:underline">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/terms-and-conditions" class="text-sm hover:underline">
              Terms & Conditions
            </a>
          </li>
        </ul>
        <ul class="flex items-center gap-3">
          <Button asChild class="border-line" variant="outline">
            <a href="/sign-in">Log in</a>
          </Button>
          <Button asChild class="" variant="secondary">
            <a href="/sign-up">Sign up free</a>
          </Button>
        </ul>
      </div>
    </nav>
  );
};
