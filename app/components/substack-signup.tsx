"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { Dictionary } from "@/app/[locale]/dictionaries";

type Props = {
  t: Dictionary["substack"];
};

type SubmitState = "idle" | "loading" | "success" | "error";

export default function SubstackSignup({ t }: Props) {
  const copy = t;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load form with IntersectionObserver
  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

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
    <div ref={containerRef} className="min-h-[280px]">
      {isVisible ? (
        <article className="card-glass">
          <div className="card-eyebrow">{copy.eyebrow}</div>
          <h3 className="card-title">{copy.title}</h3>
          <p className="card-body">{copy.description}</p>

          <form onSubmit={handleSubmit} className="space-y-3 mt-auto" noValidate>
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
                className="input-field flex-1"
              />
              <button
                type="submit"
                className="button-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
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
      ) : (
        <div className="card-glass h-[280px] flex items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 mx-auto border-4 border-slate-200 border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading newsletter signup...</p>
          </div>
        </div>
      )}
    </div>
  );
}
