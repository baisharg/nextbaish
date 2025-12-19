import type { Metadata } from "next";
import { i18n, type AppLocale } from "@/i18n.config";

const BASE_URL = "https://baish.com.ar";
const SITE_NAME = "BAISH";
const DEFAULT_OG_IMAGE = "/images/og-default.png"; // TODO: Create this image

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
        "Supporting your path into AI safety research. Join our community of 200+ members learning about AI alignment, interpretability, and governance.",
    },
    es: {
      title: "BAISH — Buenos Aires AI Safety Hub",
      description:
        "Apoyando tu camino hacia la investigación en seguridad de IA. Únete a nuestra comunidad de más de 200 miembros aprendiendo sobre alineamiento, interpretabilidad y gobernanza de IA.",
    },
  },
  about: {
    en: {
      title: "About Us",
      description:
        "Meet the BAISH team. We help students in Buenos Aires enter AI safety research through courses, workshops, and community support.",
    },
    es: {
      title: "Sobre Nosotros",
      description:
        "Conoce al equipo de BAISH. Ayudamos a estudiantes en Buenos Aires a ingresar a la investigación en seguridad de IA a través de cursos, talleres y apoyo comunitario.",
    },
  },
  activities: {
    en: {
      title: "Programs",
      description:
        "Join our AI Safety Fundamentals course, technical research workshop, or paper reading club. In-person programs in Buenos Aires.",
    },
    es: {
      title: "Programas",
      description:
        "Únete a nuestro curso de Fundamentos de Seguridad en IA, taller técnico de investigación o club de lectura de papers. Programas presenciales en Buenos Aires.",
    },
  },
  "activities/fundamentals": {
    en: {
      title: "AI Safety Fundamentals Course",
      description:
        "13-week inverted classroom course covering AI alignment concepts. Weekly in-person sessions in Buenos Aires with mentorship and final project.",
    },
    es: {
      title: "Curso de Fundamentos de Seguridad en IA",
      description:
        "Curso de 13 semanas en formato de clase invertida sobre conceptos de alineamiento de IA. Sesiones presenciales semanales en Buenos Aires con mentoría y proyecto final.",
    },
  },
  "activities/workshop": {
    en: {
      title: "AIS Research Workshop",
      description:
        "Weekly technical workshop to replicate AI safety papers through programming. Develop hands-on research skills in Buenos Aires.",
    },
    es: {
      title: "Taller de Investigación en Seguridad de IA",
      description:
        "Taller técnico semanal para replicar papers de seguridad en IA mediante programación. Desarrolla habilidades prácticas de investigación en Buenos Aires.",
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
        "BAISH community research publications in AI safety. Work on mechanistic interpretability, LLM evaluations, and alignment theory.",
    },
    es: {
      title: "Investigación",
      description:
        "Publicaciones de investigación de la comunidad BAISH en seguridad de IA. Trabajo en interpretabilidad mecanística, evaluaciones de LLMs y teoría de alineamiento.",
    },
  },
  resources: {
    en: {
      title: "Learning Resources",
      description:
        "Curated AI safety learning materials. Courses, papers, videos, and guides organized by difficulty level and topic.",
    },
    es: {
      title: "Recursos de Aprendizaje",
      description:
        "Materiales de aprendizaje curados sobre seguridad de IA. Cursos, papers, videos y guías organizados por nivel de dificultad y tema.",
    },
  },
  contact: {
    en: {
      title: "Contact",
      description:
        "Get in touch with BAISH. Join our Telegram and WhatsApp communities, or reach out directly via email.",
    },
    es: {
      title: "Contacto",
      description:
        "Contacta con BAISH. Únete a nuestras comunidades de Telegram y WhatsApp, o escríbenos directamente por email.",
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
