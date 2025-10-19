export default function Head() {
  return (
    <>
      {/* DNS Prefetch for third-party domains */}
      <link rel="dns-prefetch" href="https://substackapi.com" />
      <link rel="dns-prefetch" href="https://baish.substack.com" />
      <link rel="dns-prefetch" href="https://substackcdn.com" />
      <link rel="dns-prefetch" href="https://lu.ma" />
      <link rel="dns-prefetch" href="https://cdn.lu.ma" />
      <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />

      {/* Preconnect for critical third-party resources */}
      <link rel="preconnect" href="https://substackapi.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://baish.substack.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://lu.ma" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.lu.ma" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
    </>
  );
}
