// app/head.tsx
export default function Head() {
  const siteUrl = "https://htgstudio.site"; // <- update if different
  const title = "HTG Studio — Phone Performance Boosts & Courses";
  const description =
    "Boost your phone's performance with HTG Studio — practical, tested Android tweaks (non-root + root), tools and a hands-on masterclass.";
  const twitterHandle = "@htgstudio"; // replace if different
  const logo = `${siteUrl}/logo.png`; // ensure /public/logo.png exists
  const favicon = "/favicon.ico?v=7";

  return (
    <>
      <title>{title}</title>

      {/* Primary meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content="android, phone boost, phone performance, root tweaks, non-root tweaks, android optimization, battery, lag fix" />
      <meta name="author" content="HTG Studio" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="theme-color" content="#2563eb" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Canonical */}
      <link rel="canonical" href={siteUrl} />

      {/* Favicons */}
      <link rel="icon" href={favicon} />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="HTG Studio" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={logo} />
      <meta property="og:image:alt" content="HTG Studio logo" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={logo} />

      {/* Performance / Preconnects */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* If you use Google fonts, load them here (or in CSS) */}
      <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      <link rel="dns-prefetch" href="https://www.paypal.com" />


     

{/* Google Analytics */}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GMFTYPE28E"></script>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-GMFTYPE28E', { page_path: window.location.pathname });
    `,
  }}
/>







      {/* Small inline JSON-LD for Site & Organization (helps rich results) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "HTG Studio",
            url: siteUrl,
            logo,
            sameAs: [
              "https://t.me/htgstudio",
              // add other social links if available
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "",
                contactType: "customer support",
                email: "",
                areaServed: "Worldwide",
                availableLanguage: ["English"],
              },
            ],
          }),


        }}
      />
    </>
  );
}