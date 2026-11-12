/**
 * Agenda et paiement de manonjeanpert.com
 *
 * Script Google Apps Script, deploye depuis le compte Google de Manon en
 * « application Web » (executer en tant que : moi, acces : tout le monde).
 * Le site est statique et ne detient aucun secret : la cle Stripe et
 * l'acces a l'agenda vivent ici seulement.
 *
 * Portes :
 *   GET  ?action=occupations&debut=ISO&fin=ISO
 *        les plages occupees, SANS titre ni contenu.
 *   POST (corps text/plain, JSON)
 *        bloque le creneau et ouvre un paiement Stripe ; rend son adresse.
 *   GET  ?action=confirmer&session=ID
 *        relit le paiement chez Stripe et confirme le rendez-vous s'il est paye.
 *   GET  ?action=annuler&session=ID
 *        la cliente a quitte le paiement : on libere le creneau.
 *
 * Et un declencheur horaire, menage(), qui libere les creneaux dont le
 * paiement n'a jamais abouti, et confirme ceux payes par une cliente qui a
 * ferme l'onglet avant de revenir sur le site.
 *
 * Pas de webhook Stripe : une application Web Google ne donne pas acces aux
 * en-tetes, donc pas a la signature. On ne croit donc jamais ce qu'on nous
 * dit d'un paiement : on le relit chez Stripe avec la cle secrete.
 *
 * Le corps arrive en text/plain : un application/json declencherait un
 * preflight CORS que les applications Web Google ne savent pas servir.
 *
 * Planity n'a pas d'API : rien ici ne lit ni n'ecrit Planity.
 */

// L'agenda ou s'ecrivent les rendez-vous pris en ligne (« Rdv Presta »).
// « primary » = l'agenda principal du compte.
var AGENDA_ID = 'c3e69f35faf05add3df4273aa5f2c875474fd215041fe869f43939814447aee4@group.calendar.google.com';

// Les agendas dont les evenements bloquent AUSSI un creneau, en plus de
// AGENDA_ID : un rendez-vous personnel de Manon ne doit pas pouvoir etre
// vendu. Un evenement « journee entiere » (des conges) bloque toute la
// journee. Les rendez-vous ne s'ecrivent jamais ici.
var AGENDAS_QUI_BLOQUENT = ['primary'];

// Adresse qui recoit un mail a chaque rendez-vous paye. Vide = celle du
// compte, lue dans l'identifiant de son agenda principal : c'est son adresse.
// On evite ainsi Session.getEffectiveUser(), dont l'autorisation (lire
// l'email du compte) est soupconnee de faire echouer le consentement (500).
var MAIL_MANON = '';

var SITE_URL = 'https://manonjeanpert.com';
var FUSEAU = 'Europe/Paris';
var HORIZON_JOURS = 62;

// Duree pendant laquelle un creneau reste bloque en attendant le paiement.
// Stripe impose au moins 30 minutes a une session de paiement.
var ATTENTE_PAIEMENT_MIN = 30;

var TAG_SESSION = 'stripe_session';
var TAG_STATUT = 'statut';
var PREFIXE_ATTENTE = 'En attente de paiement · ';
var PREFIXE_PAYE = 'À recopier sur Planity · ';

// ---------------------------------------------------------------- outils

function agendaParId_(id) {
  var a = id === 'primary' ? CalendarApp.getDefaultCalendar() : CalendarApp.getCalendarById(id);
  if (!a) throw new Error('agenda introuvable : ' + id);
  return a;
}

function agenda_() {
  return agendaParId_(AGENDA_ID);
}

function json_(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function date_(valeur) {
  var d = new Date(valeur);
  return isNaN(d.getTime()) ? null : d;
}

function texte_(valeur, max) {
  return String(valeur == null ? '' : valeur).trim().slice(0, max);
}

function prix_(cents) {
  var euros = cents / 100;
  return (euros % 1 === 0 ? String(euros) : euros.toFixed(2).replace('.', ',')) + ' €';
}

// ------------------------------------------------------------- catalogue

/** Le catalogue publie par le site, garde dix minutes en cache. */
function catalogue_() {
  var cache = CacheService.getScriptCache();
  var garde = cache.get('catalogue');
  if (garde) return JSON.parse(garde);
  var r = UrlFetchApp.fetch(SITE_URL + '/reserver/catalogue.json');
  var texte = r.getContentText();
  cache.put('catalogue', texte, 600);
  return JSON.parse(texte);
}

/**
 * Meme regle que composerPanier dans app/reserver/catalogue.ts, et un test
 * verifie qu'elles rendent la meme chose : le prix encaisse ne doit jamais
 * differer du prix affiche. Une option non proposee pour la prestation, ou
 * dont l'offre est passee a la date du rendez-vous, est ecartee.
 */
function panier_(catalogue, prestationId, optionIds, dateRdv) {
  var prestation = null;
  for (var i = 0; i < catalogue.prestations.length; i++) {
    if (catalogue.prestations[i].id === prestationId) prestation = catalogue.prestations[i];
  }
  if (!prestation) return null;
  var options = catalogue.options.filter(function (o) {
    return (
      prestation.options.indexOf(o.id) !== -1 &&
      (optionIds || []).indexOf(o.id) !== -1 &&
      (!o.jusquau || dateRdv === null || dateRdv <= o.jusquau)
    );
  });
  // L'ordre suit celui de la prestation, comme dans catalogue.ts.
  options.sort(function (a, b) {
    return prestation.options.indexOf(a.id) - prestation.options.indexOf(b.id);
  });
  var duree = prestation.dureeMin;
  var total = prestation.prixCents;
  options.forEach(function (o) {
    duree += o.dureeMin;
    total += o.prixCents;
  });
  return { prestation: prestation, options: options, dureeMin: duree, totalCents: total };
}

// ---------------------------------------------------------------- Stripe

function stripe_(methode, chemin, champs) {
  var cle = PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET');
  if (!cle) throw new Error('STRIPE_SECRET absent des proprietes du script');
  var options = {
    method: methode,
    headers: { Authorization: 'Bearer ' + cle },
    muteHttpExceptions: true,
  };
  if (champs) options.payload = champs;
  var r = UrlFetchApp.fetch('https://api.stripe.com/v1' + chemin, options);
  var corps = JSON.parse(r.getContentText());
  if (r.getResponseCode() >= 300) {
    throw new Error('Stripe ' + r.getResponseCode() + ' : ' + (corps.error && corps.error.message));
  }
  return corps;
}

// --------------------------------------------------------------- agenda

/** Les plages occupees entre debut et fin, sans rien reveler d'autre. */
function agendasLus_() {
  var ids = [AGENDA_ID];
  AGENDAS_QUI_BLOQUENT.forEach(function (id) {
    if (ids.indexOf(id) === -1) ids.push(id);
  });
  return ids;
}

/**
 * Les plages occupees pour l'affichage, en UNE requete free/busy.
 *
 * Lire les evenements un par un coutait un aller-retour chez Google par
 * evenement : 24 secondes pour les 62 jours de la page, mesure le
 * 11 novembre 2026. Free/busy rend tout d'un coup.
 *
 * Il faut le service avance « Google Calendar API » (Services, +). Absent,
 * on retombe sur la lecture exacte, lente mais juste.
 *
 * Free/busy suit la disponibilite de chaque evenement : un evenement marque
 * « Disponible » ne bloque pas, et une journee entiere est « Disponible »
 * par defaut dans Google Agenda. Des conges se posent donc en « Occupe ».
 */
function occupationsAffichees_(debut, fin) {
  if (typeof Calendar === 'undefined' || !Calendar.Freebusy) {
    return { plages: occupations_(debut, fin), source: 'evenements' };
  }
  var reponse = Calendar.Freebusy.query({
    timeMin: debut.toISOString(),
    timeMax: fin.toISOString(),
    items: agendasLus_().map(function (id) { return { id: id }; }),
  });
  var plages = [];
  Object.keys(reponse.calendars || {}).forEach(function (id) {
    var agenda = reponse.calendars[id];
    // Un agenda illisible ne doit pas passer pour un agenda vide : ce serait
    // proposer des creneaux qui ne sont pas libres.
    if (agenda.errors && agenda.errors.length) {
      throw new Error('free/busy ' + id + ' : ' + JSON.stringify(agenda.errors));
    }
    (agenda.busy || []).forEach(function (b) {
      plages.push({ debut: new Date(b.start).toISOString(), fin: new Date(b.end).toISOString() });
    });
  });
  return { plages: plages, source: 'freebusy' };
}

// ---------------------------------------------------------------- memoire
//
// Meme en une requete, interroger Google prend des secondes, et la page
// attendait jusqu'a 30 secondes (mesure le 12 novembre 2026). Le menage,
// qui tourne toutes les dix minutes, recalcule donc les disponibilites et
// les garde en memoire : une visiteuse lit la memoire, sans attendre Google.
//
// La memoire ne decide jamais d'une reservation : doPost relit l'agenda en
// direct, sous verrou. Au pire, un creneau que Manon vient de bloquer a la
// main reste affiche dix minutes, et sa reservation est refusee.

var CLE_MEMOIRE = 'occupations';
var MEMOIRE_SECONDES = 20 * 60;

function memoriser_() {
  var maintenant = new Date();
  var debut = new Date(maintenant.getTime() - 3600000);
  var fin = new Date(maintenant.getTime() + HORIZON_JOURS * 86400000);
  var lu = occupationsAffichees_(debut, fin);
  var memoire = {
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    source: lu.source,
    calculeLe: maintenant.toISOString(),
    plages: lu.plages,
  };
  CacheService.getScriptCache().put(CLE_MEMOIRE, JSON.stringify(memoire), MEMOIRE_SECONDES);
  return memoire;
}

function memoire_() {
  var texte = CacheService.getScriptCache().get(CLE_MEMOIRE);
  return texte ? JSON.parse(texte) : null;
}

/** Ajoute ou retire une plage de la memoire, sans attendre le prochain calcul. */
function retoucherMemoire_(debut, fin, ajouter) {
  var memoire = memoire_();
  if (!memoire) return;
  var d = debut.toISOString();
  var f = fin.toISOString();
  if (ajouter) {
    memoire.plages.push({ debut: d, fin: f });
  } else {
    memoire.plages = memoire.plages.filter(function (p) {
      return !(p.debut === d && p.fin === f);
    });
  }
  CacheService.getScriptCache().put(CLE_MEMOIRE, JSON.stringify(memoire), MEMOIRE_SECONDES);
}

/**
 * Les plages occupees, lues evenement par evenement. Lent sur une longue
 * periode, mais exact a la seconde : c'est la lecture qui decide, sous
 * verrou, si un creneau est encore libre au moment de reserver. Free/busy
 * peut tarder de quelques secondes sur un evenement tout juste cree.
 */
function occupations_(debut, fin) {
  var ids = agendasLus_();
  var evenements = [];
  ids.forEach(function (id) {
    evenements = evenements.concat(agendaParId_(id).getEvents(debut, fin));
  });
  return evenements
    .filter(function (e) {
      // Un evenement auquel Manon a repondu « non » ne bloque pas sa journee.
      var statut = e.getMyStatus && e.getMyStatus();
      return statut !== CalendarApp.GuestStatus.NO;
    })
    .map(function (e) {
      return { debut: e.getStartTime().toISOString(), fin: e.getEndTime().toISOString() };
    });
}

/** L'evenement qui porte cette session Stripe, ou null. */
function evenementDeSession_(session) {
  if (!session.metadata || !session.metadata.evenement) return null;
  var e = agenda_().getEventById(session.metadata.evenement);
  if (!e || e.getTag(TAG_SESSION) !== session.id) return null;
  return e;
}

/**
 * Passe un rendez-vous en paye. Idempotent : la page de remerciement et le
 * menage peuvent y arriver tous les deux, un seul mail part.
 */
function marquerPaye_(e, session) {
  if (e.getTag(TAG_STATUT) === 'paye') return;
  e.setTag(TAG_STATUT, 'paye');
  e.setTitle(PREFIXE_PAYE + e.getTitle().replace(PREFIXE_ATTENTE, ''));
  var paye = prix_(session.amount_total) + ' payé en ligne (Stripe ' + session.id + ')';
  e.setDescription(e.getDescription().replace('Paiement : en attente', 'Paiement : ' + paye));

  var quand = Utilities.formatDate(e.getStartTime(), FUSEAU, "dd/MM/yyyy 'à' HH'h'mm");
  MailApp.sendEmail({
    to: MAIL_MANON || CalendarApp.getDefaultCalendar().getId(),
    subject: 'Nouveau rendez-vous payé : ' + quand,
    body:
      e.getDescription() +
      '\n\nPense à bloquer ce créneau sur Planity, puis à retirer « À recopier sur Planity » du titre dans ton agenda.',
  });
}

/** Libere un creneau jamais paye. Ne touche jamais un rendez-vous paye. */
function liberer_(e) {
  if (e.getTag(TAG_STATUT) === 'paye') return false;
  var debut = e.getStartTime();
  var fin = e.getEndTime();
  e.deleteEvent();
  retoucherMemoire_(debut, fin, false);
  return true;
}

// ---------------------------------------------------------------- portes

function doGet(e) {
  var p = (e && e.parameter) || {};

  if (p.action === 'occupations') {
    var debut = date_(p.debut);
    var fin = date_(p.fin);
    if (!debut || !fin || fin <= debut) return json_({ ok: false, erreur: 'periode invalide' });
    if (fin - debut > HORIZON_JOURS * 86400000) {
      return json_({ ok: false, erreur: 'periode trop longue' });
    }
    var memoire = memoire_();
    var depuisMemoire = Boolean(memoire);
    if (!memoire || debut < new Date(memoire.debut) || fin > new Date(memoire.fin)) {
      memoire = memoriser_();
      depuisMemoire = false;
    }
    var plages = memoire.plages.filter(function (p) {
      return new Date(p.debut) < fin && debut < new Date(p.fin);
    });
    return json_({
      ok: true,
      occupations: plages,
      source: memoire.source,
      memoire: depuisMemoire,
      calculeLe: memoire.calculeLe,
    });
  }

  if (p.action === 'confirmer' || p.action === 'annuler') {
    var id = texte_(p.session, 200);
    if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json_({ ok: false, erreur: 'session invalide' });
    var session = stripe_('get', '/checkout/sessions/' + id);
    var verrou = LockService.getScriptLock();
    if (!verrou.tryLock(15000)) return json_({ ok: false, erreur: 'agenda occupe, reessayez' });
    try {
      var evenement = evenementDeSession_(session);
      if (p.action === 'confirmer') {
        if (session.payment_status !== 'paid') return json_({ ok: true, statut: 'non_paye' });
        if (evenement) marquerPaye_(evenement, session);
        return json_({
          ok: true,
          statut: 'paye',
          montantCents: session.amount_total,
          prestation: session.metadata.prestation,
          debut: session.metadata.debut,
          prenom: session.metadata.prenom,
        });
      }
      // annuler : on n'annule jamais un paiement abouti.
      if (session.payment_status === 'paid') return json_({ ok: true, statut: 'paye' });
      if (session.status === 'open') stripe_('post', '/checkout/sessions/' + id + '/expire');
      if (evenement) liberer_(evenement);
      return json_({ ok: true, statut: 'annule' });
    } finally {
      verrou.releaseLock();
    }
  }

  return json_({ ok: false, erreur: 'action inconnue' });
}

function doPost(e) {
  var corps;
  try {
    corps = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, erreur: 'corps illisible' });
  }

  var debut = date_(corps.debut);
  var prenom = texte_(corps.prenom, 80);
  var nom = texte_(corps.nom, 80);
  var email = texte_(corps.email, 160);
  var telephone = texte_(corps.telephone, 40);
  var message = texte_(corps.message, 1000);

  if (!debut) return json_({ ok: false, erreur: 'creneau invalide' });
  if (debut.getTime() < Date.now()) return json_({ ok: false, erreur: 'creneau passe' });
  if (debut.getTime() > Date.now() + HORIZON_JOURS * 86400000) {
    return json_({ ok: false, erreur: 'creneau trop lointain' });
  }
  if (!prenom || !nom || !telephone) return json_({ ok: false, erreur: 'champ manquant' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json_({ ok: false, erreur: 'email invalide' });
  }

  // Le prix et la duree se recalculent ici, depuis le catalogue publie :
  // le navigateur ne dit que ce qui a ete choisi, jamais ce que ca coute.
  var dateRdv = Utilities.formatDate(debut, FUSEAU, 'yyyy-MM-dd');
  var panier = panier_(catalogue_(), texte_(corps.prestationId, 80), corps.optionIds, dateRdv);
  if (!panier) return json_({ ok: false, erreur: 'prestation inconnue' });
  var fin = new Date(debut.getTime() + panier.dureeMin * 60000);
  var libelle =
    panier.prestation.nom +
    (panier.options.length
      ? ' + ' + panier.options.map(function (o) { return o.nom; }).join(', ')
      : '');

  // Deux clientes sur le meme creneau a la meme seconde : le verrou fait
  // passer la premiere, la seconde retrouve la plage occupee.
  var verrou = LockService.getScriptLock();
  if (!verrou.tryLock(15000)) return json_({ ok: false, erreur: 'agenda occupe, reessayez' });

  try {
    if (occupations_(debut, fin).length > 0) return json_({ ok: false, raison: 'pris' });

    var description = [
      'Réservé en ligne sur manonjeanpert.com',
      '',
      'Prestation : ' + libelle,
      'Total : ' + prix_(panier.totalCents),
      'Paiement : en attente',
      '',
      'Cliente : ' + prenom + ' ' + nom,
      'Téléphone : ' + telephone,
      'Email : ' + email,
      message ? '\nMessage :\n' + message : '',
    ]
      .filter(function (l) { return l !== ''; })
      .join('\n');

    // Le creneau est bloque AVANT le paiement : une seconde cliente ne peut
    // pas payer la meme place pendant que la premiere tape sa carte.
    var evenement = agenda_().createEvent(
      PREFIXE_ATTENTE + libelle + ' · ' + prenom + ' ' + nom,
      debut,
      fin,
      { description: description }
    );
    evenement.setTag(TAG_STATUT, 'attente');
    retoucherMemoire_(debut, fin, true);

    var session;
    try {
      session = stripe_('post', '/checkout/sessions', {
        mode: 'payment',
        locale: 'fr',
        customer_email: email,
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': String(panier.totalCents),
        'line_items[0][price_data][product_data][name]': libelle,
        'line_items[0][price_data][product_data][description]':
          'Rendez-vous le ' + Utilities.formatDate(debut, FUSEAU, "dd/MM/yyyy 'à' HH'h'mm"),
        expires_at: String(Math.floor(Date.now() / 1000) + (ATTENTE_PAIEMENT_MIN + 1) * 60),
        success_url: SITE_URL + '/reserver/merci/?session={CHECKOUT_SESSION_ID}',
        cancel_url: SITE_URL + '/reserver/?annule={CHECKOUT_SESSION_ID}',
        'metadata[evenement]': evenement.getId(),
        'metadata[prestation]': libelle,
        'metadata[debut]': debut.toISOString(),
        'metadata[prenom]': prenom,
      });
    } catch (err) {
      // Sans paiement ouvert, le creneau ne doit pas rester bloque.
      evenement.deleteEvent();
      retoucherMemoire_(debut, fin, false);
      console.error(err);
      return json_({ ok: false, erreur: 'paiement indisponible' });
    }

    evenement.setTag(TAG_SESSION, session.id);
    return json_({ ok: true, url: session.url, montantCents: panier.totalCents });
  } finally {
    verrou.releaseLock();
  }
}

// ---------------------------------------------------------------- menage

/**
 * A lancer par un declencheur horaire, toutes les 10 minutes. Pour chaque
 * creneau encore en attente, relit sa session chez Stripe :
 *   - payee : on confirme (la cliente a ferme l'onglet avant de revenir) ;
 *   - expiree : on libere le creneau.
 * Une session encore ouverte est laissee tranquille.
 */
function menage() {
  var maintenant = new Date();
  var evenements = agenda_().getEvents(
    new Date(maintenant.getTime() - 86400000),
    new Date(maintenant.getTime() + HORIZON_JOURS * 86400000)
  );
  evenements.forEach(function (e) {
    if (e.getTag(TAG_STATUT) !== 'attente') return;
    var id = e.getTag(TAG_SESSION);
    if (!id) {
      // Bloque sans session : le paiement n'a jamais ete ouvert.
      if (maintenant - e.getDateCreated() > 5 * 60000) e.deleteEvent();
      return;
    }
    try {
      var session = stripe_('get', '/checkout/sessions/' + id);
      if (session.payment_status === 'paid') marquerPaye_(e, session);
      else if (session.status === 'expired') liberer_(e);
    } catch (err) {
      // Un paiement illisible ne doit ni bloquer les autres, ni empecher la
      // memoire de se recalculer.
      console.error(err);
    }
  });
  // Recalculee a chaque passage : une visiteuse ne paie jamais le temps de
  // lecture de l'agenda.
  memoriser_();
}

/** A lancer une fois a la main : installe le declencheur du menage. */
function installer() {
  memoriser_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'menage') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('menage').timeBased().everyMinutes(10).create();
}

// ------------------------------------------------------- autorisations
//
// Le compte de Manon fait echouer l'ecran de consentement de Google (erreur
// 500) quand toutes les autorisations sont demandees d'un coup, alors que
// chacune passe seule. Ces fonctions servent a les accorder une par une,
// en ajoutant les portees au manifeste (appsscript.json) au fur et a mesure.

function autoriserAgenda() {
  Logger.log(agenda_().getName());
}

function autoriserInternet() {
  Logger.log(UrlFetchApp.fetch(SITE_URL + '/reserver/catalogue.json').getResponseCode());
}

function autoriserMail() {
  Logger.log(MailApp.getRemainingDailyQuota());
}
