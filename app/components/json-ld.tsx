import type { AppLocale } from "@/i18n.config";
import { ORGANIZATION_LINKEDIN_URL } from "@/app/constants/social-links";

const BASE_URL = "https://baish.com.ar";

// Type definitions for JSON-LD schemas
interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  alternateName?: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    email?: string;
    url?: string;
  };
  address?: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressCountry: string;
  };
}

interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  inLanguage: string[];
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

interface EventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: string;
  eventAttendanceMode?: string;
  location?: {
    "@type": "Place";
    name: string;
    address: {
      "@type": "PostalAddress";
      addressLocality: string;
      addressCountry: string;
    };
  };
  organizer: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface CourseSchema {
  "@context": "https://schema.org";
  "@type": "Course";
  name: string;
  description: string;
  provider: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  hasCourseInstance?: {
    "@type": "CourseInstance";
    courseMode: string;
    courseWorkload: string;
    instructor?: {
      "@type": "Person";
      name: string;
    };
  };
}

// Helper to render JSON-LD script tag
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization schema - use on homepage and about page
 */
export function OrganizationJsonLd() {
  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BAISH - Buenos Aires AI Safety Hub",
    alternateName: "BAISH",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logos/logo-192.png`,
    description:
      "Supporting students in Buenos Aires to enter AI safety research through courses, research, and community.",
    sameAs: [
      "https://t.me/+zhSGhXrn56g1YjVh",
      ORGANIZATION_LINKEDIN_URL,
      "https://www.youtube.com/@BAISHaiSafety",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "General Inquiries",
      url: `${BASE_URL}/en/contact`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * WebSite schema - use in root layout
 */
export function WebSiteJsonLd() {
  const schema: WebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BAISH - Buenos Aires AI Safety Hub",
    url: BASE_URL,
    description:
      "Supporting your path into AI safety research. Community, courses, and research in Buenos Aires.",
    inLanguage: ["en", "es"],
    publisher: {
      "@type": "Organization",
      name: "BAISH",
      url: BASE_URL,
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * Breadcrumb schema - use on all pages with breadcrumbs
 */
export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: AppLocale;
}) {
  const schema: BreadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${BASE_URL}/${locale}${item.url}`,
    })),
  };

  return <JsonLdScript data={schema} />;
}

/**
 * Event schema - use on activities page for recurring events
 */
export function EventJsonLd({
  name,
  description,
  startDate,
  location = "Buenos Aires, Argentina",
}: {
  name: string;
  description: string;
  startDate?: string;
  location?: string;
}) {
  const schema: EventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Buenos Aires",
        addressCountry: "AR",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "BAISH",
      url: BASE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * FAQ schema - use on contact page
 */
export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema: FAQSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <JsonLdScript data={schema} />;
}

/**
 * Course schema - use on activity sub-pages
 */
export function CourseJsonLd({
  name,
  description,
  duration,
  instructor,
}: {
  name: string;
  description: string;
  duration?: string;
  instructor?: string;
}) {
  const schema: CourseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "BAISH - Buenos Aires AI Safety Hub",
      url: BASE_URL,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      courseWorkload: duration || "30 hours",
      ...(instructor && {
        instructor: {
          "@type": "Person",
          name: instructor,
        },
      }),
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * Multiple events schema for activities page
 */
export function ActivitiesEventsJsonLd({ locale }: { locale: AppLocale }) {
  const events = [
    {
      name: "Technical AI Safety Course",
      description:
        locale === "es"
          ? "Curso técnico de seguridad en IA facilitado por BAISH"
          : "Technical AI safety course facilitated by BAISH",
    },
    {
      name: "Technical AI Safety Project",
      description:
        locale === "es"
          ? "Curso basado en proyectos para contribuir a seguridad en IA"
          : "Project-based course for contributing to AI safety",
    },
    {
      name: "Frontier AI Governance",
      description:
        locale === "es"
          ? "Curso de gobernanza de sistemas de IA de frontera"
          : "Course on governance of frontier AI systems",
    },
  ];

  return (
    <>
      {events.map((event, index) => (
        <EventJsonLd
          key={index}
          name={event.name}
          description={event.description}
        />
      ))}
    </>
  );
}
