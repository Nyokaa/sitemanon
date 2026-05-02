export const SITE = {
  name: "Manon Jeanpert",
  tagline: "Prothésiste ongulaire — Lyon 6",
  phone: "06 81 80 59 56",
  phoneE164: "+33681805956",
  email: "",
  address: {
    street: "12 avenue de Grande-Bretagne",
    postalCode: "69006",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "FR",
    latitude: 45.774,
    longitude: 4.852,
  },
  planityUrl:
    "https://www.planity.com/manon-jeanpert-prothesiste-ongulaire-69006-lyon",
  whatsappNumber: "33681805956",
  whatsappMessage: "Bonjour Manon, j'aurais une question avant de réserver.",
  googleBusinessUrl:
    "https://www.google.com/search?q=Manon+Jeanpert+Proth%C3%A9siste+ongulaire+Lyon+6",
  instagramUrl: "https://www.instagram.com/manonjeanpert/",
  facebookUrl: "https://www.facebook.com/",
  googleRating: 5,
  googleReviewCount: 39,
  googleReviewsUrl:
    "https://www.google.com/search?sca_esv=f746b67cbf3d13a5&q=Manon+Jeanpert+Proth%C3%A9siste+ongulaire+%C3%A0+Lyon+6+Avis&stick=H4sIAAAAAAAAAONgkxI2NzYxsbSwMLKwMDA1MzW2MDe22MDI-IrRwjcxLz9PwSs1Ma8gtahE4VHDZIWAovySjMMrizOLS1IV8vPSS3MSM4tSFQ4vUPCpBKo1U3AsyyxexEq2VgDdV8jkkAAAAA&rldimm=7344988288056538738&tbm=lcl",
  hours: [
    { day: "Lundi — Jeudi", time: "10h00 — 19h00" },
    { day: "Vendredi", time: "10h00 — 13h00" },
    { day: "Samedi", time: "10h00 — 15h00" },
    { day: "Dimanche", time: "Fermé" },
  ],
};

export const SERVICES = [
  {
    id: "diagnostic",
    name: "Diagnostic ongulaire",
    description:
      "Analyse personnalisée de vos ongles, mode de vie et envies, avant toute prestation. Le tarif est déduit de la pose réalisée ensuite.",
    duration: "30 min",
    price: "10 €",
    highlight: false,
  },
  {
    id: "semi",
    name: "Semi-permanent",
    description:
      "Pose semi-permanente sur ongles naturels, finition impeccable, tenue jusqu'à 4 semaines.",
    duration: "1 h 30",
    price: "70 €",
    highlight: true,
  },
  {
    id: "gel-naturel",
    name: "Gel sur ongles naturels",
    description:
      "Renforcement et sublimation de l'ongle naturel, sans ajout de longueur. Tenue 3 à 4 semaines.",
    duration: "1 h 30",
    price: "95 €",
    highlight: false,
  },
  {
    id: "remplissage",
    name: "Remplissage",
    description:
      "Entretien de votre pose existante toutes les 3 à 4 semaines, pour un résultat toujours net.",
    duration: "2 h",
    price: "105 €",
    highlight: true,
  },
  {
    id: "rallongement",
    name: "Gel rallongement",
    description:
      "Création d'une longueur sur-mesure, forme adaptée à votre main et à votre quotidien.",
    duration: "2 h 15",
    price: "125 €",
    highlight: false,
  },
  {
    id: "soins-signature",
    name: "Soins signature",
    description:
      "Soin complet adapté aux besoins de vos mains, alliant manucure russe et rituel signature.",
    duration: "1 h 15",
    price: "100 €",
    highlight: false,
  },
  {
    id: "supplement-soins",
    name: "Supplément soins signature",
    description:
      "Sublimez vos mains grâce à un soin complet mêlant manucure russe et rituel premium en complément d'une pose.",
    duration: "1 h",
    price: "Sur devis",
    highlight: false,
  },
  {
    id: "depose-gel",
    name: "Dépose gel",
    description: "Retrait soigné de la pose gel, dans le respect de l'ongle.",
    duration: "30 min",
    price: "30 €",
    highlight: false,
  },
  {
    id: "depose-semi",
    name: "Dépose semi-permanent",
    description: "Retrait du semi-permanent en douceur, sans abîmer l'ongle.",
    duration: "20 min",
    price: "20 €",
    highlight: false,
  },
];

export const FAQ = [
  {
    q: "Comment se déroule un premier rendez-vous ?",
    a: "On commence toujours par un diagnostic ongulaire (30 min, 10 € déduits de la prestation) : on parle de votre mode de vie, de vos contraintes et on choisit ensemble la technique la plus adaptée. Aucune pose standardisée — tout est sur-mesure.",
  },
  {
    q: "Combien de temps tient une pose ?",
    a: "Une pose semi-permanente tient jusqu'à 4 semaines. Les poses gel et rallongements tiennent 3 à 4 semaines, avec un remplissage recommandé toutes les 3 à 4 semaines pour entretenir le résultat.",
  },
  {
    q: "Faut-il déposer chez vous si j'ai déjà du gel ?",
    a: "Oui, si vous portez déjà du gel d'un autre professionnel, je préfère effectuer la dépose moi-même pour garantir la santé de l'ongle et la qualité de la nouvelle pose. Le tarif de dépose est précisé dans la grille des prestations.",
  },
  {
    q: "Où se trouve le studio ?",
    a: "Le studio est situé au 12 avenue de Grande-Bretagne, 69006 Lyon, à deux pas du Parc de la Tête d'Or. Accès facile en transports en commun et stationnement à proximité.",
  },
  {
    q: "Comment réserver ?",
    a: "La réservation se fait en ligne 24h/24 sur Planity ou par téléphone au 06 81 80 59 56.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Le studio accepte les paiements en espèces et par carte bancaire.",
  },
];

export const TRUST_PILLARS = [
  {
    title: "Diagnostic personnalisé",
    body: "Une pose pensée pour vos ongles, votre quotidien et votre style.",
  },
  {
    title: "Hygiène irréprochable",
    body: "Matériel stérilisé, protocole strict à chaque étape.",
  },
  {
    title: "Studio privé Lyon 6",
    body: "Un espace calme à deux pas du Parc de la Tête d'Or.",
  },
  {
    title: "Tenue durable",
    body: "Des poses qui durent, conçues pour respecter l'ongle naturel.",
  },
];
