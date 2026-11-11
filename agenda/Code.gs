/**
 * Agenda de reservation de manonjeanpert.com
 *
 * Script Google Apps Script, deploye depuis le compte Google de Manon en
 * « application Web » (executer en tant que : moi, acces : tout le monde).
 * Il est le seul a toucher a son agenda : le site, statique, ne detient
 * aucun mot de passe ni jeton.
 *
 * Deux portes :
 *   GET  ?action=occupations&debut=ISO&fin=ISO
 *        rend les plages occupees, SANS leur titre ni leur contenu.
 *   POST (corps text/plain, JSON)
 *        cree le rendez-vous, apres avoir reverifie sous verrou que la
 *        plage est toujours libre.
 *
 * Le corps arrive en text/plain : un application/json declencherait un
 * preflight CORS que les applications Web Google ne savent pas servir.
 *
 * Planity n'a pas d'API : rien ici ne lit ni n'ecrit Planity. Un rendez-vous
 * pris la nuit se recopie a la main dans Planity, et le mail envoye a Manon
 * existe pour qu'elle le voie au reveil.
 */

// Identifiant de l'agenda. « primary » = l'agenda principal du compte.
var AGENDA_ID = 'primary';

// Adresse qui recoit un mail a chaque reservation. Vide = celle du compte.
var MAIL_MANON = '';

// Garde-fous sur ce que le site peut demander.
var HORIZON_JOURS = 62;
var DUREE_MAX_MIN = 4 * 60;

function agenda_() {
  return AGENDA_ID === 'primary'
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(AGENDA_ID);
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

/** Les plages occupees entre debut et fin, sans rien reveler d'autre. */
function occupations_(debut, fin) {
  return agenda_()
    .getEvents(debut, fin)
    .filter(function (e) {
      // Un evenement auquel Manon a repondu « non » ne bloque pas sa journee.
      var statut = e.getMyStatus && e.getMyStatus();
      return statut !== CalendarApp.GuestStatus.NO;
    })
    .map(function (e) {
      return {
        debut: e.getStartTime().toISOString(),
        fin: e.getEndTime().toISOString(),
      };
    });
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action !== 'occupations') return json_({ ok: false, erreur: 'action inconnue' });

  var debut = date_(p.debut);
  var fin = date_(p.fin);
  if (!debut || !fin || fin <= debut) return json_({ ok: false, erreur: 'periode invalide' });
  if (fin - debut > HORIZON_JOURS * 86400000) {
    return json_({ ok: false, erreur: 'periode trop longue' });
  }
  return json_({ ok: true, occupations: occupations_(debut, fin) });
}

function texte_(valeur, max) {
  return String(valeur == null ? '' : valeur).trim().slice(0, max);
}

function doPost(e) {
  var corps;
  try {
    corps = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, erreur: 'corps illisible' });
  }

  var debut = date_(corps.debut);
  var fin = date_(corps.fin);
  var prenom = texte_(corps.prenom, 80);
  var nom = texte_(corps.nom, 80);
  var email = texte_(corps.email, 160);
  var telephone = texte_(corps.telephone, 40);
  var prestation = texte_(corps.prestation, 160);
  var options = texte_(corps.options, 300);
  var total = texte_(corps.total, 20);
  var message = texte_(corps.message, 1000);

  if (!debut || !fin || fin <= debut) return json_({ ok: false, erreur: 'creneau invalide' });
  if (fin - debut > DUREE_MAX_MIN * 60000) return json_({ ok: false, erreur: 'creneau trop long' });
  if (debut.getTime() < Date.now()) return json_({ ok: false, erreur: 'creneau passe' });
  if (!prenom || !nom || !telephone || !prestation) {
    return json_({ ok: false, erreur: 'champ manquant' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json_({ ok: false, erreur: 'email invalide' });
  }

  // Deux clientes sur le meme creneau a la meme seconde : le verrou fait
  // passer la premiere, la seconde retrouve la plage occupee.
  var verrou = LockService.getScriptLock();
  if (!verrou.tryLock(15000)) return json_({ ok: false, erreur: 'agenda occupe, reessayez' });

  try {
    if (occupations_(debut, fin).length > 0) {
      return json_({ ok: false, raison: 'pris' });
    }

    var titre = 'À recopier sur Planity · ' + prestation + ' · ' + prenom + ' ' + nom;
    var description = [
      'Réservé en ligne sur manonjeanpert.com',
      '',
      'Prestation : ' + prestation,
      options ? 'Options : ' + options : '',
      'Total : ' + total,
      '',
      'Cliente : ' + prenom + ' ' + nom,
      'Téléphone : ' + telephone,
      'Email : ' + email,
      message ? '\nMessage :\n' + message : '',
    ]
      .filter(function (l) { return l !== ''; })
      .join('\n');

    var evenement = agenda_().createEvent(titre, debut, fin, { description: description });

    var quand = Utilities.formatDate(debut, 'Europe/Paris', "dd/MM/yyyy 'à' HH'h'mm");
    MailApp.sendEmail({
      to: MAIL_MANON || Session.getEffectiveUser().getEmail(),
      subject: 'Nouveau rendez-vous en ligne : ' + prenom + ' ' + nom + ', ' + quand,
      body:
        description +
        '\n\nPense à bloquer ce créneau sur Planity, puis à retirer « À recopier sur Planity » du titre dans ton agenda.',
    });

    return json_({ ok: true, id: evenement.getId() });
  } finally {
    verrou.releaseLock();
  }
}
