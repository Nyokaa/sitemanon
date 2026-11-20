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

## Si l'autorisation échoue en erreur 500

Constaté le 11 novembre 2026 sur le compte de Manon : l'écran de
consentement de Google plante quand toutes les autorisations sont
demandées d'un coup, alors que chacune passe seule. Le remède est le
manifeste `appsscript.json` (Paramètres du projet, « Afficher le fichier
manifeste ») : on y ajoute une portée à la fois dans `oauthScopes`, en
lançant après chacune la fonction qui en a besoin.

1. `.../auth/calendar` puis `autoriserAgenda`
2. `.../auth/script.external_request` puis `autoriserInternet` (rend 200)
3. `.../auth/script.send_mail` puis `autoriserMail`
4. `.../auth/script.scriptapp` puis `installer`

La version complète du manifeste est dans ce dossier. Une nouvelle
autorisation s'applique au déploiement existant, mais un changement de
code demande une nouvelle version.

## Acompte et envoi à GA4 (version 2 du script)

Depuis le 20 novembre 2026 :

- **Acompte de 50 %** : le script lit `tauxAcompte` dans `/reserver/catalogue.json`
  et encaisse `arrondi(total × taux)`. Le prix total, l'acompte et le reste à
  régler au studio sont écrits dans l'événement de l'agenda et dans le mail.
- **Version annoncée** : chaque réponse porte `version: 2`. Le site n'affiche
  l'acompte que si le script en ligne est en version 2 ; avec l'ancien script,
  il garde l'affichage du paiement complet. Le montant annoncé est donc
  toujours celui réellement encaissé, quel que soit l'ordre de mise à jour.
- **GA4 côté serveur** : si la propriété `GA4_API_SECRET` existe et que le
  site a transmis le `client_id` et le `session_id` GA4 de la visiteuse (ce
  qu'il ne fait que si elle a accepté les cookies), le script envoie
  `begin_checkout` à la création du paiement, puis `booking_confirmed` et
  `purchase` une seule fois quand le paiement est confirmé, y compris par le
  ménage si la cliente a fermé l'onglet. Valeur = prix total, `acompte` en
  paramètre. Le site n'envoie alors plus ces événements lui-même.

### Créer la clé secrète GA4

GA4, **Admin**, **Flux de données**, flux du site, **Secrets de l'API Measurement
Protocol**, **Créer**. Copier la valeur dans les propriétés du script, sous le
nom `GA4_API_SECRET`. Sans cette propriété, rien ne part du serveur et le site
continue d'envoyer ces événements comme avant.

## Relances des réservations non finalisées (version 3 du script)

- Le site envoie la saisie de l'étape 3 (`action: relance`) dès qu'un
  téléphone ou un email valide est rempli, à la sortie du champ, puis à
  chaque complément, et la réservation porte le même identifiant.
- Le script garde chaque demande dans les propriétés du script
  (`relance_<id>`). Si aucun paiement n'est confirmé 30 minutes après la
  dernière saisie (ou à l'expiration de la session Stripe), le ménage envoie
  **un seul** mail à Manon et aux adresses de la propriété `RELANCE_MAILS`
  (séparées par des virgules). Une réservation confirmée efface la demande.
  Tout est supprimé au bout de 30 jours.
- Le site n'envoie rien à un script de version inférieure à 3, qui prendrait
  la saisie pour une vraie réservation.
- Ces données ne partent jamais vers GA4, Google Ads ni Meta.

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
