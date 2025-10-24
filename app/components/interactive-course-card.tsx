"use client";

import { useRef, useState, MouseEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon, GraduationScrollIcon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

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
    <HugeiconsIcon icon={BookOpen01Icon} size={24} className="text-[#9275E5]" />
  ) : (
    <HugeiconsIcon icon={GraduationScrollIcon} size={24} className="text-[#9275E5]" />
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
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} className="text-[#9275E5]" />
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
