"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";
import { useLanguage } from "../contexts/language-context";

export default function PrivacyPolicy() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

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

  const isEnglish = language === "en";

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-slate-900">
        <Header language={language} setLanguage={setLanguage} scrolled={scrolled} />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
          {/* Page Header */}
          <section className="space-y-4">
            <div className="text-sm text-slate-600">
              <Link href="/" className="hover:text-[var(--color-accent-primary)] transition">
                Home
              </Link>
              {" / "}
              <span>{isEnglish ? "Privacy Policy" : "Política de Privacidad"}</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {isEnglish ? "Privacy Policy" : "Política de Privacidad"}
            </h1>
          </section>

          {/* Privacy Content */}
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-12">
            <div className="mx-auto max-w-3xl space-y-8">
              {/* Our Approach to Privacy */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Our Approach to Privacy" : "Nuestro Enfoque de Privacidad"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish
                    ? "At BAISH (Buenos Aires AI Safety Hub), we are committed to respecting your privacy. This Privacy Policy outlines our practices regarding the collection, use, and protection of your information when you use our website and services."
                    : "En BAISH (Buenos Aires AI Safety Hub), estamos comprometidos a respetar tu privacidad. Esta Política de Privacidad describe nuestras prácticas con respecto a la recopilación, uso y protección de tu información cuando utilizas nuestro sitio web y servicios."}
                </p>
              </div>

              {/* Data Collection */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Data Collection" : "Recopilación de Datos"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish
                    ? "We collect minimal personal information. The only personal data we collect is email addresses when users voluntarily sign up for our newsletter through Substack. This information is stored and managed by Substack according to their privacy policy."
                    : "Recopilamos información personal mínima. Los únicos datos personales que recopilamos son las direcciones de correo electrónico cuando los usuarios se registran voluntariamente para recibir nuestro boletín a través de Substack. Esta información es almacenada y gestionada por Substack de acuerdo con su política de privacidad."}
                </p>
              </div>

              {/* No Tracking or Cookies */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "No Tracking or Cookies" : "Sin Seguimiento ni Cookies"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish
                    ? "We do not use cookies, analytics, tracking tools, or any other technology to collect data about you. We do not monitor your browsing activities or gather information about your online behaviors."
                    : "No utilizamos cookies, análisis, herramientas de seguimiento ni ninguna otra tecnología para recopilar datos sobre ti. No monitoreamos tus actividades de navegación ni recopilamos información sobre tus comportamientos en línea."}
                </p>
              </div>

              {/* Third-Party Services */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Third-Party Services" : "Servicios de Terceros"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish ? (
                    <>
                      Our newsletter is managed through Substack. When you subscribe to
                      our newsletter, your email address is shared with and stored by
                      Substack. Please refer to{" "}
                      <a
                        href="https://substack.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                      >
                        Substack's Privacy Policy
                      </a>{" "}
                      to understand how they handle your information.
                    </>
                  ) : (
                    <>
                      Nuestro boletín se gestiona a través de Substack. Cuando te suscribes a nuestro boletín, tu dirección de correo electrónico se comparte y almacena con Substack. Consulta la{" "}
                      <a
                        href="https://substack.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                      >
                        Política de Privacidad de Substack
                      </a>{" "}
                      para comprender cómo manejan tu información.
                    </>
                  )}
                </p>
              </div>

              {/* Your Rights */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Your Rights" : "Tus Derechos"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish
                    ? "You have the right to unsubscribe from our newsletter at any time by clicking the unsubscribe link in any of our emails or by contacting us directly. If you have any questions about your data or wish to access, correct, or delete your information, please contact us."
                    : "Tienes derecho a cancelar la suscripción a nuestro boletín en cualquier momento haciendo clic en el enlace para cancelar la suscripción en cualquiera de nuestros correos electrónicos o contactándonos directamente. Si tienes alguna pregunta sobre tus datos o deseas acceder, corregir o eliminar tu información, contáctanos."}
                </p>
              </div>

              {/* Changes to This Policy */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Changes to This Policy" : "Cambios a Esta Política"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish
                    ? "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page."
                    : "Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página."}
                </p>
              </div>

              {/* Contact Us */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isEnglish ? "Contact Us" : "Contáctanos"}
                </h2>
                <p className="text-base text-slate-700 leading-relaxed">
                  {isEnglish ? (
                    <>
                      If you have any questions about this Privacy Policy, please contact
                      us through our{" "}
                      <Link
                        href="/contact"
                        className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                      >
                        Contact page
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos a través de nuestra{" "}
                      <Link
                        href="/contact"
                        className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-tertiary)] transition underline"
                      >
                        página de Contacto
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer language={language} />
      </div>
  );
}
