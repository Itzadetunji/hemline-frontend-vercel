/** biome-ignore-all lint/style/useFilenamingConvention: This is a carousel */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "preact/hooks";

export const CollectionCarousel = () => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    // I am cloning the items so the animation can be seamless
    const items = container.children;
    const itemsArray = Array.from(items);

    // Add all the items to the div there
    itemsArray.forEach((item) => {
      const clone = item.cloneNode(true);
      container.appendChild(clone);
    });

    // The width is half of the width of the container since we cloned the items
    const totalWidth = container.scrollWidth / 2;

    // Timeline for gsap
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(container, {
      x: -totalWidth,
      duration: 30,
      ease: "none",
      onComplete: () => {
        gsap.set(container, { x: 0 });
      },
    });

    container.addEventListener("mouseenter", () => tl.pause());
    container.addEventListener("mouseleave", () => tl.resume());

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="h-70 self-start overflow-hidden py-8">
      <ul ref={containerRef} className="flex items-center gap-4" id="partner-container" style={{ width: "fit-content" }}>
        {carousel.map((partner, idx) => (
          <img key={partner} src={partner} alt={partner.split("/")[5]} className="h-56 w-43 object-cover" id={`carousel-${idx}`} />
        ))}
      </ul>
    </div>
  );
};

const carousel = [
  "/assets/landing-page/carousel/carousel-1.jpg",
  "/assets/landing-page/carousel/carousel-2.jpg",
  "/assets/landing-page/carousel/carousel-3.jpg",
  "/assets/landing-page/carousel/carousel-4.jpg",
  "/assets/landing-page/carousel/carousel-5.jpg",
  "/assets/landing-page/carousel/carousel-6.jpg",
];
