# Website Improvements Plan

Based on feedback from `Website Improvements.pdf`, verified against the codebase.

---

## Critical Errors (Verified)

### 1. Hallucinated Paper Title in Eitan's Bio

**Status:** VERIFIED - Title is completely wrong

**Location:** `app/utils/footnotes.tsx:36-39`
```typescript
eitanArxivPaperLink: {
  href: "https://arxiv.org/abs/2510.13912",
  text: 'the paper "Strategic Deception in AI Systems"',  // WRONG
},
```

**Actual Paper Title:** "AI Debaters are More Persuasive when Arguing in Alignment with Their Own Beliefs"

**Fix:**
```typescript
eitanArxivPaperLink: {
  href: "https://arxiv.org/abs/2510.13912",
  text: 'the paper "AI Debaters are More Persuasive when Arguing in Alignment with Their Own Beliefs"',
},
```

---

### 2. Missing Paper (Eitan + Austin)

**Status:** VERIFIED - Paper exists but not referenced anywhere

**Missing Paper:**
- **Title:** "Measuring Chain-of-Thought Monitorability Through Faithfulness and Verbosity"
- **URL:** https://arxiv.org/abs/2510.27378
- **Authors:** Austin Meek, Eitan Sprejer, Iván Arcuschin, Austin J. Brockmeier, Steven Basart

**Files to Update:**

1. **Bio links** - `app/utils/footnotes.tsx:21-40`
   - Add new link entry for this paper

2. **Dictionary bios** - Update Eitan's bio text to mention both papers:
   - `app/[locale]/dictionaries/en.json:216`
   - `app/[locale]/dictionaries/es.json:216`

3. **Publications section** - Add to research page publications:
   - `app/[locale]/dictionaries/en.json:531-543`
   - `app/[locale]/dictionaries/es.json:531-543`

---

### 3. Placeholder URL in Publications

**Status:** VERIFIED - Obvious placeholder needs fixing

**Location:**
- `app/[locale]/dictionaries/en.json:540`
- `app/[locale]/dictionaries/es.json:540`

```json
"url": "https://openreview.net/forum?id=YOUR_PAPER_ID"  // PLACEHOLDER!
```

**Fix:** Replace with actual OpenReview URL for "Gradient Tracing for Sparse Autoencoders"

**Note:** The `eitanPaperLink` in footnotes.tsx points to `https://openreview.net/forum?id=F8cIIwrgCZ#discussion` which is actually "Approximating Human Preferences Using a Multi-Judge Learned System" - need to verify which paper should be in publications.

---

### 4. OpenPhil Description

**Status:** RESOLVED

**Clarification:** OpenPhil changed its name to Coefficient Giving. This is already correctly reflected in the codebase - the support section lists "Coefficient Giving" which is the new name.

**No action needed.**

---

### 5. Workshop Naming

**Status:** APPEARS CORRECT

**Current naming:** "Agentic Coding Workshop" throughout:
- `app/[locale]/dictionaries/en.json:365,369,371,694-721`
- `app/[locale]/dictionaries/es.json:365,369,371,694-721`
- `app/[locale]/agentic-coding-workshop/page.tsx`

**PDF says:** "Say 'Agentic coding' workshop instead"

**Observation:** Current naming matches the request. This issue may have already been fixed, or the naming discrepancy is subtle (capitalization?).

---

## High-Level Improvements

### 6. Add "Success Stories" Section

**Status:** MISSING - Section does not exist

**PDF Requirements:**
- AISAR programme achievements
- Published papers and collaborative projects
- Events attended, talks given
- Individual participant stories:
  - Ana (project with Vicky, ML4Good)
  - Charly (current status)
  - Guido (AISAR, now at MARS)
  - Guido Bergman (Algoverse, Evals work)
  - Eitan, Luca, Lucas
  - Luca De Leo

**Implementation:**
1. Create new section in dictionaries for success stories
2. Add to landing page or create dedicated page
3. Consider merging with AISAR content

**Files to create/modify:**
- `app/[locale]/dictionaries/en.json` - Add `successStories` section
- `app/[locale]/dictionaries/es.json` - Add Spanish translations
- `app/[locale]/page.tsx` OR create new `app/[locale]/impact/page.tsx`

---

### 7. Restructure About Page - Pictures First

**Status:** Structural change needed

**Current Order** (`app/[locale]/about/page.tsx`):
1. Core Concepts (What is AI Safety) - Lines 65-141
2. Our Approach - Lines 143-183
3. Cofounders - Lines 185-334
4. Team - Lines 336-698
5. Support - Lines 700-830

**Requested Order:**
1. Cofounders/Team (pictures first)
2. Our Approach
3. Core Concepts (consider removing/demoting "What is AI Safety")

**Files to modify:**
- `app/[locale]/about/page.tsx` - Reorder sections
- Consider moving "What is AI Safety" to a separate page or FAQ

---

### 8. Landing Page Improvements

**Status:** Multiple changes needed

**Current State** (`app/[locale]/page.tsx`):
- Mission section with 3 paragraphs (lines 39-87)
- Events section (lines 89-111)
- Activities section (lines 113-210)
- Get Involved section (lines 212-256)

**PDF Requests:**

#### 8a. One-liner mission instead of paragraphs
**Location:** `app/[locale]/dictionaries/en.json:48-54`
```json
"mission": {
  "paragraph1": "...",  // Long
  "paragraph2": "...",  // Long
  "paragraph3": "..."   // Long
}
```
**Action:** Create condensed one-liner version, keep detailed paragraphs for About page

#### 8b. Show ladder-like programs (like Apart)
**Inspiration:** Apart Research's visual pathway (Research Sprints → Remote Lab → Research Outputs → Impact)
**Implementation:** Add visual stepped pathway showing progression through BAISH programs
**Files:** Create new component, add to landing page

#### 8c. Showcase published research
**Action:** Add research highlights section linking to Research tab
**Files:** `app/[locale]/page.tsx`, add new section

#### 8d. Showcase Club del Paper videos
**Action:** Add featured videos section with best recordings
**Implementation:** YouTube embed carousel or highlights
**Files:** `app/[locale]/page.tsx`, create video showcase component

#### 8e. Show AISAR and FAIR as sister orgs
**Action:** Add partners/ecosystem section
**Files:** `app/[locale]/page.tsx`, dictionaries for translations

#### 8f. Clear "getting started" steps (CAISH inspiration)
**CAISH Example:**
1. Join an event (socials every Thursday)
2. Apply for Alignment Fellowship
3. Apply for ML Bootcamp
4. Join the leadership team

**Action:** Create numbered getting-started pathway
**Files:** `app/[locale]/page.tsx`, dictionaries

---

### 9. Add Agentic Coding Resources to Resources Tab

**Status:** DONE

**Clarification:** Agentic coding materials exist in the Past Programs section of the Activities page.

**Implementation:** Added quick link in Resources page sidebar under "Related resources":
- `app/[locale]/resources/page.tsx:241-271` - Added Link component
- `app/[locale]/dictionaries/en.json:636-640` - Added `agenticCoding` entry
- `app/[locale]/dictionaries/es.json:636-640` - Added Spanish translation

---

### 10. Research Page - Expression of Interest

**Status:** MISSING

**Current State** (`app/[locale]/research/page.tsx`):
- Research Pathway (lines 98-150)
- Focus Areas (lines 152-199)
- Publications (lines 201-259)
- Opportunities (lines 261-318)
- CTA with book-a-call links (lines 320-348)

**Missing:** Form/mechanism for expressing interest in research projects

**PDF Request:** "Have an expression of interest for taking part on either ongoing or future research projects"

**CAISH Reference:** Similar feature for joining research

**Implementation Options:**
1. Google Form embed
2. Airtable form
3. Custom form component
4. Simple mailto link with structured subject

**Files to modify:**
- `app/[locale]/research/page.tsx` - Add EOI section
- `app/[locale]/dictionaries/en.json` - Add `research.expressionOfInterest` section
- `app/[locale]/dictionaries/es.json` - Spanish translations

---

### 11. Future: Connect to Member Database

**Status:** FUTURE ITEM (not actionable now)

**PDF Note:** "Connect it to the database of members (for the future, when we do have said database with info of our members)"

**Action:** Document for future implementation when member database exists

---

## Summary Table

| # | Issue | Severity | Status | Primary File(s) |
|---|-------|----------|--------|-----------------|
| 1 | Hallucinated paper title | Critical | **DONE** | `app/utils/footnotes.tsx:36-43` |
| 2 | Missing paper (Austin) | Critical | **DONE** | `footnotes.tsx`, dictionaries, publications |
| 3 | Placeholder URL | Critical | **DONE** | All 3 papers now in publications |
| 4 | OpenPhil description | N/A | **RESOLVED** | Now "Coefficient Giving" |
| 5 | Workshop naming | Low | Already correct | N/A |
| 6 | Success Stories | High | **DONE** | `page.tsx`, dictionaries |
| 7 | About page order | Medium | **DONE** | `about/page.tsx` - team first |
| 8 | Landing page | High | **DONE** | New hero + Getting Started pathway |
| 9 | Agentic resources link | Medium | **DONE** | `resources/page.tsx` sidebar |
| 10 | Research EOI | Medium | **DONE** | `research/page.tsx` + form section |
| 11 | Member database | Future | N/A | Future work |

---

## Recommended Priority

### Immediate (Critical Errors):
1. Fix hallucinated paper title (#1)
2. Add missing paper (#2)
3. Fix placeholder URL (#3)

### Short-term (High Impact):
4. Landing page one-liner + getting started steps (#8a, #8f)
5. Add Success Stories section (#6)

### Medium-term (Structural):
8. Restructure About page (#7)
9. Add Research EOI form (#10)
10. Landing page visual pathway (#8b)

### Long-term (Content-heavy):
11. Club del Paper video showcase (#8d)
12. AISAR/FAIR partner section (#8e)
13. Member database integration (#11)
