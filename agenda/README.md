# Agenda et paiement de la réservation en ligne

Le site est statique (GitHub Pages) : il ne peut garder aucun secret. La
lecture et l'écriture dans l'agenda Google de Manon, et l'ouverture des
paiements Stripe, passent donc par un script Google Apps Script, `Code.gs`,
qui tourne sous son compte et garde la clé Stripe.

## Le parcours

1. La cliente choisit prestation, options et créneau sur `/reserver/`.
2. Le script recalcule prix et durée depuis `/reserver/catalogue.json`
   (jamais depuis ce que le navigateur envoie), **bloque le créneau** dans
   l'agenda sous le titre « En attente de paiement », puis ouvre un paiement
   Stripe valable 31 minutes.
3. Payé : Stripe renvoie sur `/reserver/merci/`, qui fait relire le paiement
   par le script. Le titre devient « À recopier sur Planity », Manon reçoit un
   mail, et le pixel envoie `Purchase`.
4. Abandonné : retour sur `/reserver/?annule=…`, le créneau est libéré tout
   de suite. Si la cliente ferme simplement l'onglet, le ménage le libère à
   l'expiration du paiement.

Il n'y a pas de webhook Stripe : une application Web Google ne donne pas
accès à la signature. Le script ne croit donc jamais qu'un paiement a eu
lieu : il le relit chez Stripe avec la clé secrète, à chaque fois.

## Mise en service, une seule fois

### Stripe

1. Créer le compte Stripe de Manon, avec l'IBAN où verser l'argent (son
   compte Revolut Pro convient).
2. Paramètres, Moyens de paiement : vérifier que carte, Apple Pay et Google
   Pay sont activés.
3. Paramètres, Emails clients : activer « Paiements réussis », sans quoi la
   cliente ne reçoit pas de reçu alors que la page de remerciement l'annonce.
4. Développeurs, Clés API : copier la **clé secrète** (`sk_live_…`). Elle ne
   va que dans le script Google, jamais dans le site ni dans ce dépôt.

### Script Google

Depuis le compte Google de Manon :

1. Ouvrir <https://script.google.com>, puis « Nouveau projet ».
2. Remplacer le contenu de `Code.gs` par celui de ce dossier, enregistrer.
3. Si l'agenda à utiliser n'est pas l'agenda principal, renseigner son
   identifiant dans `AGENDA_ID`.
4. Paramètres du projet (roue dentée), Propriétés du script : ajouter
   `STRIPE_SECRET` avec la clé secrète Stripe.
5. Choisir la fonction `installer` dans la barre du haut et cliquer
   « Exécuter » : cela pose le ménage toutes les dix minutes. Accepter les
   autorisations (agenda, mail, appels externes).
6. « Déployer », « Nouveau déploiement », type « Application Web » :
   exécuter en tant que **moi**, accès **tout le monde**.
7. Copier l'adresse qui se termine par `/exec` dans `AGENDA_URL`, fichier
   `app/reserver/config.ts`, puis publier le site.

Pour un premier essai sans argent réel, mettre une clé de test
(`sk_test_…`) et payer avec la carte `4242 4242 4242 4242`.

Tant que `AGENDA_URL` est vide, la page `/reserver/` le dit et renvoie vers
Planity.

## Modifier le script ensuite

Une modification de `Code.gs` ne prend effet qu'après « Déployer »,
« Gérer les déploiements », crayon, version « Nouvelle version ». Garder le
même déploiement conserve la même adresse `/exec`.

`agenda.test.ts` fait tourner le script dans Node avec un faux agenda et un
faux Stripe (`npm test`). Il vérifie notamment que le prix encaissé est
exactement celui affiché, pour toutes les combinaisons d'options.

## Changer un prix

Un seul endroit : `app/reserver/catalogue.ts`. Le script relit le catalogue
publié, avec dix minutes de cache. Planity n'ayant pas d'API, rien ne
synchronise ce fichier avec Planity : un prix changé là-bas doit l'être ici.

## Planity

Le script ne touche pas à Planity. Chaque rendez-vous payé arrive dans
l'agenda sous le titre « À recopier sur Planity » : Manon bloque le créneau
là-bas, puis retire la mention. Dans l'autre sens, un rendez-vous pris sur
Planity doit être reporté dans l'agenda Google, sans quoi le site le
proposera encore.
