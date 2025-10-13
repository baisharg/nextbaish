This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Performance & Monitoring

- The animated timeline background runs in a web worker when supported. Render quality is tuned dynamically: device pixel ratio is clamped between 1× and 1.8× and steps down if the worker reports sustained frame costs above ~8 ms. Glow effects are disabled under load and re-enabled only after several healthy samples.
- When OffscreenCanvas or workers are unavailable, the component falls back to a static low-motion gradient instead of executing the main-thread simulation. This keeps scroll and input responsive on Safari, Firefox ESR, and older mobile devices.
- Both the worker and main-thread implementations emit `CustomEvent("timelineThreads:stats", { detail: { avgPhysics, avgRender, avgTotal, fps, source } })`. Attach a listener (e.g. `window.addEventListener("timelineThreads:stats", handler)`) to push metrics into Vercel Speed Insights, datadog, or custom dashboards.
- For regression testing, profile with Chrome DevTools at multiple DPRs (1×, 1.5×, 2×) and verify that adaptive downgrades trigger before total frame cost exceeds the 8.3 ms budget required for 120 fps.
