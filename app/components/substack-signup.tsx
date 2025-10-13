"use client";

import { useState, type FormEvent } from "react";

type LanguageCode = "en" | "es";

type Props = {
  language: LanguageCode;
};

type SubmitState = "idle" | "loading" | "success" | "error";

const COPY: Record<
  LanguageCode,
  {
    title: string;
    description: string;
    placeholder: string;
    button: string;
    disclaimer: string;
    success: string;
    confirm: string;
    genericError: string;
    networkError: string;
  }
> = {
  en: {
    title: "Join our Mailing List",
    description: "Stay updated with our activities, events, and opportunities.",
    placeholder: "you@example.com",
    button: "Subscribe",
    disclaimer: "We'll only email when something important is happening.",
    success: "You're subscribed! Check your inbox for the welcome email.",
    confirm: "Almost done — please confirm the subscription from your inbox.",
    genericError: "Something went wrong. Please try again.",
    networkError: "Connection failed. Please check your internet and retry.",
  },
  es: {
    title: "Únete a nuestra lista de correo",
    description:
      "Mantente al tanto de nuestras actividades, eventos y oportunidades.",
    placeholder: "tu@email.com",
    button: "Suscribirse",
    disclaimer: "Solo enviaremos correos cuando haya novedades importantes.",
    success: "¡Te suscribiste! Revisa tu correo para el mensaje de bienvenida.",
    confirm:
      "Queda un paso — confirma la suscripción desde tu bandeja de entrada.",
    genericError: "Ocurrió un error. Intenta nuevamente.",
    networkError: "Fallo de conexión. Verifica tu internet e inténtalo otra vez.",
  },
};

export default function SubstackSignup({ language }: Props) {
  const copy = COPY[language];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage(copy.genericError);
      return;
    }

    setStatus("loading");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("https://substackapi.com/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          domain: "baish.substack.com",
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data?.errors?.length) {
        setStatus("error");
        setMessage(data.errors[0]?.msg ?? copy.genericError);
        return;
      }

      setEmail("");

      if (data?.requires_confirmation) {
        setStatus("success");
        setMessage(copy.confirm);
        return;
      }

      setStatus("success");
      setMessage(copy.success);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setStatus("error");
        setMessage(copy.networkError);
        return;
      }
      setStatus("error");
      setMessage(copy.genericError);
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">{copy.title}</h3>
        <p className="text-sm text-slate-600">{copy.description}</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="substack-email">
            {copy.placeholder}
          </label>
          <input
            id="substack-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/40"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent-primary)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={status === "loading"}
          >
            {status === "loading" ? `${copy.button}…` : copy.button}
          </button>
        </div>
        <p className="text-xs text-slate-500">{copy.disclaimer}</p>
        {message && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </article>
  );
}
