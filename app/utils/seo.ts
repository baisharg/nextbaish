import type { Metadata } from "next";
import { i18n, type AppLocale } from "@/i18n.config";

const BASE_URL = "https://baish.com.ar";
const SITE_NAME = "BAISH";
const DEFAULT_OG_IMAGE = "/images/og-default.png";

export interface PageSEOConfig {
  title: string;
  description: string;
  path: string; // e.g., "/about" or "" for homepage
  locale: AppLocale;
  ogImage?: string;
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
}

/**
 * Generates consistent metadata for a page with proper hreflang alternates
 */
export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  article,
}: PageSEOConfig): Metadata {
  const url = `${BASE_URL}/${locale}${path}`;
  const fullTitle = path === "" ? title : `${title} — ${SITE_NAME}`;

  // Build alternates for hreflang
  const languages: Record<string, string> = {};
  for (const loc of i18n.locales) {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  }

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: article ? "article" : "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(article && {
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: article.authors,
        tags: article.tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// SEO content for each page (used by generateMetadata functions)
export const SEO_CONTENT = {
  home: {
    en: {
      title: "BAISH — Buenos Aires AI Safety Hub",
      description:
        "The largest AI safety hub in Latin America. 300+ members, in-person courses, a research lab and career support in Buenos Aires.",
    },
    es: {
      title: "BAISH — Buenos Aires AI Safety Hub",
      description:
        "El hub de AI Safety más grande de Latinoamérica. Más de 300 miembros, cursos presenciales, un laboratorio de investigación y acompañamiento de carrera en Buenos Aires.",
    },
  },
  about: {
    en: {
      title: "About Us",
      description:
        "Who we are, what we have achieved and who runs BAISH: 6 full-time placements, 28 fellowship placements, and a team of 30+ volunteers, staff and advisors in Buenos Aires.",
    },
    es: {
      title: "Sobre Nosotros",
      description:
        "Quiénes somos, qué logramos y quién hace BAISH: 6 roles full-time, 28 placements en fellowships y un equipo de más de 30 voluntarios, staff y advisors en Buenos Aires.",
    },
  },
  activities: {
    en: {
      title: "Programs",
      description:
        "BAISH courses, community events and career support: Technical AI Safety, Projects Sprint, Frontier AI Governance, monthly socials, hackathons and more, in person in Buenos Aires.",
    },
    es: {
      title: "Programas",
      description:
        "Cursos, eventos de comunidad y acompañamiento de carrera de BAISH: Technical AI Safety, Projects Sprint, Frontier AI Governance, eventos mensuales, hackathons y más, presenciales en Buenos Aires.",
    },
  },
  "activities/fundamentals": {
    en: {
      title: "Technical AI Safety Course",
      description:
        "30-hour BlueDot Impact technical AI safety course hosted in person by BAISH in Buenos Aires.",
    },
    es: {
      title: "Technical AI Safety Course",
      description:
        "Curso técnico de seguridad en IA de 30 horas de BlueDot Impact, facilitado presencialmente por BAISH en Buenos Aires.",
    },
  },
  "activities/workshop": {
    en: {
      title: "Technical AI Safety Project",
      description:
        "Project-based technical AI safety course for making a concrete research or engineering contribution in Buenos Aires.",
    },
    es: {
      title: "Technical AI Safety Project",
      description:
        "Curso técnico basado en proyectos para hacer una contribución concreta de investigación o ingeniería en seguridad en IA en Buenos Aires.",
    },
  },
  "activities/reading": {
    en: {
      title: "Paper Presentations Club",
      description:
        "Bi-weekly paper presentations by community members. Full paper analysis with discussion and YouTube recordings.",
    },
    es: {
      title: "Club de Presentación de Papers",
      description:
        "Presentaciones de papers quincenales por miembros de la comunidad. Análisis completo con discusión y grabaciones en YouTube.",
    },
  },
  research: {
    en: {
      title: "Research",
      description:
        "BAISH Labs, our AI safety research arm in Buenos Aires, and 15+ publications by researchers connected to BAISH at NeurIPS, ICLR workshops and beyond.",
    },
    es: {
      title: "Investigación",
      description:
        "BAISH Labs, nuestro brazo de investigación en AI safety en Buenos Aires, y más de 15 publicaciones de investigadores conectados a BAISH en NeurIPS, workshops de ICLR y más.",
    },
  },
  resources: {
    en: {
      title: "Learning Resources",
      description:
        "The public evidence that AI capability is growing exponentially: METR's time-horizon data, revenue and investment figures. Plus what could go wrong and where to start learning.",
    },
    es: {
      title: "Recursos de Aprendizaje",
      description:
        "La evidencia pública de que la capacidad de la IA crece exponencialmente: los datos de METR, cifras de ingresos e inversión. Más qué podría salir mal y por dónde empezar a aprender.",
    },
  },
  contact: {
    en: {
      title: "Contact",
      description:
        "Get in touch with BAISH. Join our WhatsApp and Telegram communities, write to the team, or reach out for press and partnerships.",
    },
    es: {
      title: "Contacto",
      description:
        "Contactá a BAISH. Sumate a nuestras comunidades de WhatsApp y Telegram, escribile al equipo, o contactanos por prensa y alianzas.",
    },
  },
  privacyPolicy: {
    en: {
      title: "Privacy Policy",
      description:
        "BAISH privacy policy. How we handle your data and protect your privacy.",
    },
    es: {
      title: "Política de Privacidad",
      description:
        "Política de privacidad de BAISH. Cómo manejamos tus datos y protegemos tu privacidad.",
    },
  },
  agenticCodingWorkshop: {
    en: {
      title: "Agentic Coding Workshop",
      description:
        "Complete BMAD methodology guide. Build projects with AI using specialized agents for planning and development.",
    },
    es: {
      title: "Taller de Codificación Agéntica",
      description:
        "Guía completa de la metodología BMAD. Construye proyectos con IA usando agentes especializados para planificación y desarrollo.",
    },
  },
} as const;
