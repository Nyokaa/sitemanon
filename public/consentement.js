/*
 * Consentement cookies des pages HTML statiques (formation).
 *
 * Meme regle que le reste du site (app/components/Analytics.tsx) : le pixel
 * Meta ne se charge qu'apres « Accepter ». Le choix est lu et ecrit sous la
 * meme cle, mj-cookie-consent : accepter ou refuser sur le site principal vaut
 * ici aussi, et inversement.
 *
 * window.mjPixel(fn) execute fn(fbq) une fois le pixel charge, tout de suite
 * s'il l'est deja, plus tard si la visiteuse accepte sur cette page, jamais si
 * elle refuse.
 */
(function () {
  // Les seuls domaines ou le pixel se charge, comme DOMAINES_AUTORISES dans
  // app/lib/analytics.ts : sur localhost ou ailleurs, aucune balise.
  var DOMAINES = ['manonjeanpert.com', 'www.manonjeanpert.com'];
  var CLE = 'mj-cookie-consent';
  var PIXEL = '1635263904032770';
  var enAttente = [];
  var charge = false;

  function lire() {
    try {
      var v = window.localStorage.getItem(CLE);
      return v === 'accepted' || v === 'refused' ? v : null;
    } catch (e) {
      return null;
    }
  }

  function ecrire(v) {
    try {
      window.localStorage.setItem(CLE, v);
    } catch (e) {}
  }

  function chargerPixel() {
    if (charge) return;
    if (DOMAINES.indexOf(window.location.hostname) === -1) return;
    charge = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
    while (enAttente.length) enAttente.shift()(window.fbq);
  }

  window.mjPixel = function (fn) {
    if (charge) fn(window.fbq);
    else enAttente.push(fn);
  };

  function bouton(texte, plein) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = texte;
    b.style.cssText =
      'font:500 14px/1 "DM Sans",system-ui,sans-serif;padding:11px 20px;border-radius:999px;cursor:pointer;' +
      (plein
        ? 'background:#2B1A21;color:#F6EEEA;border:1px solid #2B1A21;'
        : 'background:transparent;color:#2B1A21;border:1px solid rgba(43,26,33,.35);');
    return b;
  }

  function banniere() {
    var a = document.createElement('aside');
    a.setAttribute('role', 'dialog');
    a.setAttribute('aria-labelledby', 'mj-cookie-titre');
    a.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:640px;margin:0 auto;' +
      'background:#F6EEEA;color:#2B1A21;border:1px solid #E2D2CC;border-radius:16px;padding:18px 20px;' +
      'box-shadow:0 25px 50px -15px rgba(43,26,33,.45);font:15px/1.5 "DM Sans",system-ui,sans-serif;';

    var t = document.createElement('p');
    t.id = 'mj-cookie-titre';
    t.textContent = 'Vos cookies, votre choix';
    t.style.cssText = 'margin:0;font:600 18px/1.2 "Cormorant Garamond",Georgia,serif;';

    var d = document.createElement('p');
    d.style.cssText = 'margin:8px 0 0;font-size:14px;color:#6E5A61;';
    d.appendChild(document.createTextNode(
      'Ce site utilise le pixel Meta pour mesurer l’efficacité de nos publicités Facebook et Instagram. ' +
      'Il ne se charge que si vous acceptez. '
    ));
    var l = document.createElement('a');
    l.href = '/mentions-legales/';
    l.textContent = 'En savoir plus';
    l.style.cssText = 'color:#7A2E4A;';
    d.appendChild(l);
    d.appendChild(document.createTextNode('.'));

    var actions = document.createElement('div');
    actions.style.cssText = 'margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;';
    var refuser = bouton('Refuser', false);
    var accepter = bouton('Accepter', true);
    refuser.addEventListener('click', function () {
      ecrire('refused');
      a.remove();
    });
    accepter.addEventListener('click', function () {
      ecrire('accepted');
      a.remove();
      chargerPixel();
    });
    actions.appendChild(refuser);
    actions.appendChild(accepter);

    a.appendChild(t);
    a.appendChild(d);
    a.appendChild(actions);
    document.body.appendChild(a);
  }

  var choix = lire();
  if (choix === 'accepted') {
    chargerPixel();
  } else if (choix === null) {
    if (document.body) banniere();
    else document.addEventListener('DOMContentLoaded', banniere);
  }
})();
