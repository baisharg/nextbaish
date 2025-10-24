export default function Head() {
  return (
    <>
      {/* DNS Prefetch for third-party domains (low cost, helps page navigation) */}
      <link rel="dns-prefetch" href="https://substackapi.com" />
      <link rel="dns-prefetch" href="https://baish.substack.com" />
      <link rel="dns-prefetch" href="https://substackcdn.com" />
      <link rel="dns-prefetch" href="https://lu.ma" />
      <link rel="dns-prefetch" href="https://cdn.lu.ma" />
      <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />
      <link rel="dns-prefetch" href="https://i.ytimg.com" />

      {/*
        Preconnect only for critical resources used on homepage
        Chrome recommends max 4 preconnects - we use 1
        Other domains use DNS prefetch which is sufficient for lazy-loaded content
      */}
      <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
    </>
  );
}
