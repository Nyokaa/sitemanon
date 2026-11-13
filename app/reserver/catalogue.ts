// Catalogue des prestations reservables en ligne.
//
// Recopie de la page Planity de Manon, qui fait foi pour les prix et les
// durees (releve du 11 novembre 2026). Planity n'ayant pas d'API, rien ne
// synchronise les deux : un prix change sur Planity doit etre change ici.
//
// Module PUR : aucune entree-sortie, testable sans rien monter.

export type CategorieId =
  | "mains"
  | "soins-mains"
  | "depose"
  | "pieds"
  | "epilation"
  | "regard";

export type Prestation = {
  id: string;
  categorie: CategorieId;
  nom: string;
  description: string;
  dureeMin: number;
  prixCents: number;
  /** Supplements proposes avec cette prestation. */
  options: string[];
  /**
   * Absente de la liste et muette pour le pixel : on n'y arrive que par son
   * adresse (/reserver/?prestation=...). Sert aux paiements d'essai.
   */
  cachee?: boolean;
};

export type Option = {
  id: string;
  nom: string;
  description: string;
  dureeMin: number;
  prixCents: number;
  /** Derniere date de rendez-vous (AAAA-MM-JJ, heure de Paris) ou l'option vaut. */
  jusquau?: string;
  /**
   * Grille affichee quand le prix depend du modele. L'option vaut alors
   * 0 en ligne : elle reserve le temps, le supplement se regle au studio.
   */
  grille?: string[];
};

export const CATEGORIES: { id: CategorieId; nom: string }[] = [
  { id: "mains", nom: "Mains" },
  { id: "soins-mains", nom: "Soins des mains et de l'ongle" },
  { id: "depose", nom: "Dépose" },
  { id: "pieds", nom: "Pieds" },
  { id: "epilation", nom: "Épilation" },
  { id: "regard", nom: "Beauté du regard" },
];

export const OPTIONS: Option[] = [
  {
    id: "cocooning",
    nom: "L'Instant Cocooning",
    description:
      "Gommage exfoliant et massage relaxant des mains. Offre de novembre.",
    dureeMin: 15,
    prixCents: 1000,
    jusquau: "2026-11-30",
  },
  {
    id: "manucure-profonde",
    nom: "Manucure profonde",
    description:
      "Préparation minutieuse des cuticules pour un contour parfaitement net.",
    dureeMin: 15,
    prixCents: 1000,
  },
  {
    id: "french",
    nom: "French",
    description: "Finition French sur votre pose.",
    dureeMin: 20,
    prixCents: 1000,
  },
  {
    id: "baby-boomer",
    nom: "Baby-boomer",
    description: "Dégradé baby-boomer sur votre pose.",
    dureeMin: 20,
    prixCents: 1000,
  },
  {
    // Repris de Planity : 15 minutes reservees, prix selon le modele.
    id: "nail-art",
    nom: "Nail art",
    description:
      "Le tarif dépend du temps et de la complexité : il se règle au studio. Décrivez votre idée dans le message, à l'étape des coordonnées.",
    dureeMin: 15,
    prixCents: 0,
    grille: [
      "Petit nail art réalisé en 10 minutes : +2 € par ongle",
      "3D simple : +2 € par élément",
      "3D complexe : +5 € par élément",
      "Stickers Disney ou créations similaires : à partir de 30 €",
      "Pour un nail art complexe ou long à réaliser, contactez-moi avant votre rendez-vous pour que je prévoie le temps nécessaire.",
    ],
  },
];

const POSE = ["cocooning", "manucure-profonde", "french", "baby-boomer", "nail-art"];

export const PRESTATIONS: Prestation[] = [
  {
    id: "diagnostic",
    categorie: "mains",
    nom: "Diagnostic ongulaire personnalisé",
    description:
      "Vous ne savez pas quelle prestation choisir ? On analyse vos ongles et vos attentes pour trouver la technique la plus adaptée.",
    dureeMin: 30,
    prixCents: 1000,
    options: [],
  },
  {
    id: "semi-permanent",
    categorie: "mains",
    nom: "Semi-permanent",
    description:
      "Préparation des ongles, soin des cuticules, base, couleur de votre choix et finition.",
    dureeMin: 90,
    prixCents: 7000,
    options: POSE,
  },
  {
    id: "gel-naturel",
    categorie: "mains",
    nom: "Gel sur ongles naturels",
    description:
      "Une structure en gel pour des ongles plus solides, avec un résultat naturel. Couleur de votre choix.",
    dureeMin: 90,
    prixCents: 9500,
    options: POSE,
  },
  {
    id: "gel-rallongement",
    categorie: "mains",
    nom: "Gel rallongement",
    description:
      "Gagner de la longueur ou corriger la forme de vos ongles, en gel. Couleur de votre choix.",
    dureeMin: 115,
    prixCents: 12500,
    options: POSE,
  },
  {
    id: "remplissage",
    categorie: "mains",
    nom: "Remplissage",
    description:
      "Pour entretenir une pose gel existante, y compris réalisée par une autre prothésiste si son état le permet.",
    dureeMin: 105,
    prixCents: 10500,
    options: POSE,
  },
  {
    id: "rituel-japonais",
    categorie: "soins-mains",
    nom: "Rituel japonais complet",
    description:
      "Manucure japonaise, gommage, massage et hydratation des mains. Vous repartez avec une mini-box et vos conseils.",
    dureeMin: 75,
    prixCents: 10000,
    // Gommage et massage sont deja compris : pas de Cocooning en option.
    options: [],
  },
  {
    id: "manucure-japonaise",
    categorie: "soins-mains",
    nom: "Manucure japonaise",
    description:
      "Nourrit, fortifie et redonne de l'éclat aux ongles naturels fragilisés ou après une dépose.",
    dureeMin: 60,
    prixCents: 7000,
    // Gommage et massage sont deja compris : pas de Cocooning en option.
    options: [],
  },
  {
    id: "depose-acrylique",
    categorie: "depose",
    nom: "Dépose acrylique, porcelaine, résine",
    description:
      "Retrait adapté à la matière, limage et durcisseur. Produit d'entretien offert (valeur 18 €).",
    dureeMin: 60,
    prixCents: 6800,
    options: [],
  },
  {
    id: "depose-gel",
    categorie: "depose",
    nom: "Dépose gel",
    description:
      "Retrait du gel, limage et durcisseur. Produit d'entretien offert (valeur 18 €).",
    dureeMin: 30,
    prixCents: 4800,
    options: [],
  },
  {
    id: "depose-semi",
    categorie: "depose",
    nom: "Dépose semi-permanent",
    description:
      "Retrait du vernis, limage et durcisseur. Produit d'entretien offert (valeur 18 €).",
    dureeMin: 20,
    prixCents: 3800,
    options: [],
  },
  {
    id: "pieds-semi",
    categorie: "pieds",
    nom: "Semi-permanent pieds",
    description:
      "Préparation des ongles, soin des cuticules et semi-permanent de la couleur de votre choix.",
    dureeMin: 75,
    prixCents: 5000,
    options: [],
  },
  {
    id: "pieds-signature-semi",
    categorie: "pieds",
    nom: "Soins signature + semi-permanent",
    description:
      "Soin complet des pieds (gommage, callosités, chaussons au gel vitaminé) suivi d'un semi-permanent.",
    dureeMin: 150,
    prixCents: 15000,
    options: [],
  },
  {
    id: "pieds-signature",
    categorie: "pieds",
    nom: "Soins signature",
    description:
      "Soin complet des pieds, sans vernis. Adapté aux talons fendillés et aux crevasses.",
    dureeMin: 105,
    prixCents: 12000,
    options: [],
  },
  {
    id: "pieds-depose",
    categorie: "pieds",
    nom: "Dépose pieds",
    description:
      "Retrait du semi-permanent, mise en forme, soin fortifiant et sérum nourrissant.",
    dureeMin: 20,
    prixCents: 2000,
    options: [],
  },
  {
    id: "epilation-sourcils",
    categorie: "epilation",
    nom: "Épilation sourcils",
    description: "Épilation et mise en forme des sourcils.",
    dureeMin: 15,
    prixCents: 1500,
    options: [],
  },
  {
    id: "epilation-visage",
    categorie: "epilation",
    nom: "Visage complet",
    description: "Sourcils, lèvres, menton, joues, narines et autres zones si besoin.",
    dureeMin: 60,
    prixCents: 5000,
    options: [],
  },
  {
    id: "epilation-levres",
    categorie: "epilation",
    nom: "Épilation lèvres",
    description: "Épilation de la lèvre supérieure.",
    dureeMin: 10,
    prixCents: 1200,
    options: [],
  },
  {
    id: "epilation-menton",
    categorie: "epilation",
    nom: "Épilation menton",
    description: "Épilation du menton.",
    dureeMin: 10,
    prixCents: 1200,
    options: [],
  },
  {
    id: "epilation-narines",
    categorie: "epilation",
    nom: "Épilation narines",
    description: "Épilation des narines.",
    dureeMin: 10,
    prixCents: 1000,
    options: [],
  },
  {
    id: "teinture",
    categorie: "regard",
    nom: "Teinture cils ou sourcils",
    description: "Teinture des cils ou des sourcils.",
    dureeMin: 20,
    prixCents: 2000,
    options: [],
  },
];

/**
 * Les prestations affichees : toutes sauf les cachees, a moins que la
 * cachee soit celle demandee par l'adresse.
 */
export function prestationsVisibles(choisie: string | null): Prestation[] {
  return PRESTATIONS.filter((p) => !p.cachee || p.id === choisie);
}

export function trouverPrestation(id: string): Prestation | undefined {
  return PRESTATIONS.find((p) => p.id === id);
}

/** Les options proposables pour une prestation a une date de rendez-vous. */
export function optionsDisponibles(
  prestation: Prestation,
  dateRdv: string | null
): Option[] {
  return prestation.options
    .map((id) => OPTIONS.find((o) => o.id === id))
    .filter((o): o is Option => Boolean(o))
    .filter((o) => !o.jusquau || dateRdv === null || dateRdv <= o.jusquau);
}

export type Panier = {
  prestation: Prestation;
  options: Option[];
  dureeMin: number;
  totalCents: number;
};

/**
 * Compose le panier. Une option inconnue ou non proposee pour cette
 * prestation est ecartee : un prix ne doit jamais venir d'une saisie libre.
 */
export function composerPanier(
  prestationId: string,
  optionIds: string[],
  dateRdv: string | null
): Panier | null {
  const prestation = trouverPrestation(prestationId);
  if (!prestation) return null;
  const permises = optionsDisponibles(prestation, dateRdv);
  const options = permises.filter((o) => optionIds.includes(o.id));
  return {
    prestation,
    options,
    dureeMin: prestation.dureeMin + options.reduce((s, o) => s + o.dureeMin, 0),
    totalCents:
      prestation.prixCents + options.reduce((s, o) => s + o.prixCents, 0),
  };
}

export function formaterPrix(cents: number): string {
  const euros = cents / 100;
  return Number.isInteger(euros)
    ? `${euros} €`
    : `${euros.toFixed(2).replace(".", ",")} €`;
}

export function formaterDuree(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
