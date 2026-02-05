"use client";
"use no memo";

import Image from "next/image";
import { TransitionLink } from "./transition-link";
import { ScrollToButton } from "./scroll-to-button";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { buildLangSwitchHref, withLocale } from "@/app/utils/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

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
  const router = useRouter();
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

  // Focus trap, escape handling, and focus return
  useEffect(() => {
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
  }, [isOpen, onClose, triggerRef]);

  // Touch-based prefetching for language toggle on mobile
  const handleLanguageTouch = (href: string) => {
    router.prefetch(href);
  };

  // Trigger animation after mount for smooth slide-in
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

  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    { href: withLocale(locale, "/research"), label: t.nav.research },
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  if (!mounted) return null;

  const menuContent = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        />
      )}

      {/* Menu Panel */}
      <div
        ref={dialogRef}
        className="fixed top-0 right-0 z-40 h-[100dvh] w-full overflow-y-auto rounded-l-3xl border-t border-r-0 border-b border-l border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FFE6] shadow-xl md:hidden"
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-labelledby="mobile-menu-title"
        aria-hidden={!isOpen}
        tabIndex={-1}
        style={{
          transform: shouldAnimate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6">
            <span id="mobile-menu-title" className="text-lg font-semibold text-slate-900">
              {t.menu}
            </span>
            <button
              ref={closeButtonRef}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={onClose}
              aria-label={t.closeMenu}
              type="button"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>

          <nav className="px-4 py-6 sm:px-6">
            <TransitionLink
              href={withLocale(locale, "/")}
              className={`mb-6 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                pathname === withLocale(locale, "/")
                  ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                  : "hover:bg-white/60"
              }`}
              onClick={onClose}
            >
              <Image
                src="/images/logo.svg"
                alt="BAISH Logo"
                width={32}
                height={32}
                className="object-contain flex-shrink-0"
              />
              <span
                className={`text-lg font-semibold ${
                  pathname === withLocale(locale, "/")
                    ? "text-[var(--color-accent-primary)]"
                    : "text-slate-900"
                }`}
              >
                BAISH
              </span>
            </TransitionLink>

            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const pathSegment =
                  link.href.split("/").filter(Boolean).pop() || "";
                const transitionClass = `header-nav-${pathSegment}`;
                return (
                  <li key={link.href}>
                    <TransitionLink
                      href={link.href}
                      className={`block rounded-lg px-4 py-4 text-lg font-medium transition-colors ${transitionClass} ${
                        isActive
                          ? "bg-[var(--color-accent-primary)]/10 font-semibold text-[var(--color-accent-primary)]"
                          : "text-slate-700 hover:bg-white/60 hover:text-slate-900"
                      }`}
                      onClick={onClose}
                    >
                      {link.label}
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <p className="mb-4 px-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t.language}
              </p>
              <div className="flex gap-3">
                {LANGUAGES.map((lang) => {
                  const active = lang.code === locale;
                  const langHref = buildLangSwitchHref(pathname, lang.code);
                  return (
                    <TransitionLink
                      key={lang.code}
                      href={langHref}
                      prefetch={false}
                      onTouchStart={() =>
                        !active && handleLanguageTouch(langHref)
                      }
                      className={`flex-1 rounded-lg px-4 py-3 text-center text-base font-medium transition ${
                        active
                          ? "pointer-events-none bg-[var(--color-accent-primary)] text-white shadow-sm"
                          : "bg-white/60 text-slate-700 hover:bg-white"
                      }`}
                      onClick={onClose}
                    >
                      {t.languages[lang.code]}
                    </TransitionLink>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="border-t border-slate-200 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <ScrollToButton
              className="flex w-full items-center justify-center rounded-full bg-[var(--color-accent-primary)] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)]"
              targetId="get-involved"
              navigateTo={withLocale(locale, "/")}
              onClick={onClose}
            >
              {t.cta}
            </ScrollToButton>
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
    </>
  );

  return createPortal(menuContent, document.body);
}
