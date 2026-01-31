# Signifier Font: Spanish Accent Character Analysis & Fix

## Problem

When viewing the Spanish (`/es/`) version of the BAISH website, accented characters (á, é, í, ó, ú, ñ, ü, ¿, ¡) in headings and card titles render in a visually different font than the surrounding text. This creates an inconsistent, broken appearance where individual letters "pop" out of words.

## Root Cause

**The Signifier font files in this project are Klim Type Foundry's free "Test" fonts, which are intentionally limited to Basic Latin characters only.**

### Evidence

Programmatic analysis of all 6 `.woff2` files confirms:

| File | Size | Glyphs | Unicode Range |
|------|------|--------|---------------|
| Signifier-Regular.woff2 | 6.2 KB | 66 | U+0020–U+007A |
| Signifier-Italic.woff2 | 6.6 KB | 66 | U+0020–U+007A |
| Signifier-Medium.woff2 | 6.6 KB | 66 | U+0020–U+007A |
| Signifier-MediumItalic.woff2 | 7.2 KB | 66 | U+0020–U+007A |
| Signifier-Bold.woff2 | 6.6 KB | 66 | U+0020–U+007A |
| Signifier-BoldItalic.woff2 | 7.2 KB | 66 | U+0020–U+007A |

The font metadata confirms this explicitly:
- **nameID 1:** "Test Signifier"
- **nameID 6:** "TestSignifier-Regular"
- **Copyright:** "Copyright 2022, Kris Sowersby, Klim Type Foundry."

The 66 glyphs include only: `A-Z`, `a-z`, `0-9`, space, comma, hyphen, and period. **Zero** accented characters. **Zero** typographic characters (no em dash, smart quotes, ellipsis).

Klim's own test font documentation states:
> "Test fonts have no OpenType features and a limited character set:
> ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,-"

### Impact

- **302 Spanish strings** contain accented characters
- **47 heading/title strings** are affected (these render in Signifier)
- Affected characters: `á é í ó ú ñ ¿ ¡ Á`
- Current fallback chain is `Georgia, "Times New Roman", serif` — these are visually quite different from Signifier's Brutalist aesthetic, causing jarring mid-word font switches
- `font-synthesis: none` is set on all headings (`globals.css:128`), which is correct for preventing faux bold/italic but does not affect glyph fallback

### Where Signifier is Applied

Signifier is used for all high-visibility text:

| Element | File | Line |
|---------|------|------|
| All `h1`–`h6` headings | `globals.css` | 125–129 |
| `.card-title` | `globals.css` | 697–704 |
| `.stat-number` | `globals.css` | 210–218 |
| `.survey-title` | `globals.css` | 1784–1790 |
| `.title-words` (header) | `header.css` | 67–78 |

---

## Solutions (Ranked)

### Option 1: Purchase Full Signifier License (Recommended)

**What:** Buy the commercial Signifier web font license from Klim Type Foundry and replace the test fonts.

**Why this is best:**
- The full Signifier font supports Latin Extended characters (confirmed by font comparison databases listing "latin, latin-extended" for the commercial version)
- No visual compromises — every character renders in Signifier as designed
- Signifier's full glyph set includes all Spanish characters, typographic quotes, dashes, and more
- The 6 styles currently used (Regular, Italic, Medium, Medium Italic, Bold, Bold Italic) map to Klim's weight offerings
- Klim licenses are one-time purchases with no expiry

**How:**
1. Visit https://klim.co.nz/buy/signifier/
2. Purchase a **Web** license (needed for `@font-face` / self-hosted usage)
3. Select the 6 styles: Regular 400, Regular 400 Italic, Medium 500, Medium 500 Italic, Bold 700, Bold 700 Italic
4. Download the WOFF2 files and replace the contents of `public/fonts/signifier/`
5. Update weights in `app/[locale]/layout.tsx` if Klim's Bold maps to `700` instead of `600`
6. Optionally subset to Latin + Latin Extended to keep file sizes small (Klim permits subsetting per their license)
7. Verify: `bun run build` and check `/es/` routes

**Cost:** Klim web font licenses start around $50–150 NZD per style depending on pageview tier. A 6-style package with automatic discounts would apply.

**Important licensing note:** The current Test fonts carry a "Test Font Licence" that explicitly restricts usage to internal mockups only — they should not be used on a public-facing production website. Purchasing the commercial license resolves both the character coverage and the licensing issue.

---

### Option 2: CSS `unicode-range` Blending with a Visually Similar Fallback

**What:** Keep Signifier for Basic Latin and use a carefully chosen similar serif for accented characters via `unicode-range` splitting.

**Why:** If purchasing the full font isn't possible right now, this is the best visual compromise.

**How:**

1. Choose a fallback serif that is visually similar to Signifier. Best candidates:
   - **Spectral** (Google Fonts) — transitional serif, similar x-height and contrast
   - **EB Garamond** (Google Fonts) — classic serif with full Latin Extended
   - **Source Serif 4** (Google Fonts) — clean transitional serif, excellent language support
   - **Charter** (free, Bitstream) — clean, high-contrast serif often cited as similar

2. Add the fallback font in `app/[locale]/layout.tsx` using `next/font/google`:

```typescript
import { Source_Serif_4 } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-signifier-fallback",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
```

3. Add manual `@font-face` overrides in `globals.css` that restrict Signifier to Basic Latin via `unicode-range` and assign the fallback to Latin Extended:

```css
/* Override Signifier to only claim Basic Latin */
/* (This requires switching from next/font to manual @font-face) */

@font-face {
  font-family: "SignifierBlended";
  src: url("/fonts/signifier/Signifier-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007A; /* Basic Latin only */
}

@font-face {
  font-family: "SignifierBlended";
  src: local("Source Serif 4"), local("SourceSerif4-Regular");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+00A0-00FF, U+0100-024F; /* Latin Extended */
}
```

4. Update CSS custom property to use the blended family.

**Caveats:**
- Metrics (x-height, cap height, stroke width) will never perfectly match — accented characters may still look subtly different
- Requires careful metric tuning with `ascent-override`, `descent-override`, `size-adjust` in `@font-face`
- Increases font loading complexity
- The `next/font` `localFont()` API doesn't directly support `unicode-range` — you'd need to switch heading fonts to manual `@font-face` declarations or use a CSS-level override

---

### Option 3: Replace Signifier Entirely with a Free Alternative

**What:** Swap Signifier for a free/open-source serif with full Latin Extended support.

**Why:** Avoids licensing costs and permanently solves the character coverage issue.

**Best candidates:**

| Font | Source | Similarity to Signifier | Latin Ext | Notes |
|------|--------|------------------------|-----------|-------|
| Source Serif 4 | Google Fonts | Medium | Yes | Clean transitional, variable font, excellent language support |
| Spectral | Google Fonts | Medium-High | Yes | Designed by Production Type, similar weight/contrast |
| EB Garamond | Google Fonts | Medium | Yes | Classic Garamond revival, strong diacritic support |
| Libre Baskerville | Google Fonts | Low-Medium | Yes | Traditional Baskerville, different character |
| Cormorant | Google Fonts | Medium | Yes | High contrast, elegant, closer to Signifier's Brutalist sharpness |

**How:**
1. Replace the `localFont()` call in `layout.tsx` with a Google Fonts import
2. Update the `--font-signifier` CSS variable (or rename to `--font-serif`)
3. Adjust `font-weight` values if the replacement uses different weight mappings
4. Test all pages in both locales

**Tradeoff:** Changes the site's visual identity. Signifier has a distinctive Brutalist character that generic Google Fonts serifs don't replicate.

---

### Option 4: Improve Fallback Chain (Quick Fix)

**What:** Tune the existing fallback fonts to minimize the visual jarring when accented characters fall through to Georgia/Times New Roman.

**How:**

In `app/[locale]/layout.tsx`, add `adjustFontFallback` configuration and refine the fallback list:

```typescript
const signifier = localFont({
  src: [ /* ... existing ... */ ],
  variable: "--font-signifier",
  display: "swap",
  preload: true,
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman", // Generate size-adjusted fallback
});
```

Additionally, in `globals.css`, you could add fallback font metric overrides:

```css
@font-face {
  font-family: "Signifier Fallback";
  src: local("Georgia");
  ascent-override: 95%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 105%;
}
```

**Tradeoff:** This only reduces the jarring — accented characters will still visibly differ. Not a real fix, just damage control.

---

## Recommended Path

**Option 1 (purchase the full Signifier license)** is the clear best path for two reasons:

1. **It solves the problem completely** — all characters render in Signifier as the designer intended
2. **The current Test fonts are not licensed for production use** — Klim's Test Font Licence explicitly restricts usage to internal design mockups. Using them on a public website violates the license terms

If budget is a constraint, **Option 2** (unicode-range blending with Source Serif 4 or Spectral) is the best interim solution. It preserves Signifier's distinctive look for the majority of text while providing acceptable accented character rendering.

**Option 3** (full replacement) should only be considered if the project wants to move away from Signifier entirely.

## Implementation Notes

Regardless of which option is chosen:

- The `font-synthesis: none` declaration on headings (`globals.css:128`) should be kept — it prevents browser-synthesized bold/italic which looks worse than fallback fonts
- After replacing font files, run `bun run build` to verify no build errors
- Test both `/en/` and `/es/` routes, paying attention to headings, card titles, and stat numbers
- Check that `preload: true` still works correctly (verify in Network tab that font files are preloaded)
- If using Option 1, consider subsetting the commercial fonts to `latin` + `latin-ext` ranges to keep file sizes comparable to the current ~6-7 KB per file (full Signifier files will be larger)
