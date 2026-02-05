"use client";

import Image from "next/image";
import { useState } from "react";

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

export function LazyYouTubeEmbed({
  videoId,
  title,
  className = "",
}: LazyYouTubeEmbedProps) {
  const [isActivated, setIsActivated] = useState(false);

  const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  if (isActivated) {
    return (
      <iframe
        className={`absolute inset-0 h-full w-full ${className}`}
        src={embedSrc}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsActivated(true)}
      className={`absolute inset-0 block h-full w-full overflow-hidden bg-slate-900 ${className}`}
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={thumbnailSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 896px"
        className="object-cover"
      />
      <span className="absolute inset-0 bg-slate-900/25 transition-colors duration-200 hover:bg-slate-900/10" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-xl">
        <span
          className="ml-1 h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[var(--color-accent-primary)]"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
