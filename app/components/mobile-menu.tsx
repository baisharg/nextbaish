"use client";

import Image from "next/image";
import { TransitionLink } from "./transition-link";
import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { AppLocale } from "@/i18n.config";
import type { Dictionary } from "@/app/[locale]/dictionaries";
import { buildLangSwitchHref, withLocale } from "@/app/utils/locale";

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
}

export default function MobileMenu({ locale, t, pathname, isOpen, onClose }: MobileMenuProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Trigger animation after mount for smooth slide-in
  useEffect(() => {
    if (isOpen) {
      // Request animation frame to ensure the initial state is rendered before animating
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const navLinks = [
    { href: withLocale(locale, "/about"), label: t.nav.about },
    { href: withLocale(locale, "/activities"), label: t.nav.activities },
    // { href: withLocale(locale, "/research"), label: t.nav.research }, // Hidden temporarily
    { href: withLocale(locale, "/resources"), label: t.nav.resources },
    { href: withLocale(locale, "/contact"), label: t.nav.contact },
  ];

  if (!mounted) return null;

  const menuContent = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      {/* Menu Panel */}
      <div
        className="fixed top-0 right-0 w-full h-screen z-40 md:hidden rounded-l-3xl border-l border-t border-b border-slate-200 bg-gradient-to-br from-[#EDE7FC] via-[#f5f5f5] to-[#A8C5FFE6] shadow-xl overflow-y-auto"
        style={{
          transform: shouldAnimate ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
            <span className="text-lg font-semibold text-slate-900">
              {t.menu}
            </span>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2"
              onClick={onClose}
              aria-label={t.closeMenu}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <nav className="px-4 py-6 sm:px-6">
            <TransitionLink
              href={withLocale(locale, "/")}
              className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-lg transition-colors ${
                pathname === withLocale(locale, "/")
                  ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                  : "hover:bg-white/60"
              }`}
              onClick={onClose}
            >
              <Image
                src="/images/logos/logo-40.webp"
                alt="BAISH Logo"
                width={40}
                height={40}
                sizes="32px"
                className="object-contain flex-shrink-0"
              />
              <span className={`text-lg font-semibold ${
                pathname === withLocale(locale, "/")
                  ? "text-[var(--color-accent-primary)]"
                  : "text-slate-900"
              }`}>BAISH</span>
            </TransitionLink>

            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const pathSegment = link.href.split('/').filter(Boolean).pop() || '';
                const transitionClass = `header-nav-${pathSegment}`;
                return (
                  <li key={link.href}>
                    <TransitionLink
                      href={link.href}
                      className={`block px-4 py-4 text-lg font-medium rounded-lg transition-colors ${transitionClass} ${
                        isActive
                          ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-semibold"
                          : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                      }`}
                      onClick={onClose}
                    >
                      {link.label}
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="px-4 mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t.language}
              </p>
              <div className="flex gap-3">
                {LANGUAGES.map((lang) => {
                  const active = lang.code === locale;
                  return (
                    <TransitionLink
                      key={lang.code}
                      href={buildLangSwitchHref(pathname, lang.code)}
                      className={`flex-1 text-center rounded-lg px-4 py-3 text-base font-medium transition ${
                        active
                          ? "bg-[var(--color-accent-primary)] text-white shadow-sm pointer-events-none"
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

          <div className="p-4 sm:p-6 border-t border-slate-200">
            <a
              className="flex items-center justify-center w-full rounded-full bg-[var(--color-accent-primary)] px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] transition"
              href="#get-involved"
              onClick={onClose}
            >
              {t.cta}
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
    </>
  );

  return createPortal(menuContent, document.body);
}
