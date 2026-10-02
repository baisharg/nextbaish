"use client";

import Image from "next/image";
import Link from "next/link";
import { TransitionLink } from "./transition-link";
import { ScrollToButton } from "./scroll-to-button";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { withLocale, buildLangSwitchHref } from "@/app/utils/locale";
import { publicPathname } from "@/app/lab-routes";
import { useIsomorphicLayoutEffect } from "@/app/hooks/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/app/hooks/use-prefers-reduced-motion";
import { usePrefetchAlternateLocale } from "@/app/hooks/use-prefetch-alternate-locale";
import "./header.css";

// Lazy load mobile menu to reduce initial bundle size
const MobileMenu = dynamic(() => import("./mobile-menu"), {
  ssr: false,
  loading: () => <div className="mm-loading" aria-hidden="true" />,
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

// Scroll hysteresis thresholds to prevent jittering
const SCROLL_DOWN_THRESHOLD = 100; // Pixels scrolled down before collapsing
const SCROLL_UP_THRESHOLD = 50; // Pixels scrolled up before expanding

// RAF throttle utility for performance
const rafThrottle = <T extends (...args: unknown[]) => void>(
  fn: T,
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
};

/** How far down the page the reader is, for the progress thread (0 to 1) */
const setScrollProgress = (header: HTMLElement | null) => {
  if (!header) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  header.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const HeaderComponent = ({ locale, t }: HeaderProps) => {
  const pathname = publicPathname(usePathname() ?? "/");
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const firstRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [restWidths, setRestWidths] = useState<number[]>([]);
  const [firstWidths, setFirstWidths] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMenuBeenOpened, setHasMenuBeenOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isCramped, setIsCramped] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  usePrefetchAlternateLocale(locale, pathname);

  // Handle scroll state with hysteresis
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollProgress(headerRef.current);
          const direction =
            currentScrollY > lastScrollY.current ? "down" : "up";

          // Hysteresis: different thresholds for scrolling down vs up
          let shouldBeScrolled = scrolled;

          if (direction === "down" && currentScrollY > SCROLL_DOWN_THRESHOLD) {
            shouldBeScrolled = true;
          } else if (
            direction === "up" &&
            currentScrollY < SCROLL_UP_THRESHOLD
          ) {
            shouldBeScrolled = false;
          }

          setScrolled(shouldBeScrolled);
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    setScrollProgress(headerRef.current);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Measure widths once on locale change only - use layout effect to prevent CLS
  useIsomorphicLayoutEffect(() => {
    const widths = restRefs.current.map((element) => element?.offsetWidth ?? 0);
    setRestWidths(widths);
    const leading = firstRefs.current.map(
      (element) => element?.offsetWidth ?? 0,
    );
    setFirstWidths(leading);
  }, [locale]);

  // RAF-throttled resize handler for isNarrow
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 480);
    };

    const throttledCheck = rafThrottle(checkWidth);

    checkWidth();
    window.addEventListener("resize", throttledCheck, { passive: true });
    return () => window.removeEventListener("resize", throttledCheck);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const newValue = !prev;
      if (newValue) {
        setHasMenuBeenOpened(true);
      }
      return newValue;
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // A single highlight slides to whichever link is hovered or focused. It
  // appears in place (only opacity animates) and slides once visible.
  const moveIndicator = (event: { currentTarget: HTMLElement }) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const link = event.currentTarget;
    indicator.style.transitionProperty =
      indicator.dataset.visible === "true" ? "" : "opacity";
    indicator.style.setProperty("--x", `${link.offsetLeft}px`);
    indicator.style.setProperty("--w", `${link.offsetWidth}px`);
    indicator.dataset.visible = "true";
  };

  const hideIndicator = () => {
    if (indicatorRef.current) indicatorRef.current.dataset.visible = "false";
  };

  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    { href: withLocale(locale, "/research"), label: t.nav.research },
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  return (
    <header
      ref={headerRef}
      className="header-container sticky top-0 z-20 px-6 sm:px-10"
      data-scrolled={scrolled}
      data-reduced-motion={prefersReducedMotion}
    >
      <div className="header-inner mx-auto" data-scrolled={scrolled}>
        <span className="header-progress" aria-hidden="true" />
        <div className="flex items-center justify-between gap-6">
          <TransitionLink
            href={withLocale(locale, "/")}
            className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div
              className="logo-container w-10 h-10 flex-shrink-0"
              data-collapsed={scrolled || isNarrow || isCramped}
            >
              <Image
                src="/images/logo.svg"
                alt="BAISH Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain site-logo"
                priority
                fetchPriority="high"
              />
            </div>
            <div
              ref={titleContainerRef}
              className="overflow-hidden min-w-0 flex items-center"
              aria-label="Buenos Aires AI Safety Hub"
              style={{
                minWidth: scrolled || isCramped ? "60px" : "220px",
                transition:
                  "min-width 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)",
              }}
            >
              <div
                className="title-words flex items-center font-semibold text-base sm:text-lg"
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
                        className={`title-word-first title-word-first-${index} inline-block${hideFirstOnCollapse ? " overflow-hidden" : ""}`}
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
                        className={`title-word-rest title-word-rest-${index} inline-block overflow-hidden`}
                        data-collapsed={collapseRest}
                        style={{
                          maxWidth: collapseRest
                            ? "0px"
                            : measuredWidth !== undefined
                              ? `${measuredWidth}px`
                              : undefined,
                          transformOrigin: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rest ? rest : ""}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </TransitionLink>
          <nav
            className="header-nav hidden md:flex items-center"
            data-scrolled={scrolled}
            onMouseLeave={hideIndicator}
            onBlur={hideIndicator}
          >
            <span
              ref={indicatorRef}
              className="header-nav-indicator"
              aria-hidden="true"
            />
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              const pathSegment =
                link.href.split("/").filter(Boolean).pop() || "";
              const transitionClass = `header-nav-${pathSegment}`;
              return (
                <TransitionLink
                  key={link.href}
                  className={`header-nav-link ${transitionClass}`}
                  aria-current={isActive ? "page" : undefined}
                  href={link.href}
                  onMouseEnter={moveIndicator}
                  onFocus={moveIndicator}
                >
                  {link.label}
                </TransitionLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`header-lang ${
                scrolled ? "hidden sm:flex" : "hidden md:flex"
              }`}
            >
              {LANGUAGES.map((lang) => {
                const active = lang.code === locale;
                const langHref = buildLangSwitchHref(pathname, lang.code);
                // A plain link, not a view transition: switching locale
                // remounts the [locale] layout, including the ViewTransitions
                // provider, so the transition never finishes and the browser
                // shows the old page until it times out (4s in Chrome).
                return (
                  <Link
                    key={lang.code}
                    href={langHref}
                    className="header-lang-option"
                    aria-current={active ? "true" : undefined}
                    aria-label={t.languages[lang.code]}
                    lang={lang.code}
                  >
                    {lang.code.toUpperCase()}
                  </Link>
                );
              })}
            </div>
            <ScrollToButton
              className="header-cta hidden sm:inline-flex"
              data-scrolled={scrolled}
              targetId="get-involved"
              navigateTo={withLocale(locale, "/")}
            >
              {t.cta}
              <span className="header-cta-arrow" aria-hidden="true">
                →
              </span>
            </ScrollToButton>

            <button
              ref={mobileMenuButtonRef}
              className="header-menu-btn md:hidden flex flex-col justify-center items-center"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className="header-menu-line"
                  style={{
                    transform: mobileMenuOpen
                      ? "rotate(45deg) translateY(7px)"
                      : "none",
                  }}
                />
                <span
                  className="header-menu-line"
                  style={{
                    opacity: mobileMenuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="header-menu-line"
                  style={{
                    transform: mobileMenuOpen
                      ? "rotate(-45deg) translateY(-7px)"
                      : "none",
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
          triggerRef={mobileMenuButtonRef}
        />
      )}
    </header>
  );
};

export default HeaderComponent;
