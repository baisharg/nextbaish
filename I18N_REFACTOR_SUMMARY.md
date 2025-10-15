# Next.js i18n Refactor Summary

## Overview
Complete refactor of the Next.js application to follow Next.js 15 best practices for internationalization, moving from client-side pattern to server-side dictionary-based approach.

## What Was Changed

### Core Infrastructure

1. **Dictionary System**
   - Created `app/[locale]/dictionaries/en.json` - English translations
   - Created `app/[locale]/dictionaries/es.json` - Spanish translations
   - Created `app/[locale]/dictionaries.ts` - Type-safe dictionary loader with server-only imports
   - Dictionary type: `Dictionary` exported for type safety

2. **Simplified Language Context**
   - File: `app/contexts/language-context.tsx`
   - **Before**: Complex client-side routing, localStorage, state management
   - **After**: Simple read-only context, only provides current locale
   - Hook renamed: `useLanguage()` → `useLocale()`
   - Removed: Navigation functions, state setters, localStorage

3. **Component Updates**
   - **Header** (`app/components/header.tsx`):
     - Changed from callback to Link-based language switching
     - Added `buildLangSwitchHref()` function for URL transformation
     - Now receives `locale` and `t: Dictionary["header"]` props

   - **Footer** (`app/components/footer.tsx`):
     - Receives `locale` and `t: Dictionary["footer"]` props
     - All text from dictionary instead of inline ternaries

   - **SubstackSignup** (`app/components/substack-signup.tsx`):
     - Receives `t: Dictionary["substack"]` prop
     - Removed 50-line inline COPY object

   - **PageWrapper** (NEW: `app/components/page-wrapper.tsx`):
     - Client component wrapper for scroll state
     - Wraps Header + content + Footer
     - Allows pages to be server components

   - **CalendarSection** (NEW: `app/components/calendar-section.tsx`):
     - Client component for lazy-loaded calendar
     - Uses IntersectionObserver
     - Accepts translations as props

4. **Layout Changes**
   - **Deleted**: `app/layout.tsx` (root layout)
   - **Updated**: `app/[locale]/layout.tsx` now serves as root
   - Added dynamic `generateMetadata()` for locale-aware OG tags
   - Added `<html lang={currentLocale}>`

### Pages Converted

#### ✅ Completed (4/7 pages)

1. **Home Page** (`app/[locale]/page.tsx`)
   - Async server component
   - Uses `getDictionary(locale)`
   - Footnote system with placeholders
   - All translations from dictionary

2. **Privacy Policy** (`app/[locale]/privacy-policy/page.tsx`)
   - Async server component
   - Pure static content
   - All sections from dictionary

3. **About** (`app/[locale]/about/page.tsx`)
   - Async server component
   - Team section with images
   - External resources cards
   - All from dictionary

4. **Activities** (`app/[locale]/activities/page.tsx`)
   - Async server component
   - Uses CalendarSection component
   - Course details (inline content kept as-is)
   - Nav/breadcrumbs from dictionary

#### 🔄 Remaining (3/7 pages)

These pages still use the old pattern and need conversion:

1. **Contact** (`app/[locale]/contact/page.tsx`)
   - Has FAQ accordion (needs state)
   - Form elements
   - Substack script tags

2. **Research** (`app/[locale]/research/page.tsx`)
   - Has filter state for project categories
   - Project list

3. **Resources** (`app/[locale]/resources/page.tsx`)
   - Complex state: pathway selection, filters, localStorage, progress tracking
   - Most complex page

## Conversion Pattern

### Standard Pattern for Server Component Pages

```typescript
// Remove: "use client"

import Link from "next/link";
import PageWrapper from "@/app/components/page-wrapper";
import { getDictionary } from "../dictionaries";
import type { AppLocale } from "@/i18n.config";
import { isAppLocale } from "@/i18n.config";

export default async function PageName({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "en";
  const dict = await getDictionary(currentLocale);
  const t = dict.pageName; // e.g., dict.contact
  const isEnglish = currentLocale === "en";

  return (
    <PageWrapper
      locale={currentLocale}
      headerTranslations={dict.header}
      footerTranslations={dict.footer}
    >
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:px-10">
        {/* Page Header with breadcrumbs */}
        <section className="space-y-4">
          <div className="text-sm text-slate-600">
            <Link href={`/${currentLocale}`} className="hover:text-[var(--color-accent-primary)] transition">
              {t.breadcrumb.home}
            </Link>
            {" / "}
            <span>{t.breadcrumb.current}</span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            {t.title}
          </h1>
        </section>

        {/* Page content - keep inline ternaries for now */}
        {isEnglish ? "English content" : "Spanish content"}
      </main>
    </PageWrapper>
  );
}
```

### What to Remove

- ❌ `"use client"` directive
- ❌ `useState`, `useEffect`, `useRef` (unless needed for interactivity)
- ❌ `useLanguage()` hook
- ❌ `withLocale` function
- ❌ `setLanguage` callback
- ❌ Scroll state management (now in PageWrapper)
- ❌ Direct `<Header>` and `<Footer>` usage

### What to Add

- ✅ `async` keyword on function
- ✅ `params: Promise<{ locale: string }>` parameter type
- ✅ `await params` and locale extraction
- ✅ `getDictionary(locale)` call
- ✅ `<PageWrapper>` wrapper with props
- ✅ Dictionary-based breadcrumbs

## Dictionary Structure

```json
{
  "header": { "nav": {...}, "cta": "...", "languages": {...} },
  "footer": { "copyright": "...", "nav": {...} },
  "substack": { "title": "...", "button": "...", ... },
  "home": { "breadcrumb": {...}, "mission": {...}, "events": {...}, ... },
  "about": { "breadcrumb": {...}, "title": "...", ... },
  "activities": { "breadcrumb": {...}, "title": "...", ... },
  "contact": { "breadcrumb": {...}, "title": "...", ... },
  "research": { "breadcrumb": {...}, "title": "...", ... },
  "resources": { "breadcrumb": {...}, "title": "...", ... },
  "privacyPolicy": { "breadcrumb": {...}, "sections": {...} }
}
```

## Remaining Tasks

### Immediate (Required for Build)

1. **Convert Contact Page**
   - Extract FAQ accordion to client component if needed
   - Use dictionary for form labels and static content
   - Keep inline content as-is for now

2. **Convert Research Page**
   - Extract project filter to client component if needed
   - Use dictionary for filter labels
   - Keep project data as-is

3. **Convert Resources Page**
   - Most complex - may need multiple client components
   - Extract stateful logic (filters, progress tracking)
   - Use dictionary for UI labels

### Future Improvements (Optional)

1. **Complete Dictionary Migration**
   - Move all inline content to dictionaries
   - This is a large task - current approach keeps inline ternaries

2. **Client Components for Interactivity**
   - FAQ Accordion (`app/components/faq-accordion.tsx`)
   - Project Filter (`app/components/project-filter.tsx`)
   - Resources Browser (`app/components/resources-browser.tsx`)

3. **Type Safety**
   - Add stricter types for dictionary keys
   - Add runtime validation for dictionary completeness

## Build Status

**Current errors**: 6 errors (3 pages × 2 contexts each)
- contact/page.tsx: useLanguage doesn't exist
- research/page.tsx: useLanguage doesn't exist
- resources/page.tsx: useLanguage doesn't exist

**After conversion**: Should build successfully

## Testing Checklist

- [ ] Home page loads in both languages
- [ ] About page loads in both languages
- [ ] Activities page loads in both languages
- [ ] Privacy Policy page loads in both languages
- [ ] Contact page loads in both languages
- [ ] Research page loads in both languages
- [ ] Resources page loads in both languages
- [ ] Language switcher works on all pages
- [ ] Breadcrumbs work correctly
- [ ] Calendar lazy loads properly
- [ ] All links use correct locale prefix
- [ ] Build completes without errors
- [ ] No client-side hydration errors

## Key Files Reference

- **Dictionaries**: `app/[locale]/dictionaries/[en|es].json`
- **Dictionary loader**: `app/[locale]/dictionaries.ts`
- **Layout**: `app/[locale]/layout.tsx`
- **Middleware**: `middleware.ts`
- **Config**: `i18n.config.ts`
- **Context**: `app/contexts/language-context.tsx`

## Notes

- Dictionary entries use nested structure for organization
- Server components use `await params` pattern (Next.js 15)
- Language switching uses Link components (no client-side state)
- Inline content kept as ternaries to minimize refactor scope
- Footnotes use placeholder replacement pattern
