// Le catalogue publie en JSON, pour le script de l'agenda (agenda/Code.gs).
//
// C'est la seule source des prix : le script la relit pour calculer ce que
// Stripe encaisse, plutot que de croire le montant envoye par le navigateur.
// Un prix modifie dans catalogue.ts vaut donc partout des la publication.
import { OPTIONS, PRESTATIONS } from "../catalogue";

export const dynamic = "force-static";

export function GET() {
  return Response.json({ prestations: PRESTATIONS, options: OPTIONS });
}
