import { useState } from "preact/hooks";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  className?: string;
}

export const LandingNavbar = ({ className }: LandingNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav class={cn("sticky top-0 z-50 flex items-center justify-between bg-white/80 px-4 py-4 backdrop-blur-md md:px-14", className)}>
      <a href="/" class="flex items-center gap-3.5">
        <img src="/assets/brand/logo.svg" alt="Logo" class="size-9" />
        <h1 class="text-2xl text-black">HEMLINE</h1>
      </a>

      {/* Desktop Menu */}
      <div class="hidden items-center gap-8 md:flex">
        <ul class="flex items-center gap-6">
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

      {/* Mobile Menu Toggle */}
      <button type="button" class="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        <Icon icon={isMenuOpen ? "lucide:x" : "lucide:menu"} className="size-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div class="absolute left-0 top-full flex w-full flex-col border-b border-line bg-white p-4 shadow-lg md:hidden">
          <ul class="flex flex-col gap-4">
            <li>
              <a href="/support" class="block py-2 text-sm hover:underline">
                Support
              </a>
            </li>
            <li>
              <a href="/privacy-policy" class="block py-2 text-sm hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms-and-conditions" class="block py-2 text-sm hover:underline">
                Terms & Conditions
              </a>
            </li>
            <li class="flex flex-col gap-3 pt-2">
              <Button asChild class="w-full border-line" variant="outline">
                <a href="/sign-in">Log in</a>
              </Button>
              <Button asChild class="w-full" variant="secondary">
                <a href="/sign-up">Sign up free</a>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
