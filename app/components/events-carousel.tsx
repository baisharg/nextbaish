"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface EventImage {
  src: string;
  alt: string;
}

interface EventsCarouselProps {
  images: EventImage[];
}

export default function EventsCarousel({ images }: EventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Duplicate first image at the end for seamless infinite loop
  const extendedImages = [...images, images[0]];
  const totalSlides = images.length;

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const goToPrevious = () => {
    if (currentIndex === 0) {
      // Jump to the duplicate (last position) without animation
      setIsTransitioning(false);
      setCurrentIndex(totalSlides);
      // Then animate to the previous slide
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(totalSlides - 1);
      }, 50);
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex === totalSlides) {
      // We're at the duplicate, reset to index 0 after transition
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500); // Match CSS transition duration

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, totalSlides]);

  // Auto-play
  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, 3000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, currentIndex]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        aria-label="Previous image"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={24} className="text-slate-900" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        aria-label="Next image"
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={24} className="text-slate-900" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className="flex"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
          }}
        >
          {extendedImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="flex-none w-full px-6 sm:px-10"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-slate-100 shadow-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  loading="lazy"
                  quality={85}
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex % totalSlides === index
                ? 'w-8 bg-[var(--color-accent-primary)]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
