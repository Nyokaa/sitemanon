import { SITE, SERVICES, FAQ } from "@/app/lib/site";

const SITE_URL = "https://manonjeanpert.com";
const GBP_CID = "7344988288056538738";
const GOOGLE_RATING = "5";
const GOOGLE_REVIEW_COUNT = "39";

export function JsonLd() {
  const business = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    description:
      "Prothésiste ongulaire à Lyon 6. Studio privé, diagnostic personnalisé, pose durable et hygiène irréprochable.",
    url: SITE_URL,
    telephone: SITE.phoneE164,
    image: `${SITE_URL}/og.jpg`,
    priceRange: "€10-€125",
    inLanguage: "fr-FR",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card",
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
    sameAs: [
      `https://maps.google.com/?cid=${GBP_CID}`,
      SITE.instagramUrl,
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: GOOGLE_RATING,
      reviewCount: GOOGLE_REVIEW_COUNT,
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Maria & Mélanie" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Manon est très professionnelle, agréable, bienveillante. Des produits de qualité, une hygiène irréprochable, le tout dans la bonne humeur — un vrai moment de détente qui fait du bien au cœur.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Cliente Google" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Manon est très agréable et fait surtout un très beau travail. Très soignée, le rendu est impeccable. Elle n'a pas hésité à m'arranger pour partir en vacances avec de jolies ongles malgré mes contraintes — c'est très sympa.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Cliente abonnée" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Très bonne professionnelle, elle m'a donné beaucoup de conseils et expliqué étape par étape. La santé de l'ongle passe avant tout — elle ne vous vendra jamais une prestation inutile. Mes ongles étaient en mauvais état, ils sont aujourd'hui solides. Je recommande à 100 %.",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations ongulaires",
      itemListElement: SERVICES.map((s) => {
        const numeric = parseInt(s.price.replace(/[^\d]/g, ""), 10);
        if (Number.isFinite(numeric) && numeric > 0) {
          return {
            "@type": "Offer",
            name: s.name,
            description: s.description,
            price: numeric,
            priceCurrency: "EUR",
          };
        }
        return {
          "@type": "Offer",
          name: s.name,
          description: s.description,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "EUR",
            valueAddedTaxIncluded: true,
          },
        };
      }),
    },
    areaServed: [
      { "@type": "City", name: "Lyon" },
      { "@type": "AdministrativeArea", name: "Lyon 6e arrondissement" },
    ],
    knowsAbout: [
      "Pose semi-permanente",
      "Gel sur ongles naturels",
      "Rallongement gel",
      "Manucure russe",
      "Nail art",
      "Diagnostic ongulaire",
      "Hygiène et désinfection en prothésie ongulaire",
    ],
  };

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#manon`,
    name: "Manon Jeanpert",
    givenName: "Manon",
    familyName: "Jeanpert",
    jobTitle: "Prothésiste ongulaire",
    description:
      "Prothésiste ongulaire à Lyon 6, fondatrice du studio Manon Jeanpert. Approche basée sur le diagnostic, manucure russe, gel et nail art sur-mesure.",
    image: `${SITE_URL}/images/portrait.jpeg`,
    url: `${SITE_URL}/`,
    worksFor: { "@id": `${SITE_URL}/#business` },
    knowsAbout: [
      "Pose semi-permanente",
      "Gel sur ongles naturels",
      "Manucure russe",
      "Nail art",
      "Rallongement gel",
      "Diagnostic ongulaire",
    ],
    knowsLanguage: "fr-FR",
    sameAs: [SITE.instagramUrl],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    inLanguage: "fr-FR",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
