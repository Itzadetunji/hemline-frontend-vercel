/** biome-ignore-all lint/style/useFilenamingConvention: This is a carousel */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "preact/hooks";

export const CollectionCarousel = () => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  // Double the items for seamless looping
  const extendedCarousel = [...carousel, ...carousel];

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    // Calculate the width of the original set (distance to the start of the first duplicate)
    // The first duplicate is at index `carousel.length`
    const originalSetWidth = (container.children[carousel.length] as HTMLElement)?.offsetLeft || container.scrollWidth / 2;

    // Timeline for gsap
    const tl = gsap.to(container, {
      x: -originalSetWidth,
      duration: 30, // Slower duration for a smoother, premium feel
      ease: "none",
      repeat: -1,
    });

    const pause = () => tl.pause();
    const resume = () => tl.play();

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      tl.kill();
    };
  }, []);

  return (
    <div className="h-70 w-0 min-w-full self-start overflow-hidden py-8">
      <ul ref={containerRef} className="flex items-center gap-4" style={{ width: "max-content" }}>
        {extendedCarousel.map((partner, idx) => (
          <img key={`${partner}-${idx}`} src={partner} alt="Collection Item" className="h-56 w-43 object-cover" />
        ))}
      </ul>
    </div>
  );
};

const carousel = [
  "/assets/landing-page/carousel/carousel-1.webp",
  "/assets/landing-page/carousel/carousel-2.webp",
  "/assets/landing-page/carousel/carousel-3.webp",
  "/assets/landing-page/carousel/carousel-4.webp",
  "/assets/landing-page/carousel/carousel-5.webp",
  "/assets/landing-page/carousel/carousel-6.webp",
  "/assets/landing-page/carousel/carousel-1.webp",
  "/assets/landing-page/carousel/carousel-2.webp",
  "/assets/landing-page/carousel/carousel-3.webp",
  "/assets/landing-page/carousel/carousel-4.webp",
  "/assets/landing-page/carousel/carousel-5.webp",
  "/assets/landing-page/carousel/carousel-6.webp",
];
