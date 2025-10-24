"use client";

import { useState } from "react";
import Image from "next/image";

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  className?: string;
}

/**
 * YouTube Facade Component
 *
 * Displays a thumbnail with a play button overlay. Only loads the full YouTube
 * iframe player when the user clicks to play, saving ~500KB of initial JavaScript.
 *
 * Performance benefits:
 * - Reduces initial page weight by ~500KB
 * - Eliminates YouTube's third-party tracking scripts on initial load
 * - Faster Time to Interactive (TTI)
 * - Lower Total Blocking Time (TBT)
 */
export function YouTubeFacade({ videoId, title, className = "" }: YouTubeFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // When user clicks, load the real iframe
  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <iframe
        className={className}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ border: 0 }}
      />
    );
  }

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onClick={handlePlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePlay();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${title}`}
    >
      {/* YouTube thumbnail (sddefault for guaranteed availability) */}
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
        quality={85}
        priority
        fetchPriority="high"
      />

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/0 transition-all duration-300 hover:bg-black/10" />

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-red-700">
          <svg
            className="ml-1"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5.14001V19.14L19 12.14L8 5.14001Z"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
