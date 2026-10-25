export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://hairbyoma.com/#organization",
    name: "HairbyOma",
    url: "https://hairbyoma.com/",
    logo: "https://hairbyoma.com/logo.png",
    description:
      "HairbyOma offers premium wigs, hair bundles and custom hair experiences in Nigeria.",
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    sameAs: [
      // Add your official social media profile URLs here.
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}