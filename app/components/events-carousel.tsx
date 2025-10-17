"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface EventImage {
  src: string;
  alt: string;
}

interface EventsCarouselProps {
  images: EventImage[];
}

export default function EventsCarousel({ images }: EventsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Triple the images for seamless infinite scroll
  const tripleImages = [...images, ...images, ...images];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Start at the middle set of images
    const cardWidth = container.scrollWidth / tripleImages.length;
    container.scrollLeft = cardWidth * images.length;

    let intervalId: NodeJS.Timeout;

    const autoScroll = () => {
      if (!isPaused && container) {
        container.scrollBy({
          left: cardWidth,
          behavior: "smooth",
        });
      }
    };

    // Auto-scroll every 3 seconds
    intervalId = setInterval(autoScroll, 3000);

    return () => clearInterval(intervalId);
  }, [isPaused, images.length, tripleImages.length]);

  // Handle infinite scroll wraparound
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / tripleImages.length;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollPos = container.scrollLeft;

      // If scrolled past the end of the middle set, jump to start of middle set
      if (scrollPos >= cardWidth * images.length * 2) {
        container.scrollLeft = scrollPos - cardWidth * images.length;
      }
      // If scrolled before the start of the middle set, jump to end of middle set
      else if (scrollPos < cardWidth * images.length) {
        container.scrollLeft = scrollPos + cardWidth * images.length;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [images.length, tripleImages.length]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / tripleImages.length;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-900"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Carousel */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-6 px-6 sm:px-10">
          {tripleImages.map((image, index) => (
            <div
              key={index}
              className="flex-none w-[80vw] sm:w-[45vw] lg:w-[30vw]"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-slate-100 shadow-lg transition-all duration-300 hover:shadow-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
