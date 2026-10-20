/* ==========================================================================
   sofatrend - Modul "Stoff im Raum"
   Haendler waehlen eine Stoffqualitaet und Farbe aus der Kollektion
   (window.SOFATREND_STOFFE) und sehen sie auf einem Sofa in einem
   stilisierten Wohnzimmer. Das Musterfoto wird als SVG-<pattern> gekachelt,
   Schatten und Polsterkanten entstehen ueber halbtransparente Overlays.

   Ziel-Element: <div id="stoffraum"></div>. Fehlt es, passiert nichts.
   Zustand im Hash: #qualitaet/farbe[/kissenqualitaet/kissenfarbe]
   z. B. #rebel/onyx-169 oder #rebel/onyx-169/glory/thyme-206
   ========================================================================== */

(function () {
  'use strict';

  /* Oberflaechentexte: Deutsch im Code, Englisch ueber diese Tabelle
     (aktiv wenn <html lang="en">) */
  var EN = {
    'Weiß': 'White', 'Greige': 'Greige', 'Salbei': 'Sage', 'Taupe': 'Taupe',
    'Taubenblau': 'Dove blue', 'Anthrazit': 'Anthracite', 'Hell': 'Light', 'Dunkel': 'Dark',
    'Zur Stoffkollektion': 'To the fabric collection',
    'Darstellung zur Orientierung. Polsterstoffe changieren und weichen chargenbedingt ab – verbindlich ist das Originalmuster.':
      'For orientation only. Upholstery fabrics shimmer and vary between batches – the original sample is binding.',
    'Bezug': 'Cover', 'Zierkissen': 'Scatter cushions', 'Stoff wählen für': 'Choose fabric for',
    'Sofa-Bezug': 'Sofa cover', 'Qualität': 'Quality', 'Farbe': 'Colour', 'Wie Bezug': 'Same as cover',
    'Wand': 'Wall', 'Boden': 'Floor', 'Wohnzimmer mit Sofa in ': 'Living room with sofa in ',
    'Farbe ': 'Colour ', ', Wand ': ', wall ', ', Boden ': ', floor ', ' Farben': ' colours'
  };
  function T(str) {
    return (document.documentElement.lang === 'en' && EN[str]) || str;
  }
  /* Bildpfade relativ zur Seite: unter /en/ liegen die Assets eine Ebene
     hoeher - abgeleitet vom Pfad des Stylesheets */
  var ASSETS = (function () {
    var l = document.querySelector('link[rel="stylesheet"][href*="site.css"]');
    return l ? l.getAttribute('href').split('assets/')[0] : '';
  })();

  var root = document.getElementById('stoffraum');
  if (!root) return;

  var STOFFE = (window.SOFATREND_STOFFE || []).filter(function (s) {
    return s && s.name && s.farben && s.farben.length;
  });
  if (!STOFFE.length) return;

  var IMG_STOFFE = ASSETS + 'assets/img/stoffe/';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var XLINK = 'http://www.w3.org/1999/xlink';

  /* Kantenlaenge einer Musterkachel in SVG-Einheiten. Das Sofa ist rund
     370 Einheiten breit; 40 Einheiten je Foto lassen Cord-Rippen und
     Webstruktur gerade noch erkennen, ohne grob zu wirken. */
  var KACHEL = 40;

  /* Feste, ruhige Wandtoene: Wand, dunklere Variante (Fensterrahmen, Sockel) */
  var WAENDE = [
    { name: T('Weiß'),       wand: '#f2efe9', dunkel: '#dcd6cc' },
    { name: T('Greige'),     wand: '#ddd4c7', dunkel: '#c7bcac' },
    { name: T('Salbei'),     wand: '#bcc4b1', dunkel: '#a5ae99' },
    { name: T('Taupe'),      wand: '#b8aa99', dunkel: '#a19281' },
    { name: T('Taubenblau'), wand: '#b4bec4', dunkel: '#9ca8af' },
    { name: T('Anthrazit'),  wand: '#4b4945', dunkel: '#5d5a55' }
  ];

  var BOEDEN = [
    { name: T('Hell'),   boden: '#d3b994', dunkel: '#b99c74', teppich: '#ece5da', teppichD: '#ddd3c4' },
    { name: T('Dunkel'), boden: '#6e5039', dunkel: '#553d2b', teppich: '#e4dccf', teppichD: '#d2c7b6' }
  ];

  var state = {
    q: 0, c: 0,          // Bezug: Index Qualitaet, Index Farbe
    kq: null, kc: null,  // Zierkissen; null = wie Bezug
    ziel: 'bezug',       // welche Flaeche die Auswahl gerade faerbt
    wand: 1,
    boden: 0
  };

  /* ---------------------------------------------------------------- Helfer */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(cls, text) {
    var b = el('button', cls, text);
    b.type = 'button';
    return b;
  }

  function farbSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function qSlug(s) { return s.name.toLowerCase(); }

  function bildUrl(s, farbe) {
    return IMG_STOFFE + qSlug(s) + '-' + farbSlug(farbe) + '.webp';
  }

  /* "Ribcord (Cordstoff)" -> "Ribcord" */
  function artKurz(s) {
    return ''; // Stoffart wird bewusst nicht angezeigt (nur Name und Farbe)
  }

  /* Anzeige bewusst ohne Lieferant und Preisgruppe, nur Name, Farbe, Stoffart */
  function stoffText(s, farbe) {
    var art = artKurz(s);
    return s.name + ' · ' + farbe + (art ? ' · ' + art : '');
  }

  function kollektionHref(s) { return 'stoffe.html#stoff-' + qSlug(s); }

  /* Beim Qualitaetswechsel moeglichst denselben Farbton behalten:
     erst exakter Name, dann gleiches erstes Wort ("Natural 01" ~ "Natural 001") */
  function passendeFarbe(s, farbe) {
    if (!farbe) return 0;
    var i, wort = farbe.toLowerCase().split(' ')[0];
    for (i = 0; i < s.farben.length; i++) if (s.farben[i] === farbe) return i;
    for (i = 0; i < s.farben.length; i++) {
      if (s.farben[i].toLowerCase().split(' ')[0] === wort) return i;
    }
    return 0;
  }

  function qBySlug(slug) {
    for (var i = 0; i < STOFFE.length; i++) if (qSlug(STOFFE[i]) === slug) return i;
    return -1;
  }

  function cBySlug(q, slug) {
    var f = STOFFE[q].farben;
    for (var i = 0; i < f.length; i++) if (farbSlug(f[i]) === slug) return i;
    return -1;
  }

  function kissenAktiv() { return state.kq !== null && state.kc !== null; }

  /* ------------------------------------------------------------ SVG-Szene */

  /* Ein Musterbild als 2x2-Kachel, gespiegelt: so treffen an den
     Kachelkanten immer gleiche Bildraender aufeinander und es entstehen
     keine sichtbaren Naehte. */
  function musterPattern(id, extra) {
    var t = KACHEL, t2 = KACHEL * 2;
    var img = '<image class="sr-musterbild" width="' + t + '" height="' + t +
              '" preserveAspectRatio="xMidYMid slice"';
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + t2 +
           '" height="' + t2 + '"' + (extra || '') + '>' +
           '<rect class="sr-mustergrund" width="' + t2 + '" height="' + t2 + '" fill="#8a8178"/>' +
           img + '/>' +
           img + ' transform="translate(' + t2 + ' 0) scale(-1 1)"/>' +
           img + ' transform="translate(0 ' + t2 + ') scale(1 -1)"/>' +
           img + ' transform="translate(' + t2 + ' ' + t2 + ') scale(-1 -1)"/>' +
           '</pattern>';
  }

  /* Ein gepolstertes Teil: Stofffuellung, Licht-/Schatten-Overlay, Kante */
  function polster(form, attrs, muster, overlays) {
    var s = '<' + form + ' ' + attrs + ' fill="url(#' + muster + ')"/>';
    overlays.forEach(function (o) {
      s += '<' + form + ' ' + attrs + ' fill="url(#' + o + ')"/>';
    });
    s += '<' + form + ' ' + attrs + ' class="sr-kante"/>';
    return s;
  }

  function rr(x, y, w, h, r) {
    return 'x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '"';
  }

  function kissenPfad(cx, cy) {
    var x0 = cx - 42, x1 = cx + 42, y0 = cy - 36, y1 = cy + 36;
    return 'd="M' + x0 + ' ' + y0 +
           ' Q' + cx + ' ' + (y0 - 9) + ' ' + x1 + ' ' + y0 +
           ' Q' + (x1 + 10) + ' ' + cy + ' ' + x1 + ' ' + y1 +
           ' Q' + cx + ' ' + (y1 + 9) + ' ' + x0 + ' ' + y1 +
           ' Q' + (x0 - 10) + ' ' + cy + ' ' + x0 + ' ' + y0 + ' Z"';
  }

  function szeneSvg() {
    var P = 'sr-p-sofa', PT = 'sr-p-sofa-sitz', PK = 'sr-p-kissen';
    var s = '';
    s += '<svg class="sr-svg" viewBox="0 0 800 520" xmlns="' + SVGNS + '" xmlns:xlink="' + XLINK +
         '" role="img" aria-labelledby="sr-svg-titel" focusable="false">';
    s += '<title id="sr-svg-titel">Wohnzimmer mit Sofa</title>';
    s += '<defs>';
    s += musterPattern(P);
    // Sitzflaeche leicht verkuerzt, wirkt wie von schraeg oben gesehen
    s += musterPattern(PT, ' patternTransform="scale(1 .62)"');
    s += musterPattern(PK);

    s += '<linearGradient id="sr-g-glas" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#dfeaf0"/><stop offset="1" stop-color="#f7fafb"/></linearGradient>';
    s += '<radialGradient id="sr-g-licht" cx=".5" cy=".5" r=".5">' +
         '<stop offset="0" stop-color="#ffd9a3" stop-opacity=".45"/>' +
         '<stop offset="1" stop-color="#ffd9a3" stop-opacity="0"/></radialGradient>';
    s += '<radialGradient id="sr-g-wand" cx=".55" cy=".35" r=".75">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".10"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".10"/></radialGradient>';
    s += '<radialGradient id="sr-g-bodenschatten" cx=".5" cy=".5" r=".5">' +
         '<stop offset="0" stop-color="#000" stop-opacity=".34"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';

    // Polster-Overlays: hell oben, dunkel unten bzw. zu den Raendern
    s += '<linearGradient id="sr-g-lehne" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".16"/>' +
         '<stop offset=".35" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>';
    s += '<linearGradient id="sr-g-ruecken" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".20"/>' +
         '<stop offset=".22" stop-color="#fff" stop-opacity=".06"/>' +
         '<stop offset=".6" stop-color="#000" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>';
    s += '<linearGradient id="sr-g-seiten" x1="0" y1="0" x2="1" y2="0">' +
         '<stop offset="0" stop-color="#000" stop-opacity=".16"/>' +
         '<stop offset=".18" stop-color="#000" stop-opacity="0"/>' +
         '<stop offset=".82" stop-color="#000" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>';
    s += '<linearGradient id="sr-g-sitz" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".22"/>' +
         '<stop offset=".30" stop-color="#fff" stop-opacity=".08"/>' +
         '<stop offset=".36" stop-color="#000" stop-opacity=".06"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient>';
    s += '<linearGradient id="sr-g-arm-l" x1="0" y1="0" x2="1" y2="0">' +
         '<stop offset="0" stop-color="#000" stop-opacity=".34"/>' +
         '<stop offset=".45" stop-color="#fff" stop-opacity=".12"/>' +
         '<stop offset=".8" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>';
    s += '<linearGradient id="sr-g-arm-r" x1="1" y1="0" x2="0" y2="0">' +
         '<stop offset="0" stop-color="#000" stop-opacity=".34"/>' +
         '<stop offset=".45" stop-color="#fff" stop-opacity=".12"/>' +
         '<stop offset=".8" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>';
    s += '<linearGradient id="sr-g-arm-v" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".16"/>' +
         '<stop offset=".25" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset=".7" stop-color="#000" stop-opacity=".04"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>';
    s += '<linearGradient id="sr-g-sockel" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#000" stop-opacity=".38"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>';
    s += '<radialGradient id="sr-g-kissen" cx=".42" cy=".38" r=".7">' +
         '<stop offset="0" stop-color="#fff" stop-opacity=".18"/>' +
         '<stop offset=".5" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset="1" stop-color="#000" stop-opacity=".40"/></radialGradient>';
    s += '<filter id="sr-f-weich" x="-20%" y="-60%" width="140%" height="220%">' +
         '<feGaussianBlur stdDeviation="4"/></filter>';
    s += '</defs>';

    // Wand und Boden
    s += '<rect class="sr-wand" x="0" y="0" width="800" height="370"/>';
    s += '<rect x="0" y="0" width="800" height="370" fill="url(#sr-g-wand)"/>';
    s += '<rect class="sr-boden" x="0" y="368" width="800" height="152"/>';
    s += '<g class="sr-dielen" stroke-width="2" opacity=".35">' +
         '<line x1="0" y1="396" x2="800" y2="396"/><line x1="0" y1="434" x2="800" y2="434"/>' +
         '<line x1="0" y1="478" x2="800" y2="478"/></g>';
    s += '<rect class="sr-sockel" x="0" y="358" width="800" height="12"/>';

    // Fenster mit Lichtfleck
    s += '<rect class="sr-wand-d" x="575" y="58" width="168" height="158" rx="6"/>';
    s += '<rect x="585" y="68" width="148" height="138" rx="3" fill="url(#sr-g-glas)"/>';
    s += '<g class="sr-sprossen" stroke-width="7"><line x1="659" y1="68" x2="659" y2="206"/>' +
         '<line x1="585" y1="137" x2="733" y2="137"/></g>';
    s += '<polygon points="560,370 800,370 800,470 480,470" fill="#fff" opacity=".10"/>';

    // Bild an der Wand
    s += '<rect x="82" y="72" width="136" height="104" rx="2" fill="#2f2a25"/>';
    s += '<rect x="90" y="80" width="120" height="88" fill="#f6f2ea"/>';
    s += '<rect x="104" y="92" width="92" height="64" fill="#e3d8c8"/>';
    s += '<circle cx="134" cy="124" r="18" fill="#c39a72"/>';
    s += '<rect x="152" y="110" width="34" height="38" rx="3" fill="#8e9a86"/>';

    // Teppich
    s += '<ellipse class="sr-teppich" cx="400" cy="454" rx="306" ry="58"/>';
    s += '<ellipse class="sr-teppich-d" cx="400" cy="454" rx="262" ry="45" opacity=".7"/>';
    s += '<ellipse class="sr-teppich" cx="400" cy="454" rx="216" ry="34"/>';

    // Pflanze
    s += '<g stroke="#3d5a39" stroke-width="3" fill="none">' +
         '<path d="M130 342 C 128 320 126 306 126 292"/>' +
         '<path d="M130 342 C 140 322 150 312 158 304"/>' +
         '<path d="M130 342 C 120 324 110 314 102 306"/></g>';
    s += '<ellipse cx="126" cy="286" rx="11" ry="27" fill="#55794c" transform="rotate(-4 126 286)"/>';
    s += '<ellipse cx="160" cy="300" rx="10" ry="24" fill="#55794c" transform="rotate(48 160 300)"/>';
    s += '<ellipse cx="100" cy="302" rx="10" ry="24" fill="#3d5a39" transform="rotate(-48 100 302)"/>';
    s += '<ellipse cx="146" cy="272" rx="9" ry="21" fill="#3d5a39" transform="rotate(26 146 272)"/>';
    s += '<ellipse cx="110" cy="274" rx="9" ry="21" fill="#55794c" transform="rotate(-26 110 274)"/>';
    s += '<ellipse cx="130" cy="396" rx="36" ry="6" fill="#000" opacity=".14"/>';
    s += '<path d="M100 340 H160 L152 394 H108 Z" fill="#b9ab98"/>';
    s += '<rect x="96" y="334" width="68" height="13" rx="4" fill="#cbbfae"/>';

    // Beistelltisch mit Lampe
    s += '<circle cx="690" cy="296" r="80" fill="url(#sr-g-licht)"/>';
    s += '<ellipse cx="690" cy="398" rx="58" ry="6" fill="#000" opacity=".14"/>';
    s += '<rect x="644" y="348" width="9" height="48" rx="4" fill="#4f392a"/>';
    s += '<rect x="727" y="348" width="9" height="48" rx="4" fill="#4f392a"/>';
    s += '<rect x="634" y="336" width="112" height="13" rx="6" fill="#6b4c35"/>';
    s += '<rect x="682" y="312" width="16" height="26" rx="4" fill="#a7844f"/>';
    s += '<path d="M664 312 H716 L706 274 H674 Z" fill="#efe5d3"/>';

    // Sofa: Bodenschatten
    s += '<ellipse cx="400" cy="404" rx="236" ry="18" fill="url(#sr-g-bodenschatten)"/>';

    // Fuesse
    s += '<g fill="#3b2b20">' +
         '<path d="M214 388 h14 l-3 20 h-8 Z"/><path d="M572 388 h14 l-3 20 h-8 Z"/>' +
         '<path d="M262 388 h10 l-2 14 h-6 Z" opacity=".75"/>' +
         '<path d="M528 388 h10 l-2 14 h-6 Z" opacity=".75"/></g>';

    s += '<g class="sr-sofa">';
    // Rueckenlehne (Korpus)
    s += polster('rect', rr(216, 226, 368, 132, 22), P, ['sr-g-lehne', 'sr-g-seiten']);
    // Rueckenkissen
    s += polster('rect', rr(246, 238, 152, 100, 20), P, ['sr-g-ruecken', 'sr-g-seiten']);
    s += polster('rect', rr(402, 238, 152, 100, 20), P, ['sr-g-ruecken', 'sr-g-seiten']);
    s += '<path class="sr-glanz" d="M266 245 H378 M422 245 H534"/>';
    // Schlagschatten der Rueckenkissen auf der Sitzflaeche
    s += '<rect x="246" y="322" width="308" height="16" rx="8" fill="#000" opacity=".32" filter="url(#sr-f-weich)"/>';
    // Sockel
    s += polster('rect', rr(234, 370, 332, 22, 8), P, ['sr-g-sockel']);
    // Sitzkissen
    s += polster('rect', rr(240, 324, 161, 58, 14), PT, ['sr-g-sitz', 'sr-g-seiten']);
    s += polster('rect', rr(399, 324, 161, 58, 14), PT, ['sr-g-sitz', 'sr-g-seiten']);
    // Keder an der Vorderkante der Sitzkissen
    s += '<path class="sr-keder-d" d="M252 343 H389 M411 343 H548"/>';
    s += '<path class="sr-keder-h" d="M252 341.5 H389 M411 341.5 H548"/>';
    // Armlehnen
    s += polster('rect', rr(192, 276, 64, 118, 24), P, ['sr-g-arm-l', 'sr-g-arm-v']);
    s += polster('rect', rr(544, 276, 64, 118, 24), P, ['sr-g-arm-r', 'sr-g-arm-v']);
    s += '<path class="sr-glanz" d="M206 284 Q224 279 242 284 M558 284 Q576 279 594 284"/>';
    s += '</g>';

    // Zierkissen (eigener Stoff waehlbar). Das Muster liegt im gedrehten
    // Koordinatensystem und dreht darum mit.
    s += '<g class="sr-kissen">';
    s += '<g transform="rotate(-9 304 300)">' +
         '<ellipse cx="306" cy="342" rx="40" ry="5" fill="#000" opacity=".22" filter="url(#sr-f-weich)"/>' +
         polster('path', kissenPfad(304, 300), PK, ['sr-g-kissen']) +
         '<path class="sr-falte" d="M270 268 Q290 286 286 300 M338 332 Q318 316 322 300"/></g>';
    s += '<g transform="rotate(8 496 300)">' +
         '<ellipse cx="494" cy="342" rx="40" ry="5" fill="#000" opacity=".22" filter="url(#sr-f-weich)"/>' +
         polster('path', kissenPfad(496, 300), PK, ['sr-g-kissen']) +
         '<path class="sr-falte" d="M530 268 Q510 286 514 300 M462 332 Q482 316 478 300"/></g>';
    s += '</g>';

    s += '</svg>';
    return s;
  }

  /* --------------------------------------------------------- Oberflaeche */

  var ui = {};
  var gezeigteQ = -1;      // Qualitaet, deren Farbkacheln gerade aufgebaut sind
  var musterToken = {};    // verhindert, dass ein spaet geladenes Bild ein neueres ueberschreibt

  function gruppe(titel, id) {
    var g = el('div', 'sr-group');
    g.setAttribute('role', 'group');
    var h = el('p', 'sr-group__title', titel);
    h.id = id;
    g.setAttribute('aria-labelledby', id);
    g.appendChild(h);
    return g;
  }

  function infoZeile(label) {
    var z = el('div', 'sr-info__row');
    z.appendChild(el('p', 'sr-info__label', label));
    var name = el('p', 'sr-info__name');
    z.appendChild(name);
    var akt = el('div', 'sr-info__actions');
    var link = el('a', 'sr-link', T('Zur Stoffkollektion'));
    akt.appendChild(link);
    z.appendChild(akt);
    return { row: z, name: name, link: link };
  }

  function aufbauen() {
    var wrap = el('div', 'sr');

    /* Raum und Angaben */
    var stage = el('div', 'sr-stage');
    var fig = el('figure', 'sr-room');
    fig.innerHTML = szeneSvg();
    var cap = el('figcaption', 'sr-hint',
      T('Darstellung zur Orientierung. Polsterstoffe changieren und weichen chargenbedingt ab – verbindlich ist das Originalmuster.'));
    fig.appendChild(cap);
    stage.appendChild(fig);

    var info = el('div', 'sr-info');
    info.setAttribute('aria-live', 'polite');
    ui.bezug = infoZeile(T('Bezug'));
    ui.kissen = infoZeile(T('Zierkissen'));
    info.appendChild(ui.bezug.row);
    info.appendChild(ui.kissen.row);
    stage.appendChild(info);

    /* Auswahl */
    var panel = el('div', 'sr-panel');

    var gZiel = gruppe(T('Stoff wählen für'), 'sr-t-ziel');
    var ziele = el('div', 'sr-seg');
    ui.zielBtns = [['bezug', T('Sofa-Bezug')], ['kissen', T('Zierkissen')]].map(function (z) {
      var b = button('sr-seg__btn', z[1]);
      b.setAttribute('data-ziel', z[0]);
      b.addEventListener('click', function () {
        state.ziel = z[0];
        render();
      });
      ziele.appendChild(b);
      return b;
    });
    gZiel.appendChild(ziele);
    panel.appendChild(gZiel);

    var gQ = gruppe(T('Qualität'), 'sr-t-qual');
    var qGrid = el('div', 'sr-quals');
    ui.qBtns = STOFFE.map(function (s, i) {
      var b = button('sr-qual', s.name);
      b.addEventListener('click', function () { waehleQualitaet(i); });
      qGrid.appendChild(b);
      return b;
    });
    gQ.appendChild(qGrid);
    panel.appendChild(gQ);

    var gF = gruppe(T('Farbe'), 'sr-t-farbe');
    ui.farbTitel = gF.querySelector('.sr-group__title');
    ui.wieBezug = button('sr-chip sr-wie-bezug', T('Wie Bezug'));
    ui.wieBezug.addEventListener('click', function () {
      state.kq = state.kc = null;
      render(true);
    });
    gF.appendChild(ui.wieBezug);
    ui.farben = el('div', 'sr-swatches');
    gF.appendChild(ui.farben);
    panel.appendChild(gF);

    var gW = gruppe(T('Wand'), 'sr-t-wand');
    var wChips = el('div', 'sr-chips');
    ui.wandBtns = WAENDE.map(function (w, i) {
      var b = button('sr-chip');
      var dot = el('span', 'sr-chip__dot');
      dot.style.background = w.wand;
      dot.setAttribute('aria-hidden', 'true');
      b.appendChild(dot);
      b.appendChild(document.createTextNode(w.name));
      b.addEventListener('click', function () { state.wand = i; render(); });
      wChips.appendChild(b);
      return b;
    });
    gW.appendChild(wChips);
    panel.appendChild(gW);

    var gB = gruppe(T('Boden'), 'sr-t-boden');
    var bChips = el('div', 'sr-chips');
    ui.bodenBtns = BOEDEN.map(function (bd, i) {
      var b = button('sr-chip');
      var dot = el('span', 'sr-chip__dot');
      dot.style.background = bd.boden;
      dot.setAttribute('aria-hidden', 'true');
      b.appendChild(dot);
      b.appendChild(document.createTextNode(bd.name));
      b.addEventListener('click', function () { state.boden = i; render(); });
      bChips.appendChild(b);
      return b;
    });
    gB.appendChild(bChips);
    panel.appendChild(gB);

    wrap.appendChild(stage);
    wrap.appendChild(panel);
    root.appendChild(wrap);

    ui.wrap = wrap;
    ui.svg = fig.querySelector('svg');
    ui.svgTitel = fig.querySelector('#sr-svg-titel');
  }

  /* Farbkacheln der gerade gezeigten Qualitaet (nur bei Wechsel neu) */
  function farbKacheln(q) {
    if (gezeigteQ === q) return;
    gezeigteQ = q;
    var s = STOFFE[q];
    ui.farben.innerHTML = '';
    ui.farbBtns = s.farben.map(function (f, i) {
      var b = button('sr-swatch');
      b.setAttribute('aria-label', s.name + ' ' + f);
      b.title = f;
      var img = el('img');
      img.src = bildUrl(s, f);
      img.alt = '';
      img.width = 64;
      img.height = 64;
      img.loading = 'lazy';
      img.decoding = 'async';
      b.appendChild(img);
      b.addEventListener('click', function () { waehleFarbe(q, i); });
      ui.farben.appendChild(b);
      return b;
    });
  }

  /* ------------------------------------------------------------ Auswahl */

  function waehleQualitaet(q) {
    if (state.ziel === 'kissen') {
      var vorher = kissenAktiv() ? STOFFE[state.kq].farben[state.kc]
                                 : STOFFE[state.q].farben[state.c];
      state.kq = q;
      state.kc = passendeFarbe(STOFFE[q], vorher);
    } else {
      var alt = STOFFE[state.q].farben[state.c];
      state.q = q;
      state.c = passendeFarbe(STOFFE[q], alt);
    }
    render(true);
  }

  function waehleFarbe(q, c) {
    if (state.ziel === 'kissen') {
      state.kq = q;
      state.kc = c;
    } else {
      state.q = q;
      state.c = c;
    }
    render(true);
  }

  /* ------------------------------------------------------------- Muster */

  function setzeHref(node, url) {
    node.setAttribute('href', url);
    node.setAttributeNS(XLINK, 'xlink:href', url);
  }

  /* Mittlere Farbe des Musters als Grund unter der Kachel (sichtbar, solange
     das Bild laedt). Bei file:// oder fremder Herkunft schlaegt das fehl -
     dann bleibt der neutrale Grund. */
  function mittelFarbe(img) {
    try {
      var cv = document.createElement('canvas');
      cv.width = cv.height = 12;
      var cx = cv.getContext('2d');
      cx.drawImage(img, 0, 0, 12, 12);
      var d = cx.getImageData(0, 0, 12, 12).data, r = 0, g = 0, b = 0, n = d.length / 4;
      for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      return 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
    } catch (e) { return null; }
  }

  /* Neues Bild erst vorladen und dann tauschen, damit das Sofa nie leer ist */
  function setzeMuster(ids, url) {
    var key = ids.join(',');
    if (musterToken[key] === url) return;
    musterToken[key] = url;
    var pre = new Image();
    var fertig = function (ok) {
      if (musterToken[key] !== url) return;
      var grund = ok ? mittelFarbe(pre) : null;
      ids.forEach(function (id) {
        var p = ui.svg.querySelector('#' + id);
        if (!p) return;
        Array.prototype.forEach.call(p.querySelectorAll('.sr-musterbild'), function (im) {
          setzeHref(im, url);
        });
        if (grund) p.querySelector('.sr-mustergrund').setAttribute('fill', grund);
      });
    };
    pre.onload = function () { fertig(true); };
    pre.onerror = function () { fertig(false); };
    pre.src = url;
  }

  /* ------------------------------------------------------------ Hash */

  var hashSchreiben = false;

  function hashText() {
    var s = STOFFE[state.q];
    var h = qSlug(s) + '/' + farbSlug(s.farben[state.c]);
    if (kissenAktiv()) {
      var k = STOFFE[state.kq];
      h += '/' + qSlug(k) + '/' + farbSlug(k.farben[state.kc]);
    }
    return '#' + h;
  }

  function hashSpiegeln() {
    var h = hashText();
    if (location.hash === h) return;
    if (window.history && history.replaceState) {
      history.replaceState(history.state, '', h);
    } else {
      hashSchreiben = true;
      location.replace(h);
    }
  }

  /* Liefert true, wenn der Hash einen gueltigen Zustand enthielt */
  function hashLesen() {
    var raw = (location.hash || '').replace(/^#/, '');
    try { raw = decodeURIComponent(raw); } catch (e) { return false; }
    var t = raw.toLowerCase().split('/');
    if (t.length < 2) return false;
    var q = qBySlug(t[0]);
    if (q < 0) return false;
    var c = cBySlug(q, t[1]);
    if (c < 0) c = 0;
    state.q = q;
    state.c = c;
    state.kq = state.kc = null;
    if (t.length >= 4) {
      var kq = qBySlug(t[2]);
      var kc = kq < 0 ? -1 : cBySlug(kq, t[3]);
      if (kq >= 0 && kc >= 0) { state.kq = kq; state.kc = kc; }
    }
    return true;
  }

  /* ------------------------------------------------------------ Render */

  function gedrueckt(b, on) { b.setAttribute('aria-pressed', String(!!on)); }

  function render(nachAuswahl) {
    var s = STOFFE[state.q], farbe = s.farben[state.c];
    var kissen = kissenAktiv();
    var ks = kissen ? STOFFE[state.kq] : s;
    var kf = kissen ? ks.farben[state.kc] : farbe;
    var imKissen = state.ziel === 'kissen';

    // Raumfarben ueber CSS-Variablen
    var w = WAENDE[state.wand], bd = BOEDEN[state.boden];
    var st = ui.wrap.style;
    st.setProperty('--sr-wand', w.wand);
    st.setProperty('--sr-wand-d', w.dunkel);
    st.setProperty('--sr-boden', bd.boden);
    st.setProperty('--sr-boden-d', bd.dunkel);
    st.setProperty('--sr-teppich', bd.teppich);
    st.setProperty('--sr-teppich-d', bd.teppichD);

    // Stoffe
    setzeMuster(['sr-p-sofa', 'sr-p-sofa-sitz'], bildUrl(s, farbe));
    setzeMuster(['sr-p-kissen'], bildUrl(ks, kf));

    ui.svgTitel.textContent = T('Wohnzimmer mit Sofa in ') + s.name + ' ' + farbe +
      (kissen ? ', Zierkissen in ' + ks.name + ' ' + kf : '') +
      T(', Wand ') + w.name + T(', Boden ') + bd.name.toLowerCase();

    // Bedienelemente
    ui.zielBtns.forEach(function (b) { gedrueckt(b, b.getAttribute('data-ziel') === state.ziel); });

    var zeigQ = imKissen ? (kissen ? state.kq : state.q) : state.q;
    var zeigC = imKissen ? (kissen ? state.kc : -1) : state.c;
    var qAktiv = !imKissen || kissen;
    ui.qBtns.forEach(function (b, i) { gedrueckt(b, qAktiv && i === zeigQ); });

    farbKacheln(zeigQ);
    ui.farbBtns.forEach(function (b, i) { gedrueckt(b, i === zeigC); });
    ui.farbTitel.textContent = T('Farbe ') + (imKissen ? T('Zierkissen') : T('Bezug')) +
      ' · ' + STOFFE[zeigQ].name + ' · ' + STOFFE[zeigQ].farben.length + T(' Farben');
    ui.wieBezug.hidden = !imKissen;
    gedrueckt(ui.wieBezug, imKissen && !kissen);

    ui.wandBtns.forEach(function (b, i) { gedrueckt(b, i === state.wand); });
    ui.bodenBtns.forEach(function (b, i) { gedrueckt(b, i === state.boden); });

    // Angaben unter dem Raum
    ui.bezug.name.textContent = stoffText(s, farbe);
    ui.bezug.link.href = kollektionHref(s);

    ui.kissen.row.hidden = !kissen;
    if (kissen) {
      ui.kissen.name.textContent = stoffText(ks, kf);
      ui.kissen.link.href = kollektionHref(ks);
    }

    if (nachAuswahl) hashSpiegeln();
  }

  /* ------------------------------------------------------------- Start */

  aufbauen();
  hashLesen();
  render(false);

  window.addEventListener('hashchange', function () {
    if (hashSchreiben) { hashSchreiben = false; return; }
    if (hashLesen()) render(false);
  });
})();
