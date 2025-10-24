export default function Head() {
  return (
    <>
      {/*
        Preconnect for critical third-party origins (early connection setup)
        Chrome recommends max 4 preconnects - we use 2 for most critical resources
      */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />

      {/* DNS Prefetch for third-party domains (low cost, helps page navigation) */}
      <link rel="dns-prefetch" href="https://substackapi.com" />
      <link rel="dns-prefetch" href="https://baish.substack.com" />
      <link rel="dns-prefetch" href="https://substackcdn.com" />
      <link rel="dns-prefetch" href="https://lu.ma" />
      <link rel="dns-prefetch" href="https://cdn.lu.ma" />
      <link rel="dns-prefetch" href="https://airtable.com" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />
      <link rel="dns-prefetch" href="https://i.ytimg.com" />
    </>
  );
}
