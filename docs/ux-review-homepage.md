# BAISH Homepage UX Review

**Date:** December 2024
**Reviewer:** Claude (Frontend Design Analysis)
**URL:** https://aisafety.ar / localhost:3000
**Scope:** Homepage (`/[locale]/page.tsx`)

---

## Executive Summary

The BAISH homepage is **technically solid** with good Lighthouse scores (84/100 desktop, 94/100 mobile) and a clear information architecture. However, it suffers from a common "AI-generated design" aesthetic that diminishes brand memorability. The purple gradient palette, generic typography choices, and competing CTAs create a site that functions well but fails to establish a distinctive identity for an AI safety organization.

**Overall Score: 5.8/10** — Competent but forgettable.

---

## Table of Contents

1. [Visual Analysis](#1-visual-analysis)
2. [Typography Assessment](#2-typography-assessment)
3. [Color & Brand](#3-color--brand)
4. [Layout & Spacing](#4-layout--spacing)
5. [Interactive Elements](#5-interactive-elements)
6. [Mobile Experience](#6-mobile-experience)
7. [Accessibility Audit](#7-accessibility-audit)
8. [User Flow Analysis](#8-user-flow-analysis)
9. [Content Strategy](#9-content-strategy)
10. [Recommendations](#10-recommendations)

---

## 1. Visual Analysis

### Hero Section

**What's Working:**
- Large, confident serif headline ("From Curious to Contributing")
- Clean centered layout with good vertical rhythm
- Tagline provides immediate context

**Issues Identified:**

| Problem | Severity | Location |
|---------|----------|----------|
| Survey banner visually outweighs headline | High | Below tagline |
| No above-fold social proof (stats buried below) | Medium | Hero section |
| Generic thread background adds visual noise without meaning | Low | Full page |

**Screenshot Evidence:**
The hero presents a clean serif headline at approximately 80px on desktop. The survey banner with its animated gradient border and shimmer effect draws more attention than the primary value proposition.

### Timeline Component

**What's Working:**
- Clear journey visualization (Join → Learn → Build → Research)
- Animated gradient line draws the eye
- Hover states reveal tooltips with descriptions
- Staggered entrance animation creates dynamism

**Issues Identified:**
- Timeline labels ("Join", "Learn", "Build", "Research") are generic verbs
- No differentiation between internal and external links visually
- Tooltips are hover-only (keyboard users can't access descriptions)
- Mobile: Tooltips completely hidden (`display: none`)

### Section Hierarchy

```
┌─────────────────────────────────────────┐
│  HERO (title + tagline)                 │  ← Weak emphasis
├─────────────────────────────────────────┤
│  SURVEY BANNER                          │  ← Strongest visual (competing)
├─────────────────────────────────────────┤
│  TIMELINE (Join→Learn→Build→Research)   │  ← Good
├─────────────────────────────────────────┤
│  EVENTS (calendar embed)                │  ← Empty state showing
├─────────────────────────────────────────┤
│  PROGRAMS (3 cards)                     │  ← Good
├─────────────────────────────────────────┤
│  GET INVOLVED (newsletter + community)  │  ← Buried conversion
└─────────────────────────────────────────┘
```

**Verdict:** The visual hierarchy is inverted — promotional content (survey) dominates while conversion (Get Involved) is buried.

---

## 2. Typography Assessment

### Font Stack

```css
--font-sans: TT Hoves (body)
--font-serif: Signifier (headings)
```

### Scale Analysis

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| H1 (Hero) | clamp(2.5rem, 7vw, 5.5rem) | 600 | Good responsive scaling |
| H2 (Sections) | clamp(1.75rem, 3vw, 2.5rem) | 600 | Adequate |
| Card Title | 20px / 26px line-height | 600 | Too small |
| Body | 18px / 1.7 | 400 | Good readability |
| Eyebrow | 12px uppercase | 600 | Contrast issues |

### Issues

**❌ Generic Font Pairing**
- Signifier + TT Hoves is an extremely common 2023-2024 startup pairing
- Neither font has distinctive character for an AI safety research organization
- Signifier signals "VC-funded tech company" not "academic research hub"

**❌ Insufficient Title Hierarchy**
- Card titles at 20px are only 1.33x body text (15px)
- Should be 1.5x minimum for clear hierarchy

**❌ Eyebrow Text Undersized**
- 12px with 0.1em letter-spacing is hard to read
- Purple on light gray fails contrast requirements

### Typography Score: 5/10

---

## 3. Color & Brand

### Current Palette

```css
--color-accent-primary: #9275E5    /* Purple */
--color-accent-secondary: #A8C5FF  /* Purple-blue */
--color-accent-tertiary: #C77DDA   /* Purple-pink */
--background: #f5f5f5              /* Light gray */
```

### Brand Analysis

**❌ "AI Slop" Alert**
This exact palette (purple/lavender/pink gradient on off-white) is the #1 cliché of AI-generated websites in 2024. It reads as "we used an AI design tool" rather than "we research AI safety."

**Visual Evidence:**
- Survey banner: Animated purple gradient border
- Timeline: Purple gradient connecting line
- Buttons: Purple gradient backgrounds
- Pills: Purple tinted backgrounds

**Zero Differentiation:**
The palette is indistinguishable from thousands of other AI/tech startup sites. Nothing says "Buenos Aires" or "AI Safety Research" or "Academic Community."

### Contrast Issues

| Element | Colors | Ratio | WCAG |
|---------|--------|-------|------|
| Eyebrow text | #9275E5 on #f5f5f5 | ~3.4:1 | ❌ Fail AA |
| Card eyebrow | #7E6AF6 on #ffffff | ~3.8:1 | ❌ Fail AA |
| Body text | slate-600 on #f5f5f5 | ~4.2:1 | ⚠️ Borderline |
| Survey badge | #7E6AF6 on light | ~3.8:1 | ❌ Fail AA |

**Required:** 4.5:1 for small text (WCAG AA)

### Color Score: 4/10

---

## 4. Layout & Spacing

### Grid System

```css
max-w-6xl (1152px)    /* Main container */
max-w-4xl (896px)     /* Hero content */
max-w-2xl (672px)     /* Tagline */
```

### Section Spacing

```css
.main-sections { gap: 6rem; }     /* 96px mobile */
.main-sections { gap: 8rem; }     /* 128px desktop - generous */
.card-grid { gap: 2rem; }         /* 32px - good */
.section-content { gap: 3rem; }   /* 48px - good */
```

**What's Working:**
- Generous vertical rhythm between sections
- Consistent card padding (32px)
- Good responsive breakpoints

### Issues

**❌ Hero Section Cramped**
Despite generous section gaps, the hero feels cramped because:
- Survey banner has only `margin-top: 2.5rem` from tagline
- Timeline has `margin: 4rem auto 0`
- Too many elements competing in tight vertical space

**❌ Card Grid Missing Visual Grouping**
Three program cards sit side-by-side with no container or visual indicator they're part of a cohesive offering.

**❌ Get Involved Asymmetry**
Newsletter card is shorter than Community card (which has two stacked CTAs), creating visual imbalance.

### Layout Score: 7/10

---

## 5. Interactive Elements

### Button Styles

```css
.button-primary {
  background: linear-gradient(135deg, #9275E5, #7E6AF6);
  box-shadow: 0 4px 12px rgba(146, 117, 229, 0.25);
}

.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(146, 117, 229, 0.35);
}
```

**What's Working:**
- Consistent hover feedback
- Focus-visible states present
- Smooth transitions (0.3s cubic-bezier)

### Card Hover States

**Observed Behavior:**
- Cards lift 4px with scale(1.005)
- Gradient border fades in around edges
- Enhanced box-shadow
- Subtle inner glow

**Issue:** Hover state is "performative" — lots of visual changes that don't add informational value. A simple underline or border would communicate clickability more efficiently.

### Timeline Interactions

**What's Working:**
- Node fills with gradient on hover
- Icon inverts to white
- Label turns purple
- Ring animation pulses outward
- Tooltip appears with description

**Issues:**
- Tooltip only appears on `:hover`, not `:focus`
- Keyboard users cannot access descriptions
- Mobile users lose this information entirely

### Animation Inventory

| Element | Animation | Duration | Issue |
|---------|-----------|----------|-------|
| Survey gradient | Shifting gradient | 4s infinite | Distracting |
| Survey glow | Pulse | 3s infinite | Competing |
| Survey shimmer | Sweep | 4s infinite | Excessive |
| Survey icon | Pulse shadow | 2s infinite | Overkill |
| Timeline line | Draw | 1s once | Good |
| Timeline steps | Stagger appear | 0.5s once | Good |
| Card hover | Lift + glow | 0.3s | Acceptable |

**Verdict:** Survey banner has 4+ concurrent animations while the hero title has none. Animation hierarchy is inverted.

### Interactions Score: 6/10

---

## 6. Mobile Experience

### Breakpoints

```css
sm: 640px   /* Mobile → Tablet */
md: 768px   /* Tablet → Small Desktop */
lg: 1024px  /* Desktop */
```

### Mobile Observations (390px viewport)

**What's Working:**
- Full logo text visible in header ("Buenos Aires AI Safety Hub")
- Hamburger menu well-positioned
- Cards stack properly to single column
- Survey banner stacks vertically

**Issues Identified:**

| Problem | Severity | Details |
|---------|----------|---------|
| Primary CTA hidden | High | "Join Us" button hidden below 640px |
| Timeline tooltips removed | High | Mobile users lose step descriptions |
| Survey banner dominates | Medium | ~200px height dominates viewport |
| Header collapses to "BAISH" on scroll | Low | Acceptable behavior |

**Mobile Screenshots:**
- Hero section displays cleanly with full-width survey banner
- Timeline converts to 2x2 grid (Join/Learn, Build/Research)
- Program cards stack vertically with proper spacing
- Community buttons are full-width and prominent

### Mobile Score: 6/10

---

## 7. Accessibility Audit

### Positive Findings

✅ `aria-label` on timeline nodes provides context
✅ `aria-hidden="true"` on decorative elements
✅ Focus-visible states on buttons and links
✅ `prefers-reduced-motion` media queries present
✅ `prefers-contrast: more` styles defined
✅ Skip link considerations (header is sticky)

### Issues Requiring Attention

**❌ Color Contrast Failures (WCAG AA)**
- Eyebrow text: ~3.4:1 (needs 4.5:1)
- Card eyebrow: ~3.8:1 (needs 4.5:1)
- Survey badge: ~3.8:1 (needs 4.5:1)

**❌ Keyboard Accessibility**
```css
/* Current - hover only */
.timeline-step:hover .timeline-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Missing - should add */
.timeline-step:focus-within .timeline-tooltip {
  opacity: 1;
  visibility: visible;
}
```

**❌ Mobile Menu Delay**
```tsx
const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });
```
First tap has ~100-300ms delay before menu appears. No loading indicator.

**❌ Screen Reader Experience**
- Timeline step descriptions are in tooltips (hidden from screen readers when not hovered)
- Survey banner animation may be disorienting for vestibular disorders

### Accessibility Score: 6/10

---

## 8. User Flow Analysis

### Current Homepage Flow

```
1. Land on page
   ↓
2. See hero title + tagline (weak CTA)
   ↓
3. Survey banner (strong CTA → external)
   ↓
4. Timeline - 4 steps (mixed internal/external)
   ↓
5. Events calendar (external embed, currently empty)
   ↓
6. Activities cards (internal links)
   ↓
7. Get Involved (newsletter + community) ← CONVERSION
```

### Issues

**❌ Conversion Buried**
The primary goal (community signup) is at the bottom. Users must scroll past:
- Survey (external)
- Timeline (mixed)
- Empty calendar
- Activity cards

...before reaching conversion.

**❌ External Links Before Internal Engagement**
- Timeline Step 1: WhatsApp (external)
- Survey: Airtable (external)
- Calendar: lu.ma (external)

Users are pushed off-site before exploring actual content.

**❌ Competing CTAs**

| Location | CTA | Destination |
|----------|-----|-------------|
| Header | "Join Us" | Scrolls to Get Involved |
| Survey | "Take the Survey" | Airtable (external) |
| Timeline | "Join" | WhatsApp (external) |
| Timeline | "Learn" | /activities/fundamentals |
| Timeline | "Build" | /activities/workshop |
| Timeline | "Research" | aisar.ar (external) |

**User Question:** "What should I click first?"

### Flow Score: 5/10

---

## 9. Content Strategy

### Value Proposition

**Current:**
- Title: "From Curious to Contributing"
- Tagline: "Supporting your path into AI safety research"

**Analysis:**
- "From Curious to Contributing" is clever but abstract
- Doesn't explain WHAT BAISH does or WHO it's for
- Compare to Recurse Center: "The retreat where curious programmers recharge and grow"

### Social Proof Placement

**Current Location:** Success Stories section (not visible)
- 200+ community members
- 10+ research fellowships
- 3+ published papers

**Should Be:** Above the fold, immediately after tagline

### Timeline Labels

**Current:**
- Join / Learn / Build / Research

**Issue:** These are generic verbs that could apply to any educational program

**Better:**
- Connect (200+ members)
- Foundations (13-week course)
- Replicate (weekly workshop)
- Publish (6-month fellowship)

### Bilingual Implementation

**What's Working:**
- Complete translation of all UI elements
- Proper dictionary structure
- Language switcher functions correctly

**Spanish Example:**
- "De Curioso a Investigador"
- "Apoyando tu camino hacia la investigación en AI safety"
- "Sumate" (Join Us)

### Content Score: 6/10

---

## 10. Recommendations

### Priority 1: Critical (Accessibility & Usability)

| Issue | Fix | Effort |
|-------|-----|--------|
| Color contrast failures | Darken eyebrow text to `--brand-600` (#6D5BF5) | Low |
| Tooltip keyboard access | Add `:focus-within` to timeline tooltips | Low |
| Mobile CTA hidden | Keep "Join Us" visible as icon on mobile | Medium |
| Timeline descriptions | Add `aria-describedby` linking to visible descriptions | Medium |

### Priority 2: High Impact (Conversion & Flow)

| Issue | Fix | Effort |
|-------|-----|--------|
| Conversion buried | Move community signup higher (after hero) | Medium |
| Competing CTAs | Consolidate to one primary action | Medium |
| Social proof hidden | Add member count to hero section | Low |
| Survey dominance | Reduce animation (one effect, not five) | Low |

### Priority 3: Brand & Differentiation

| Issue | Fix | Effort |
|-------|-----|--------|
| Generic palette | Develop distinctive color identity | High |
| AI-slop typography | Consider more distinctive font pairing | High |
| Missing photography | Add team/event photos | Medium |
| Generic timeline labels | Make labels specific to BAISH journey | Low |

### Priority 4: Polish & Refinement

| Issue | Fix | Effort |
|-------|-----|--------|
| Animation hierarchy | Hero should animate more than survey | Medium |
| Empty calendar state | Add placeholder content or hide when empty | Low |
| Card hover excess | Simplify to single hover indicator | Low |
| Mobile menu delay | Add loading state or preload on viewport | Medium |

---

## Summary Scorecard

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Visual Hierarchy | 6/10 | 15% | 0.90 |
| Typography | 5/10 | 10% | 0.50 |
| Color & Brand | 4/10 | 15% | 0.60 |
| Layout & Spacing | 7/10 | 10% | 0.70 |
| Interactions | 6/10 | 10% | 0.60 |
| Mobile Experience | 6/10 | 15% | 0.90 |
| Accessibility | 6/10 | 10% | 0.60 |
| User Flow | 5/10 | 10% | 0.50 |
| Content Strategy | 6/10 | 5% | 0.30 |
| **TOTAL** | | **100%** | **5.60/10** |

---

## Conclusion

The BAISH homepage is a **functional but forgettable** implementation. It successfully communicates the organization's programs and provides clear paths to engagement. However, it fails to establish a distinctive brand identity that differentiates BAISH from countless other AI/tech organizations.

**The core tension:** The site tries to serve both new visitors (who need orientation) and existing community members (who need quick access to events/resources). By serving both, it serves neither well.

**Recommended Focus:**
1. Fix accessibility issues (contrast, keyboard navigation)
2. Establish clear primary CTA (pick ONE: survey, community, or newsletter)
3. Move social proof above the fold
4. Develop distinctive visual identity beyond purple gradients

The technical foundation is strong. The design direction needs clarity.

---

*Report generated by Claude (Frontend Design Analysis)*
*Based on visual inspection via Chrome automation + code review*
