# BAISH — Buenos Aires AI Safety Hub

A bilingual AI Safety content hub built with Next.js 15, featuring curated resources, research projects, events, and educational content in English and Spanish.

[![Performance](https://img.shields.io/badge/Desktop%20Performance-84%2F100-success)](https://developers.google.com/speed/pagespeed/insights/)
[![Performance](https://img.shields.io/badge/Mobile%20Performance-94%2F100-success)](https://developers.google.com/speed/pagespeed/insights/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev)

## 🎯 Project Overview

**BAISH** (Buenos Aires AI Safety Hub) is a comprehensive platform dedicated to AI safety education and research, featuring:

- 🌍 **Fully bilingual** content (English/Spanish)
- 📚 **50+ curated AI safety resources** with progress tracking
- 🔬 **Research project showcase** with category filtering
- 📅 **Events calendar** with lu.ma integration
- 📧 **Newsletter subscription** via Substack
- 💬 **Contact page** with FAQ accordion
- 🎨 **Beautiful animated backgrounds** with 60fps performance

## 🚀 Tech Stack

- **Framework:** Next.js 16.0.0 with App Router & Turbopack
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4 (via PostCSS)
- **Language:** TypeScript (strict mode)
- **Fonts:** IBM Plex Serif, Geist Sans, Geist Mono
- **Animations:** View Transitions API with next-view-transitions
- **Analytics:** Vercel Analytics & Speed Insights
- **Virtualization:** @tanstack/react-virtual
- **Internationalization:** Dictionary-based i18n system

## 📊 Performance Achievements

- ✅ **Desktop Performance:** 84/100 (Lighthouse)
- ✅ **Mobile Performance:** 94/100 (Lighthouse)
- ✅ **Total Blocking Time:** 10ms (desktop) - 95% improvement
- ✅ **Cumulative Layout Shift:** 0.000 (perfect score)
- ✅ **First Contentful Paint:** 0.9s
- ✅ **Time to Interactive:** 3.4s (desktop), 3.1s (mobile)
- ✅ **React Compiler:** Enabled for automatic memoization
- ✅ **SWC Minification:** 17x faster than Terser

See [DESKTOP_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md](./DESKTOP_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md) and [ITEMS_2_AND_4_IMPLEMENTATION_SUMMARY.md](./ITEMS_2_AND_4_IMPLEMENTATION_SUMMARY.md) for detailed performance optimization documentation.

## 🏗️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nextbaish

# Install dependencies
pnpm install
```

### Development

```bash
# Start Turbopack dev server at http://localhost:3000
pnpm dev

# Restart dev server (kills existing, starts fresh)
pnpm restart:dev

# Build for production
pnpm build

# Start production server
pnpm start

# Restart production server (kills, rebuilds, starts)
pnpm restart:prod

# Run bundle analysis
pnpm analyze
```

The dev server supports hot reload and will be available at [http://localhost:3000](http://localhost:3000).

## 🌐 Routes

All routes are available in both English and Spanish:

- `/en` or `/es` - Homepage with mission statement
- `/en/about` or `/es/about` - About page
- `/en/activities` or `/es/activities` - Events & activities
- `/en/research` or `/es/research` - Research projects showcase
- `/en/resources` or `/es/resources` - Learning resources library (50+ resources)
- `/en/contact` or `/es/contact` - Contact information & FAQ
- `/en/privacy-policy` or `/es/privacy-policy` - Privacy policy

## 📁 Project Structure

```
app/
├── [locale]/              # Internationalized routes (en/es)
│   ├── page.tsx           # Homepage
│   ├── about/             # About page
│   ├── activities/        # Events & activities
│   ├── research/          # Research projects
│   ├── resources/         # Learning resources (virtualized list)
│   ├── contact/           # Contact + FAQ
│   ├── dictionaries/      # Translation files (en.json, es.json)
│   └── layout.tsx         # Locale-specific layout
├── components/            # Reusable React components
│   ├── timeline-threads.tsx           # Animated SVG background (60fps)
│   ├── animated-title.tsx             # View transitions title
│   ├── fade-in-section.tsx            # Scroll-triggered animations
│   ├── header.tsx                     # Main navigation
│   ├── mobile-menu.tsx                # Mobile navigation drawer
│   ├── substack-signup.tsx            # Newsletter subscription
│   ├── calendar-section.tsx           # Lu.ma calendar embed
│   ├── airtable-embed.tsx             # Airtable integration (lazy loaded)
│   ├── research-filters.tsx           # Category filter buttons
│   ├── faq-accordion.tsx              # Reusable accordion
│   ├── events-carousel.tsx            # Auto-scrolling gallery
│   └── rum-monitor.tsx                # Real User Monitoring
├── hooks/                 # Custom React hooks
│   ├── use-fade-in.ts                 # IntersectionObserver hook
│   ├── use-lcp-complete.ts            # LCP detection hook
│   ├── use-local-storage.ts           # SSR-safe localStorage
│   └── use-isomorphic-layout-effect.ts
├── contexts/              # React contexts
│   └── language-context.tsx           # i18n provider
├── data/                  # Static data
│   └── resources.ts                   # 50+ AI safety resources
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions
├── workers/               # Web Workers
│   └── thread-generator.worker.ts    # Background thread generation
├── head.tsx               # Resource hints
├── globals.css            # Tailwind + custom properties
└── layout.tsx             # Root layout

public/
├── images/
│   ├── logos/             # Optimized logo variants (40-192px)
│   ├── optimized/         # Batch-optimized images
│   └── events/            # Event gallery images
└── icons/                 # Favicon variants

.github/
└── workflows/
    └── lighthouse-ci.yml  # Automated performance testing

scripts/
├── optimize-logo.js       # Logo optimization
└── optimize-images.js     # Batch image optimization
```

## 🎨 Key Features

### 1. Bilingual Support (EN/ES)

Dictionary-based internationalization system with server-side translation loading:

- All content available in English and Spanish
- Language switcher in header
- SEO-optimized with proper locale metadata
- No inline ternary translations (all in dictionaries)

### 2. Resources Library (50+ items)

Advanced filtering and progress tracking:

- Multi-dimensional filters (difficulty, type, topic)
- Virtual scrolling for optimal performance
- localStorage-based completion tracking
- Quick wins, community picks, and latest additions sections
- Airtable embed for timeline view (lazy loaded)

### 3. Animated Timeline Background

High-performance 60fps SVG animation:

- Float32Array for memory efficiency
- Web worker offloading
- IntersectionObserver for battery optimization
- Deferred until after LCP
- Desktop/mobile adaptive scaling

### 4. View Transitions

Smooth page transitions using the View Transitions API:

- Per-word title animations (first 5 words)
- Shared element transitions
- Progressive enhancement (fallback for unsupported browsers)

### 5. Performance Optimizations

Production-ready optimizations:

- React Compiler enabled (zero manual memoization)
- Code splitting (6 components dynamically imported)
- Resource virtualization (50+ cards → 12 rendered)
- Lazy loading (calendar, embeds, below-fold components)
- Responsive backdrop blur reduction on desktop
- Font preconnect and display:swap
- SWC minification (default)
- Bundle analysis ready (`pnpm analyze`)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (not checked in):

```bash
# Add your environment variables here
# (Currently no env vars required for basic functionality)
```

### next.config.ts

Configured with:

- React Compiler enabled
- SWC minification (default in Next.js 16)
- Image optimization (AVIF, WebP)
- Package import optimization (@vercel/*, @tanstack/react-virtual)
- Bundle analyzer (enabled with `ANALYZE=true`)

### Internationalization

Add new translations to:

- `app/[locale]/dictionaries/en.json` (English)
- `app/[locale]/dictionaries/es.json` (Spanish)

**Important:** Never use inline ternary translations. Always use dictionary references.

## 📈 Performance Monitoring

### Lighthouse CI

Automated performance testing on all PRs:

- Mobile and desktop configurations
- Tests homepage and resources page
- Performance, accessibility, and best practices
- Configured in `.github/workflows/lighthouse-ci.yml`

### Real User Monitoring (RUM)

Production monitoring with Core Web Vitals tracking:

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- Console logging in development
- Integrated with Vercel Analytics

### Bundle Analysis

```bash
# Generate bundle reports
pnpm analyze

# View reports
open .next/analyze/client.html
open .next/analyze/nodejs.html
open .next/analyze/edge.html
```

Reports show:
- Bundle composition
- Largest modules
- Duplicate dependencies
- Optimization opportunities

## 🛠️ Development Workflow

### Adding New Pages

1. Create page in `app/[locale]/your-page/page.tsx`
2. Add translations to `en.json` and `es.json`
3. Add route to navigation in `header.tsx`
4. Update mobile menu if needed
5. Test both `/en/your-page` and `/es/your-page`

### Adding New Components

1. Create component in `app/components/your-component.tsx`
2. Use `"use client"` if client-side only
3. Use `"use no memo"` only if manual optimization needed
4. Avoid `React.memo()`, `useMemo()`, `useCallback()` (React Compiler handles it)
5. Add types in `app/types/` if needed

### Performance Guidelines

- Use `startVisible={true}` on above-fold `FadeInSection` components
- Use `dynamic()` for below-fold heavy components
- Add `loading` prop to dynamic imports for skeleton states
- Use IntersectionObserver for embeds and heavy content
- Test with Lighthouse after changes

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push and create PR
git push origin feature/your-feature
```

Commit messages should:
- Use present tense ("Add feature" not "Added feature")
- Be concise but descriptive
- Reference issue IDs when relevant

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Vercel will auto-detect Next.js
3. Deploy (no environment variables needed for basic functionality)

Features automatically enabled on Vercel:
- Brotli + Gzip compression
- Edge caching
- Automatic HTTPS
- Preview deployments for PRs
- Analytics & Speed Insights

### Manual Deployment

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start

# Or use your preferred hosting (Netlify, AWS, etc.)
```

## 📚 Documentation

Comprehensive documentation available:

- **[CLAUDE.md](./CLAUDE.md)** - Complete project documentation and coding conventions
- **[DESKTOP_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md](./DESKTOP_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md)** - Phase 1-5 performance optimizations
- **[ITEMS_2_AND_4_IMPLEMENTATION_SUMMARY.md](./ITEMS_2_AND_4_IMPLEMENTATION_SUMMARY.md)** - Additional performance optimizations
- **[PERFORMANCE_PLAN_CHANGES.md](./PERFORMANCE_PLAN_CHANGES.md)** - Performance planning documentation
- **[docs/view-transitions-guide.md](./docs/view-transitions-guide.md)** - View Transitions API implementation guide

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads (EN & ES)
- [ ] All navigation links work
- [ ] Mobile menu opens/closes correctly
- [ ] Language switcher works
- [ ] Resource filters work
- [ ] Resource completion checkboxes persist
- [ ] Airtable embed loads when scrolled into view
- [ ] Calendar loads on activities page
- [ ] FAQ accordion works on contact page
- [ ] Forms submit correctly (newsletter, contact)

### Performance Testing

```bash
# Run Lighthouse
pnpm build
pnpm start

# Then use Chrome DevTools Lighthouse or:
# https://pagespeed.web.dev/

# Or use the Lighthouse tool:
mcp__lighthouse__run_audit --url http://localhost:3000/en --device desktop
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `pnpm build` to verify
6. Submit a pull request

Guidelines:
- Follow the coding conventions in CLAUDE.md
- Add translations for both EN and ES
- Test on both desktop and mobile
- Maintain or improve performance scores
- Update documentation if needed

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and analytics
- AI Safety community for resources and content
- Contributors and maintainers

## 📧 Contact

- Website: [baish.com.ar](https://baish.com.ar)
- Telegram: [Join our community](https://t.me/+zhSGhXrn56g1YjVh)
- LinkedIn: [Connect with us](#)

---

**Built with ❤️ for the AI Safety community**

Last updated: October 23, 2025
