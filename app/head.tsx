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
      <link rel="dns-prefetch" href="https://www.youtube.com" />
      <link rel="dns-prefetch" href="https://i.ytimg.com" />

      {/* Preconnect for critical third-party resources */}
      <link rel="preconnect" href="https://substackapi.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://baish.substack.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://lu.ma" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://luma.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.lu.ma" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />

      {/* Preconnect for Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  );
}
