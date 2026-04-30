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
  googleBusinessUrl:
    "https://www.google.com/search?q=Manon+Jeanpert+Proth%C3%A9siste+ongulaire+Lyon+6",
  instagramUrl: "https://www.instagram.com/",
  facebookUrl: "https://www.facebook.com/",
  hours: [
    { day: "Mardi", time: "9h30 — 19h00" },
    { day: "Mercredi", time: "9h30 — 19h00" },
    { day: "Jeudi", time: "9h30 — 19h00" },
    { day: "Vendredi", time: "9h30 — 19h00" },
    { day: "Samedi", time: "9h00 — 17h00" },
    { day: "Dimanche & Lundi", time: "Fermé" },
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
      "Pose semi-permanente sur ongles naturels, finition impeccable, tenue 2 à 3 semaines.",
    duration: "1 h 30",
    price: "70 €",
    highlight: false,
  },
  {
    id: "gel-naturel",
    name: "Gel sur ongles naturels",
    description:
      "Renforcement et sublimation de l'ongle naturel, sans ajout de longueur. Tenue 3 à 4 semaines.",
    duration: "1 h 30",
    price: "95 €",
    highlight: true,
  },
  {
    id: "remplissage",
    name: "Remplissage",
    description:
      "Entretien de votre pose existante toutes les 3 à 4 semaines, pour un résultat toujours net.",
    duration: "2 h",
    price: "105 €",
    highlight: false,
  },
  {
    id: "rallongement",
    name: "Gel rallongement",
    description:
      "Création d'une longueur sur-mesure, forme adaptée à votre main et à votre quotidien.",
    duration: "2 h 15",
    price: "125 €",
    highlight: true,
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
    a: "Le semi-permanent tient en moyenne 2 à 3 semaines. Le gel sur ongles naturels et le rallongement tiennent 3 à 4 semaines, avec un remplissage recommandé pour préserver la qualité.",
  },
  {
    q: "Faut-il déposer chez vous si j'ai déjà du gel ?",
    a: "Idéalement oui, pour évaluer l'état de l'ongle naturel. La dépose gel est facturée 30 €, le semi-permanent 20 €. Cela permet de repartir sur une base saine.",
  },
  {
    q: "Où se trouve le studio ?",
    a: "Au 12 avenue de Grande-Bretagne, Lyon 6, à deux pas du Parc de la Tête d'Or. Studio privé, calme, accessible facilement en transports.",
  },
  {
    q: "Comment réserver ?",
    a: "Toute la prise de rendez-vous se fait en ligne sur Planity, 24h/24. Vous voyez les créneaux disponibles en temps réel.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Espèces, carte bancaire et virement. L'acompte éventuel est précisé au moment de la réservation.",
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
