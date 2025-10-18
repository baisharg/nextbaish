"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { withLocale, buildLangSwitchHref } from "@/app/utils/locale";
import "./header.css";

// Lazy load mobile menu to reduce initial bundle size
const MobileMenu = dynamic(() => import("./mobile-menu"), {
  ssr: false,
});

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

interface HeaderProps {
  locale: AppLocale;
  t: Dictionary["header"];
}

const TITLE_WORDS = ["Buenos", "Aires", "AI", "Safety", "Hub"] as const;
const COLLAPSE_BUFFER = 80;

// RAF throttle utility for performance
const rafThrottle = <T extends (...args: any[]) => void>(fn: T): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
};

const HeaderComponent = ({ locale, t }: HeaderProps) => {
  const pathname = usePathname() ?? "/";
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const firstRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [restWidths, setRestWidths] = useState<number[]>([]);
  const [firstWidths, setFirstWidths] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMenuBeenOpened, setHasMenuBeenOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isCramped, setIsCramped] = useState(false);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll state internally instead of via PageWrapper
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure widths once on locale change only
  useEffect(() => {
    const widths = restRefs.current.map((element) => element?.offsetWidth ?? 0);
    setRestWidths(widths);
    const leading = firstRefs.current.map((element) => element?.offsetWidth ?? 0);
    setFirstWidths(leading);
  }, [locale]);

  // RAF-throttled resize handler for isNarrow
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 480);
    };

    const throttledCheck = rafThrottle(checkWidth);

    checkWidth();
    window.addEventListener('resize', throttledCheck, { passive: true });
    return () => window.removeEventListener('resize', throttledCheck);
  }, []);

  // RAF-throttled ResizeObserver for overflow detection
  useEffect(() => {
    const container = titleContainerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      setIsCramped((prevCramped) => {
        if (prevCramped) {
          return clientWidth < scrollWidth + COLLAPSE_BUFFER;
        } else {
          return scrollWidth > clientWidth;
        }
      });
    };

    const throttledCheck = rafThrottle(checkOverflow);

    checkOverflow();

    const resizeObserver = new ResizeObserver(throttledCheck);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [locale, restWidths, firstWidths]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => {
      const newValue = !prev;
      if (newValue) {
        setHasMenuBeenOpened(true);
      }
      return newValue;
    });
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    { href: withLocale(locale, "/research"), label: t.nav.research },
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  return (
    <header
      className="header-container sticky top-0 z-20 px-6 sm:px-10"
      data-scrolled={scrolled}
    >
      <div
        className="header-inner mx-auto border-slate-200"
        data-scrolled={scrolled}
      >
        <div className="flex items-center justify-between gap-6">
          <Link href={withLocale(locale, "/")} className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <div
              className="logo-container w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
              data-collapsed={scrolled || isNarrow || isCramped}
            >
              <Image
                src="/jacarandashield.png"
                alt="BAISH Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
                fetchPriority="high"
              />
            </div>
            <div ref={titleContainerRef} className="overflow-hidden min-w-0 flex items-center" aria-label="Buenos Aires AI Safety Hub">
              <div
                className="title-words flex items-center font-semibold text-slate-900 text-base sm:text-lg"
                data-collapsed={scrolled || isNarrow || isCramped}
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
                        className={`title-word-first inline-block${hideFirstOnCollapse ? " overflow-hidden" : ""}`}
                        data-hide-on-collapse={hideFirstOnCollapse}
                        data-collapsed={hideFirstOnCollapse && shouldCollapse}
                        style={{
                          maxWidth:
                            hideFirstOnCollapse && shouldCollapse
                              ? "0px"
                              : hideFirstOnCollapse && firstWidth !== undefined
                                ? `${firstWidth}px`
                                : undefined,
                        }}
                      >
                        {word[0]}
                      </span>
                      <span
                        ref={(node) => {
                          restRefs.current[index] = node;
                        }}
                        className="title-word-rest inline-block overflow-hidden"
                        data-collapsed={collapseRest}
                        style={{
                          maxWidth:
                            collapseRest
                              ? '0px'
                              : measuredWidth !== undefined
                                ? `${measuredWidth}px`
                                : undefined,
                          transformOrigin: 'left',
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
            className="header-nav hidden md:flex items-center text-sm font-medium text-slate-600"
            data-scrolled={scrolled}
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
                const active = lang.code === locale;
                return (
                  <Link
                    key={lang.code}
                    href={buildLangSwitchHref(pathname, lang.code)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--color-accent-primary)] text-white shadow-sm pointer-events-none"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t.languages[lang.code]}
                  </Link>
                );
              })}
            </div>
            <a
              className="header-cta hidden sm:inline-flex rounded-full bg-[var(--color-accent-primary)] font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] whitespace-nowrap"
              data-scrolled={scrolled}
              href="#get-involved"
            >
              {t.cta}
            </a>

            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
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

      {/* Lazy-loaded mobile menu - only loads on first open, then stays mounted for animations */}
      {hasMenuBeenOpened && (
        <MobileMenu
          locale={locale}
          t={t}
          pathname={pathname}
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}
    </header>
  );
};

// Memoized export for performance
export default memo(HeaderComponent);
