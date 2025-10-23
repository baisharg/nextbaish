"use client";

import { useRef, useState, MouseEvent } from "react";

interface InteractiveCourseCardProps {
  title: string;
  description: string;
  category: string;
  createdBy: string;
  url: string;
  icon: "book" | "graduation";
  accentColor: string;
}

export function InteractiveCourseCard({
  title,
  description,
  category,
  createdBy,
  url,
  icon,
  accentColor,
}: InteractiveCourseCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const IconSVG = icon === "book" ? (
    <svg className="h-6 w-6 text-[#9275E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ) : (
    <svg className="h-6 w-6 text-[#9275E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );

  return (
    <a
      ref={cardRef}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 transition-all duration-300 hover:border-transparent hover:shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Cursor glow effect */}
      {isHovered && (
        <div
          className="pointer-events-none absolute z-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            width: '300px',
            height: '300px',
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}20 40%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10, transparent)`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            {IconSVG}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-[#9275E5]">
              {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
          {/* Arrow icon that appears on hover */}
          <div className="flex-shrink-0 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            <svg className="h-5 w-5 text-[#9275E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 transition-colors duration-300 group-hover:bg-[#9275E5]/10 group-hover:text-[#9275E5]">
            <span className="font-medium">Category:</span> {category}
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 transition-colors duration-300 group-hover:bg-[#9275E5]/10 group-hover:text-[#9275E5]">
            <span className="font-medium">Created by:</span> {createdBy}
          </div>
        </div>
      </div>
    </a>
  );
}
