# Repository Guidelines

## Project Structure & Module Organization
- Core application code lives under `app/`, using the Next.js App Router. `app/page.tsx` holds the landing view and `app/layout.tsx` wires shared fonts, metadata, and global styles.
- Global styles are centralized in `app/globals.css`, which imports Tailwind CSS v4 utilities and defines light/dark design tokens.
- Static assets (SVG icons and any future media) belong in `public/`, where Next.js serves them at the root URL.
- Configuration lives in `next.config.ts`, `postcss.config.mjs`, and `tsconfig.json`. Update these before introducing framework-level changes so they remain a single source of truth.

## Build, Test, and Development Commands
- `npm install` — install project dependencies for local work or CI setup.
- `npm run dev` — start the Turbopack-driven development server at `http://localhost:3000`, hot-reloading changes under `app/`.
- `npm run build` — produce an optimized production build; run this before deploying or validating breaking changes.
- `npm run start` — launch the production server using the artifacts built by `npm run build`.

## Coding Style & Naming Conventions
- TypeScript is required; keep `strict` mode happy by addressing type warnings instead of suppressing them.
- Use functional React components with PascalCase filenames (e.g., `HeroSection.tsx`) and colocate feature-specific styles/components inside folders under `app/`.
- Tailwind utility classes are preferred for styling; add custom tokens in `app/globals.css` when utilities fall short.
- Prettier/Tailwind formatting is recommended (run `npx prettier --write .` if unsure); keep indentation at two spaces for TSX/JSON.

## Testing Guidelines
- No automated test harness exists yet; when adding tests, prefer or Vitest for alignment with Next.js conventions.
- Place future tests alongside features (e.g., `app/(marketing)/Hero.test.tsx`) and name them after the unit under test.
- Ensure new features include coverage metrics or manual verification notes in the PR until formal tooling lands.

## Commit & Pull Request Guidelines
- Write present-tense, concise commit messages (`Add hero carousel animation`) grouped by logical change.
- Reference issue IDs in the commit body when relevant, and avoid bundling unrelated updates.
- PRs should summarize motivation, implementation notes, and testing evidence (manual steps, screenshots, or logs). Include deployment considerations if configuration files changed.
