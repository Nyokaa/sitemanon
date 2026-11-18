// Regles d'envoi des conversions de la page de remerciement. Module PUR,
// teste sans navigateur.

/**
 * Une session Stripe en mode test (cs_test_...) n'est pas une vente : elle
 * ne doit rien envoyer a GA4 ni a Meta, sans quoi un essai fausse le
 * chiffre d'affaires et l'apprentissage des campagnes. Constate le
 * 18 novembre 2026 : un purchase de 80 euros venu d'un test dans GA4.
 * On n'exige pas le prefixe cs_live_ : on n'exclut que ce qui est
 * explicitement un test, pour ne jamais perdre une vraie vente.
 */
export function estPaiementDeTest(session: string): boolean {
  return session.startsWith("cs_test_");
}
