import { SITE, SERVICES } from "@/app/lib/site";

export function JsonLd() {
  const numericPrices = SERVICES.map((s) =>
    parseInt(s.price.replace(/[^\d]/g, ""), 10)
  ).filter((n) => Number.isFinite(n) && n > 0);
  const min = Math.min(...numericPrices);
  const max = Math.max(...numericPrices);

  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": "https://manonjeanpert.com/#business",
    name: SITE.name,
    description:
      "Prothésiste ongulaire à Lyon 6. Studio privé, diagnostic personnalisé, pose durable et hygiène irréprochable.",
    url: "https://manonjeanpert.com",
    telephone: SITE.phoneE164,
    image: "https://manonjeanpert.com/og.jpg",
    priceRange: `€${min}–€${max}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.address.latitude,
      longitude: SITE.address.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "10:00",
        closes: "13:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "15:00",
      },
    ],
    sameAs: [SITE.googleBusinessUrl, SITE.instagramUrl, SITE.facebookUrl],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations ongulaires",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        name: s.name,
        description: s.description,
        price: parseInt(s.price.replace(/[^\d]/g, ""), 10) || undefined,
        priceCurrency: "EUR",
      })),
    },
    areaServed: {
      "@type": "City",
      name: "Lyon",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
