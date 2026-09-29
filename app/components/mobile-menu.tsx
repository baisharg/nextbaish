"use client";
"use no memo";

import Image from "next/image";
import { TransitionLink } from "./transition-link";
import { ScrollToButton } from "./scroll-to-button";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { buildLangSwitchHref, withLocale } from "@/app/utils/locale";
import "./mobile-menu.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

/**
 * The site's thread motif, drawn once as a still: threads cross at "today",
 * most fall away and one rises. viewBox units; stretched to the menu width.
 */
const FALLING = Array.from({ length: 14 }, (_, i) => {
  const t = i / 13;
  const y0 = 16 + t * 20;
  const kink = 29 + ((i * 7) % 5) - 2;
  const end = 48 + t * 10;
  return `M0 ${y0.toFixed(1)} C18 ${y0.toFixed(1)} 26 ${kink} 40 ${kink} C58 ${kink} 70 ${end.toFixed(1)} 100 ${end.toFixed(1)}`;
});
const RISING = "M0 24 C18 24 26 29 40 29 C60 29 74 6 100 3";

interface MobileMenuProps {
  locale: AppLocale;
  t: Dictionary["header"];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileMenu({
  locale,
  t,
  pathname,
  isOpen,
  onClose,
  triggerRef,
}: MobileMenuProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getFocusableElements = (container: HTMLElement) => {
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    return elements.filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.getAttribute("aria-hidden") !== "true"
      );
    });
  };

  // Focus trap, escape handling, and focus return. Waits for the portal to
  // mount, so the close button exists on the first open too.
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      wasOpenRef.current = true;
      previousFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const focusTimer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      const handleDialogKeyboard = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }

        if (event.key !== "Tab") return;

        const dialogNode = dialogRef.current;
        if (!dialogNode) return;
        const focusable = getFocusableElements(dialogNode);

        if (focusable.length === 0) {
          event.preventDefault();
          dialogNode.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", handleDialogKeyboard);
      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener("keydown", handleDialogKeyboard);
      };
    }

    if (wasOpenRef.current) {
      const focusTarget = triggerRef.current ?? previousFocusedRef.current;
      focusTarget?.focus();
      wasOpenRef.current = false;
      previousFocusedRef.current = null;
    }
  }, [mounted, isOpen, onClose, triggerRef]);

  // Trigger animation after mount for smooth entry
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
    } else {
      setShouldAnimate(false);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const homeHref = withLocale(locale, "/");
  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    { href: withLocale(locale, "/research"), label: t.nav.research },
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  if (!mounted) return null;

  const menuContent = (
    <div
      ref={dialogRef}
      className="mm-sheet"
      data-open={shouldAnimate || undefined}
      role="dialog"
      aria-modal={isOpen ? true : undefined}
      aria-labelledby="mobile-menu-title"
      aria-hidden={!isOpen}
      tabIndex={-1}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
      }}
    >
      <div className="mm-top">
        <TransitionLink href={homeHref} className="mm-brand" onClick={onClose}>
          <Image src="/images/logo.svg" alt="" width={32} height={32} />
          <span>BAISH</span>
        </TransitionLink>
        <h2 id="mobile-menu-title" className="mm-sr-only">
          {t.menu}
        </h2>
        <button
          ref={closeButtonRef}
          className="mm-close"
          onClick={onClose}
          aria-label={t.closeMenu}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      <nav className="mm-nav" aria-label={t.menu}>
        <ol>
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            const pathSegment =
              link.href.split("/").filter(Boolean).pop() || "";
            return (
              <li key={link.href} style={{ "--mm-i": i } as React.CSSProperties}>
                <TransitionLink
                  href={link.href}
                  className={`mm-link header-nav-${pathSegment}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onClose}
                >
                  <span className="mm-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mm-label">{link.label}</span>
                  <span className="mm-arrow" aria-hidden="true">
                    →
                  </span>
                </TransitionLink>
              </li>
            );
          })}
        </ol>
      </nav>

      <svg
        className="mm-threads"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {FALLING.map((d) => (
          <path key={d} d={d} className="mm-fall" />
        ))}
        <path d={RISING} className="mm-rise" />
      </svg>

      <div className="mm-foot">
        <div className="mm-lang">
          <span className="mm-kicker">{t.language}</span>
          <div className="mm-lang-toggle">
            {LANGUAGES.map((lang) => {
              const active = lang.code === locale;
              return (
                <TransitionLink
                  key={lang.code}
                  href={buildLangSwitchHref(pathname, lang.code)}
                  className="mm-lang-option"
                  aria-current={active ? "true" : undefined}
                  aria-label={t.languages[lang.code]}
                  lang={lang.code}
                  onClick={onClose}
                >
                  {lang.label}
                </TransitionLink>
              );
            })}
          </div>
        </div>
        <ScrollToButton
          className="mm-cta"
          targetId="get-involved"
          navigateTo={homeHref}
          onClick={onClose}
        >
          {t.cta}
          <span aria-hidden="true">→</span>
        </ScrollToButton>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}
