"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { useLocale, useDict } from "@/app/contexts/language-context";
import { FadeInSection } from "@/app/components/fade-in-section";

export default function ContactPage() {
  const locale = useLocale();
  const isEnglish = locale === "en";
  const dict = useDict();
  const [scrolled, setScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const withLocale = useMemo(() => {
    return (path: string) => {
      if (!path.startsWith("/")) return path;
      if (path === "/") {
        return `/${locale}`;
      }
      return `/${locale}${path}`;
    };
  }, [locale]);

  // Scroll effect for header
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


  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Process FAQ items from dictionary with template replacements
  const faqItems = useMemo(() => {
    if (!dict.contact.faq.items) return [];

    return dict.contact.faq.items.map((item: { question: string; answer: string }) => {
      let answer: string | React.ReactNode = item.answer;

      // Replace {resourcesLink} with actual Link component
      if (typeof answer === 'string' && answer.includes('{resourcesLink}')) {
        const parts = answer.split('{resourcesLink}');
        answer = (
          <>
            {parts[0]}
            <Link
              href={withLocale("/resources")}
              className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
            >
              {isEnglish ? "Resources page" : "página de Recursos"}
            </Link>
            {parts[1]}
          </>
        );
      }

      // Replace {email} with actual email link
      if (typeof answer === 'string' && answer.includes('{email}')) {
        const parts = answer.split('{email}');
        answer = (
          <>
            {parts[0]}
            <a
              href="mailto:baish@dc.uba.ar"
              className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
            >
              baish@dc.uba.ar
            </a>
            {parts[1]}
          </>
        );
      }

      return {
        question: item.question,
        answer,
      };
    });
  }, [dict.contact.faq.items, withLocale, isEnglish]);

  return (
    <>
      <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <Header locale={locale} t={dict.header} />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <FadeInSection variant="fade" as="section">
            <section className="space-y-4">
              <div className="text-sm text-slate-600">
                <Link href={withLocale("/")} className="hover:text-[var(--color-accent-primary)] transition">
                  {isEnglish ? "Home" : "Inicio"}
                </Link>
                {" / "}
                <span>{isEnglish ? "Contact" : "Contacto"}</span>
              </div>
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                {isEnglish ? "Contact Us" : "Contactanos"}
              </h1>
              <p className="text-lg text-slate-700">
                {isEnglish
                  ? "Get in touch with our team and join our community"
                  : "Comunicate con la comunidad de BAISH"}
              </p>
            </section>
          </FadeInSection>

          {/* Contact Info Cards */}
          <FadeInSection variant="slide-up" delay={100} as="section">
            <section className="grid gap-6 md:grid-cols-3">
              {/* Telegram Card */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-3xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--color-accent-primary)]"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Telegram</h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish
                      ? "Join our community channel for discussions and updates:"
                      : "Sumate a nuestro canal de comunidad para discusiones y actualizaciones:"}
                  </p>
                </div>
                <a
                  href="https://t.me/+zhSGhXrn56g1YjVh"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  t.me/+zfvMHU8TaAhjNjVh →
                </a>
              </article>

              {/* Location Card */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-3xl">📍</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Location" : "Ubicación"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish
                      ? "We're based at the Department of Computer Science:"
                      : "Estamos ubicados en el Departamento de Ciencias de la Computación:"}
                  </p>
                </div>
                <address className="mt-6 text-sm text-slate-700 not-italic">
                  Pabellon 0+inf, Ciudad Universitaria
                  <br />
                  C1428EGA Buenos Aires
                  <br />
                  Argentina
                </address>
              </article>

              {/* Social Media Card */}
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-3xl">📱</div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {isEnglish ? "Social Media" : "Redes Sociales"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEnglish
                      ? "Follow us for updates and announcements:"
                      : "Seguinos para actualizaciones y anuncios:"}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="https://www.instagram.com/baish_arg"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/company/baish-arg"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://t.me/+zhSGhXrn56g1YjVh"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Telegram
                  </a>
                  <a
                    href="https://chat.whatsapp.com/BlgwCkQ8jmpB2ofIxiAi9P"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </article>
            </section>
          </FadeInSection>

          {/* Contact Form & Newsletter - Dark Theme */}
          <FadeInSection variant="slide-up" delay={200} as="section">
            <section className="grid gap-8 rounded-3xl bg-[#1e1e30] px-6 py-12 sm:px-12 md:grid-cols-[1.5fr_1fr]">
              {/* Left: Contact Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-white">
                    {isEnglish ? "Contact Us" : "Contactanos"}
                  </h2>
                  <p className="text-base text-slate-300">
                    {isEnglish
                      ? "Get in touch with our team and join our community"
                      : "Comunicate con la comunidad de BAISH"}
                  </p>
                </div>

                <div className="h-px bg-[#232336]" />

                <form action="https://formspree.io/f/xjkyoknb" method="POST" className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                      {isEnglish ? "What is your name?" : "¿Cuál es tu nombre?"}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      {isEnglish ? "What is your email?" : "¿Cuál es tu correo electrónico?"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-white">
                      {isEnglish ? "Message" : "Mensaje"}
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={5}
                      required
                      className="w-full rounded-md border border-[#2a2a40] bg-[#161624] px-4 py-3 text-white placeholder-slate-500 transition focus:border-[var(--color-accent-primary)] focus:bg-[#2a2a45] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-20"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="reset"
                      className="inline-flex items-center gap-2 text-sm text-[#4a93fb] transition hover:text-[var(--color-accent-tertiary)]"
                    >
                      <span className="text-lg">↺</span>
                      {isEnglish ? "Clear form" : "Limpiar formulario"}
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-[var(--color-accent-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-tertiary)]"
                    >
                      {isEnglish ? "Submit" : "Enviar"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Get Involved / Newsletter */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-white">
                    {isEnglish ? "Get Involved" : "Sumate"}
                  </h2>
                  <p className="text-base text-slate-300">
                    {isEnglish
                      ? "There are multiple ways to participate in our community and activities."
                      : "Hay múltiples formas de participar en nuestra comunidad y actividades."}
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-[#2a2a40] bg-[#232336] p-5">
                  <h3 className="text-xl font-semibold text-white">
                    {isEnglish ? "Join our Mailing List" : "Suscribite a Nuestra Lista de Correo"}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {isEnglish
                      ? "Stay updated with our events, activities, and opportunities by subscribing to our mailing list. We send monthly newsletters and important announcements."
                      : "Mantenete al día con nuestros eventos, actividades y oportunidades suscribiéndote a nuestra lista de correo. Te enviamos newsletters mensuales y anuncios importantes."}
                  </p>
                  <div id="custom-substack-embed"></div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* FAQ Section */}
          <FadeInSection variant="slide-up" delay={300} as="section">
            <section className="space-y-8 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
              <h2 className="text-3xl font-semibold text-slate-900">
                {dict.contact.faq.title}
              </h2>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white transition hover:border-[var(--color-accent-primary)]"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left"
                      aria-expanded={openFaqIndex === index}
                    >
                      <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`flex-shrink-0 text-[var(--color-accent-primary)] transition-transform ${
                          openFaqIndex === index ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {openFaqIndex === index && (
                      <div className="border-t border-slate-200 px-6 py-4">
                        <p className="text-base text-slate-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </FadeInSection>
        </main>

        <Footer locale={locale} t={dict.footer} />
      </div>

      {/* Substack Widget Script */}
      <Script id="substack-widget-config" strategy="afterInteractive">
        {`
          window.CustomSubstackWidget = {
            substackUrl: "baish.substack.com",
            placeholder: "example@gmail.com",
            buttonText: "Subscribe",
            theme: "custom",
            colors: {
              primary: "#5A9FFF",
              input: "#121620",
              email: "#606878",
              text: "#000000",
            },
          };
        `}
      </Script>
      <Script src="https://substackapi.com/widget.js" strategy="afterInteractive" />
    </>
  );
}
