# Repository Guidelines

## Project Structure & Module Organization
Source lives in `app/`, using the App Router with feature folders (e.g., `app/(marketing)/`). `app/page.tsx` renders the landing view and `app/layout.tsx` wires fonts, metadata, and global providers. Tailwind tokens and resets sit in `app/globals.css`; keep component-specific styles colocated with the component. Static assets belong in `public/` and serve from the root path. Adjust framework-wide settings in `next.config.ts`, `postcss.config.mjs`, or `tsconfig.json` before shipping cross-cutting changes so configuration stays the single source of truth.

## Build, Test, and Development Commands
Run `npm install` to sync dependencies. `npm run dev` starts the Turbopack dev server at http://localhost:3000 with hot reload. `npm run build` compiles a production bundle; execute it locally before opening a PR that touches build paths. `npm run start` boots the optimized server from the last build. If you introduce tests, add a `npm run test` script that proxies to the chosen runner so CI can invoke it consistently.

## Coding Style & Naming Conventions
TypeScript strict mode must stay green—fix type errors instead of suppressing them. Prefer functional React components in PascalCase files (`HeroSection.tsx`) and colocate related utilities in the same folder. Compose Tailwind CSS v4 utilities first; extend design tokens in `app/globals.css` only when a reusable semantic token emerges. Keep indentation at two spaces for TSX/JSON and run `npx prettier --write .` plus `npx tailwindcss --minify` when formatting or validating styles.

## Testing Guidelines
No test script ships yet. When adding coverage, adopt Vitest + Testing Library for alignment with Next.js conventions, colocate specs beside the feature (`app/(marketing)/Hero.test.tsx`), and ensure they are fast enough for CI. Document manual verification steps in the PR description until automated checks exist. Failing tests or manual steps should block merges until resolved.

## Commit & Pull Request Guidelines
Write concise, present-tense commit subjects (`Add hero carousel animation`) and keep each commit focused on one concern. Reference issue IDs in the body when relevant. Pull requests should explain motivation, summarize implementation, list test evidence (commands, screenshots, or manual steps), and note deployment considerations if configuration or environment variables changed.

## Configuration & Security Tips
Store environment secrets outside the repo; prefer `.env.local` for developer-only values and avoid checking it in. When altering `next.config.ts` or Turbopack behavior, document the rationale in the PR to help reviewers gauge production impact. Validate third-party packages before adding them—dependency drift directly affects performance budgets and bundle size.
