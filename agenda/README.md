# Agenda de réservation

Le site est statique (GitHub Pages) : il ne peut garder aucun secret. La
lecture et l'écriture dans l'agenda Google de Manon passent donc par un
script Google Apps Script, `Code.gs`, qui tourne sous son compte.

## Mise en service, une seule fois

Depuis le compte Google de Manon :

1. Ouvrir <https://script.google.com>, puis « Nouveau projet ».
2. Remplacer le contenu de `Code.gs` par celui de ce dossier, enregistrer.
3. Si l'agenda à utiliser n'est pas l'agenda principal, renseigner son
   identifiant dans `AGENDA_ID` (Paramètres de l'agenda, « Intégrer
   l'agenda », « ID de l'agenda »).
4. « Déployer », « Nouveau déploiement », type « Application Web » :
   - Exécuter en tant que : **moi**
   - Qui a accès : **tout le monde**
5. Autoriser l'accès à l'agenda et à l'envoi de mails quand Google le demande.
6. Copier l'adresse qui se termine par `/exec` dans `AGENDA_URL`, fichier
   `app/reserver/config.ts`, puis publier le site.

Tant que `AGENDA_URL` est vide, la page `/reserver/` le dit et renvoie vers
Planity.

## Modifier le script ensuite

Une modification de `Code.gs` ne prend effet qu'après « Déployer »,
« Gérer les déploiements », crayon, version « Nouvelle version ». Garder le
même déploiement conserve la même adresse `/exec`.

## Ce que le script fait, et ne fait pas

- Il rend les plages occupées de l'agenda, **sans titre ni contenu**.
- Il crée le rendez-vous après avoir revérifié, sous verrou, que la plage
  est libre : deux clientes sur le même créneau, la seconde est refusée.
- Il envoie un mail à Manon à chaque réservation.
- Il ne touche **pas** à Planity, qui n'a pas d'API. Chaque rendez-vous est
  créé avec le titre « À recopier sur Planity » : c'est à Manon de bloquer
  le créneau là-bas, puis de retirer la mention. Un rendez-vous pris sur
  Planity doit symétriquement être reporté dans l'agenda Google, sans quoi
  le site le proposera encore.
