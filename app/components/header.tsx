import Image from "next/image";
import Link from "next/link";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

interface HeaderProps {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
  scrolled: boolean;
}

export default function Header({ language, setLanguage, scrolled }: HeaderProps) {
  const isEnglish = language === "en";

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
          <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <div
              style={{
                transform: scrolled ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Image
                src="/jacarandashield.png"
                alt="BAISH Logo"
                width={40}
                height={40}
                className="object-contain flex-shrink-0"
                priority
              />
            </div>
            <div className="overflow-hidden min-w-0 flex items-center">
              <p
                className="font-semibold whitespace-nowrap"
                style={{
                  fontSize: scrolled ? '1rem' : '1.125rem',
                  transition: 'font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                BAISH
              </p>
              <span
                className="font-semibold whitespace-nowrap"
                style={{
                  fontSize: scrolled ? '1rem' : '1.125rem',
                  marginLeft: '0.25rem',
                  opacity: scrolled ? 0 : 1,
                  maxWidth: scrolled ? '0px' : '500px',
                  overflow: 'hidden',
                  transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                - Buenos Aires AI Safety Hub
              </span>
            </div>
          </Link>
          <nav
            className="hidden md:flex items-center text-sm font-medium text-slate-600"
            style={{
              gap: scrolled ? '0.75rem' : '1.5rem',
              transition: 'gap 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Link className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full" href="/about">
              {isEnglish ? "About" : "Sobre nosotros"}
            </Link>
            <Link className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full" href="/activities">
              {isEnglish ? "Activities" : "Actividades"}
            </Link>
            <Link className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full" href="/research">
              {isEnglish ? "Research" : "Investigación"}
            </Link>
            <Link className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full" href="/resources">
              {isEnglish ? "Resources" : "Recursos"}
            </Link>
            <Link className="relative hover:text-slate-900 transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--color-accent-primary)] after:transition-all after:duration-300 hover:after:w-full" href="/contact">
              {isEnglish ? "Contact" : "Contacto"}
            </Link>
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`rounded-full border border-slate-200 bg-white/70 p-1 transition-all duration-500 ${
              scrolled ? "hidden sm:flex" : "flex"
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
              className="rounded-full bg-[var(--color-accent-primary)] font-semibold text-white shadow-md hover:bg-[var(--color-accent-primary-hover)] whitespace-nowrap"
              style={{
                padding: scrolled ? '0.5rem 0.75rem' : '0.5rem 1rem',
                fontSize: scrolled ? '0.75rem' : '0.875rem',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              href="#get-involved"
            >
              {isEnglish ? "Join Us" : "Únete"}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
