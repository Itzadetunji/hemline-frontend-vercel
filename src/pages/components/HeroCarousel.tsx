import { cn } from "@/lib/utils";
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export const HeroCarousel = () => {
  const currentIndex = useSignal(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useSignal(true);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);

  const handleScroll = (e: Event) => {
    // Ignore scroll events triggered by our own code
    if (isProgrammaticScroll.current) return;

    // User is manually scrolling, stop auto-scroll
    isAutoScrolling.value = false;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const container = e.target as HTMLDivElement;
    const itemWidth = (scrollRef.current?.clientWidth as number) + 8;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / itemWidth);
    currentIndex.value = index;

    // Resume auto-scroll after user stops scrolling (500ms delay)
    scrollTimeoutRef.current = setTimeout(() => {
      isAutoScrolling.value = true;
    }, 500) as unknown as number;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAutoScrolling.value) return;

      const nextIndex = (currentIndex.value + 1) % 3;
      currentIndex.value = nextIndex;

      if (scrollRef.current) {
        isProgrammaticScroll.current = true;
        const itemWidth = scrollRef.current.clientWidth + 8;
        scrollRef.current.scrollTo({
          left: nextIndex * itemWidth,
          behavior: "smooth",
        });

        // Reset flag after scroll animation completes
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 600);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div class="relative h-fit self-center">
      <div
        class="flex h-103 w-full snap-x snap-mandatory gap-2 self-center overflow-x-scroll max-md:pt-20 md:max-w-100"
        style={{ scrollbarWidth: "none" }}
        ref={scrollRef}
        role="region"
        aria-label="hero carousel"
        onScroll={handleScroll}
      >
        <img class="h-full min-w-full flex-none snap-center object-cover" src="/assets/hero-section/hero-carousel-1.webp" alt="Hero 1" />
        <img class="aspect-square h-full min-w-full flex-none snap-center object-cover" src="/assets/hero-section/hero-carousel-2.webp" alt="Hero 2" />
        <img class="h-full min-w-full flex-none snap-center object-cover" src="/assets/hero-section/hero-carousel-3.webp" alt="Hero 3" />
      </div>
      <ul class="absolute right-4 bottom-4 flex gap-1.5 [&>*]:size-2 [&>*]:bg-white">
        {Array.from({ length: 3 }).map((_, index) => (
          <li className={cn("opacity-40 transition-all duration-300 ease-in-out", { "!w-5 opacity-100": currentIndex.value === index })} />
        ))}
      </ul>
    </div>
  );
};
