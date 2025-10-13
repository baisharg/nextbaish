"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

interface HeaderProps {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
  scrolled: boolean;
}

const TITLE_WORDS = ["Buenos", "Aires", "AI", "Safety", "Hub"] as const;
const COLLAPSE_BUFFER = 80; // Pixels of extra space needed before re-expanding

export default function Header({ language, setLanguage, scrolled }: HeaderProps) {
  const isEnglish = language === "en";
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const firstRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [restWidths, setRestWidths] = useState<number[]>([]);
  const [firstWidths, setFirstWidths] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isCramped, setIsCramped] = useState(false);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widths = restRefs.current.map((element) => element?.offsetWidth ?? 0);
    setRestWidths(widths);
    const leading = firstRefs.current.map((element) => element?.offsetWidth ?? 0);
    setFirstWidths(leading);
  }, [language]);

  // Detect narrow viewport
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 480);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Detect title overflow (when text is being clipped)
  useEffect(() => {
    const container = titleContainerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      // Use hysteresis to prevent jiggling:
      // - Collapse when text is overflowing
      // - Only expand when there's significant extra space
      setIsCramped((prevCramped) => {
        if (prevCramped) {
          // Currently collapsed: only expand if there's buffer space
          return clientWidth < scrollWidth + COLLAPSE_BUFFER;
        } else {
          // Currently expanded: collapse if overflowing
          return scrollWidth > clientWidth;
        }
      });
    };

    // Initial check
    checkOverflow();

    // Use ResizeObserver for efficient monitoring
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [language, restWidths, firstWidths]); // Re-check when language or widths change

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/about", label: isEnglish ? "About" : "Sobre nosotros" },
    { href: "/activities", label: isEnglish ? "Activities" : "Actividades" },
    { href: "/research", label: isEnglish ? "Research" : "Investigación" },
    { href: "/resources", label: isEnglish ? "Resources" : "Recursos" },
    { href: "/contact", label: isEnglish ? "Contact" : "Contacto" },
  ];

  return (
    <header
      className="sticky top-0 z-20 will-change-transform px-6 sm:px-10"
      style={{
        transform: 'translateZ(0)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div
        className="mx-auto transition-all border-slate-200"
        style={{
          maxWidth: scrolled ? '1100px' : '1280px',
          marginTop: scrolled ? '1rem' : '0',
          borderRadius: scrolled ? '9999px' : '0',
          borderWidth: scrolled ? '1px' : '0 0 1px 0',
          backgroundColor: scrolled ? 'rgb(255, 255, 255)' : 'transparent',
          boxShadow: scrolled ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none',
          paddingLeft: scrolled ? '2rem' : '0',
          paddingRight: scrolled ? '2rem' : '0',
          paddingTop: scrolled ? '0.75rem' : '1rem',
          paddingBottom: scrolled ? '0.75rem' : '1rem',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
              style={{
                transform: (scrolled || isNarrow || isCramped) ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Image
                src="/jacarandashield.png"
                alt="BAISH Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div ref={titleContainerRef} className="overflow-hidden min-w-0 flex items-center" aria-label="Buenos Aires AI Safety Hub">
              <div
                className="flex items-center font-semibold text-slate-900 text-base sm:text-lg"
                style={{
                  gap: (scrolled || isNarrow || isCramped) ? '0.18rem' : '0.4rem',
                  letterSpacing: (scrolled || isNarrow || isCramped) ? '0.05em' : '0.01em',
                  transition: 'gap 0.6s cubic-bezier(0.4, 0, 0.2, 1), letter-spacing 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {TITLE_WORDS.map((word, index) => {
                  const rest = word.slice(1);
                  const measuredWidth = restWidths[index];
                  const firstWidth = firstWidths[index];
                  const shouldCollapse = scrolled || isNarrow || isCramped;
                  const hideFirstOnCollapse = word === "AI";
                  const collapseRest = shouldCollapse && word !== "AI";

                  return (
                    <span key={word} className="relative flex">
                      <span
                        ref={(node) => {
                          firstRefs.current[index] = node;
                        }}
                        className={`inline-block${hideFirstOnCollapse ? " overflow-hidden" : ""}`}
                        style={{
                          maxWidth:
                            hideFirstOnCollapse && shouldCollapse
                              ? "0px"
                              : hideFirstOnCollapse && firstWidth !== undefined
                                ? `${firstWidth}px`
                                : undefined,
                          opacity: hideFirstOnCollapse && shouldCollapse ? 0 : 1,
                          transition: hideFirstOnCollapse
                            ? "max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                            : "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {word[0]}
                      </span>
                      <span
                        ref={(node) => {
                          restRefs.current[index] = node;
                        }}
                        className="inline-block overflow-hidden"
                        style={{
                          marginLeft: 0,
                          maxWidth:
                            collapseRest
                              ? '0px'
                              : measuredWidth !== undefined
                                ? `${measuredWidth}px`
                                : undefined,
                          opacity: collapseRest ? 0 : 1,
                          transition: 'max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rest ? rest : ''}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </Link>
          <nav
            className="hidden md:flex items-center text-sm font-medium text-slate-600"
            style={{
              gap: scrolled ? '0.75rem' : '1.5rem',
              transition: 'gap 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`rounded-full border border-slate-200 bg-white/70 p-1 transition-all duration-500 ${
              scrolled ? "hidden sm:flex" : "hidden md:flex"
            }`}>
              {LANGUAGES.map((lang) => {
                const active = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setLanguage(lang.code)}
                    type="button"
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
            <a
              className="hidden sm:inline-flex rounded-full bg-[var(--color-accent-primary)] font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] whitespace-nowrap"
              style={{
                padding: scrolled ? '0.5rem 0.75rem' : '0.5rem 1rem',
                fontSize: scrolled ? '0.75rem' : '0.875rem',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              href="#get-involved"
            >
              {isEnglish ? "Join Us" : "Únete"}
            </a>

            {/* Hamburger button */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? (isEnglish ? "Close menu" : "Cerrar menú") : (isEnglish ? "Open menu" : "Abrir menú")}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{
                    transform: mobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
                  }}
                />
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{
                    opacity: mobileMenuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="w-full h-0.5 bg-slate-900 transition-all duration-300"
                  style={{
                    transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className="fixed top-0 right-0 w-full z-40 md:hidden rounded-l-3xl border-l border-t border-b border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FF2a] shadow-xl overflow-hidden"
        style={{
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex flex-col">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
            <span className="text-lg font-semibold text-slate-900">
              {isEnglish ? "Menu" : "Menú"}
            </span>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={isEnglish ? "Close menu" : "Cerrar menú"}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Mobile navigation links */}
          <nav className="px-4 py-6 sm:px-6">
            {/* Home link with logo */}
            <Link
              href="/"
              className="flex items-center gap-3 mb-6 px-4 py-3 hover:bg-white/60 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/jacarandashield.png"
                alt="BAISH Logo"
                width={32}
                height={32}
                className="object-contain flex-shrink-0"
                priority
              />
              <span className="text-lg font-semibold text-slate-900">BAISH</span>
            </Link>

            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-4 py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Language switcher in mobile menu */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="px-4 mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {isEnglish ? "Language" : "Idioma"}
              </p>
              <div className="flex gap-3">
                {LANGUAGES.map((lang) => {
                  const active = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      className={`flex-1 rounded-lg px-4 py-3 text-base font-medium transition ${
                        active
                          ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                          : "bg-white/60 text-slate-700 hover:bg-white"
                      }`}
                      onClick={() => setLanguage(lang.code)}
                      type="button"
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Mobile menu footer with CTA */}
          <div className="p-4 sm:p-6 border-t border-slate-200">
            <a
              className="flex items-center justify-center w-full rounded-full bg-[var(--color-accent-primary)] px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] transition"
              href="#get-involved"
              onClick={() => setMobileMenuOpen(false)}
            >
              {isEnglish ? "Join Us" : "Únete"}
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
}
