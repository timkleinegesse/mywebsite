/* ==========================================================================
   sofatrend - Seitenlogik
   Alles feature-basiert: jede Funktion prueft selbst, ob ihr Ziel-Element
   auf der aktuellen Seite existiert. Ein Skript fuer alle Seiten.
   ========================================================================== */

(function () {
  'use strict';

  var MODELLE = window.SOFATREND_MODELLE || [];
  var STOFFE  = window.SOFATREND_STOFFE  || [];

  var IMG = 'assets/img/modelle/';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function bySlug(slug) {
    for (var i = 0; i < MODELLE.length; i++) {
      if (MODELLE[i].slug === slug) return MODELLE[i];
    }
    return null;
  }

  /* ----------------------------------------------------------- Navigation */

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        nav.setAttribute('data-open', String(!open));
      });
      // Bei Wechsel auf Desktop-Breite den mobilen Zustand zuruecksetzen
      window.addEventListener('resize', function () {
        if (window.innerWidth > 960) {
          toggle.setAttribute('aria-expanded', 'false');
          nav.setAttribute('data-open', 'false');
        }
      });
    }

    // Aktuelle Seite in der Navigation markieren
    var here = location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href === here) links[i].setAttribute('aria-current', 'page');
    }
  }

  /* -------------------------------------------------------- Modell-Kachel */

  function modelCard(m) {
    var a = el('a', 'model-card');
    a.href = 'modell.html?m=' + m.slug;

    // Wohnszenen laufen randlos (cover), Freisteller stehen auf Weiss (contain)
    var media = el('div', 'model-card__media model-card__media--' + (m.bildStil || 'contain'));
    var img = el('img');
    img.src = IMG + m.bild + '-thumb.jpg';
    img.alt = m.name + ' - Produktansicht aus der Typen- und Preisliste';
    img.loading = 'lazy';
    img.width = 760;
    img.height = 500;
    media.appendChild(img);

    var body = el('div', 'model-card__body');
    body.appendChild(el('span', 'model-card__koll', m.kollektion));
    body.appendChild(el('h3', 'model-card__name', m.name));
    body.appendChild(el('p', 'model-card__claim', m.claim));

    var meta = el('div', 'model-card__meta');
    meta.appendChild(el('span', 'tag', 'Konfigurierbar'));
    body.appendChild(meta);

    a.appendChild(media);
    a.appendChild(body);
    return a;
  }

  function initModelGrid() {
    // Auf der Kollektionsseite befuellt der Filter das Hauptraster
    var filtered = document.getElementById('filter-bar');

    var grids = document.querySelectorAll('.model-grid[data-limit], .model-grid[data-collection]');
    Array.prototype.forEach.call(grids, function (grid) {
      if (filtered && grid.id === 'model-grid') return;

      var list = MODELLE;
      var koll = grid.getAttribute('data-collection');
      if (koll) list = list.filter(function (m) { return m.kollektion === koll; });

      var limit = parseInt(grid.getAttribute('data-limit'), 10);
      if (!isNaN(limit)) list = list.slice(0, limit);

      list.forEach(function (m) { grid.appendChild(modelCard(m)); });
    });
  }

  /* ------------------------------------------------------ Kollektionsfilter */

  function initFilter() {
    var bar = document.getElementById('filter-bar');
    var kollBar = document.getElementById('filter-koll');
    var grid = document.getElementById('model-grid');
    var note = document.getElementById('filter-note');
    if (!bar || !grid) return;

    // Alle vorkommenden Tags einsammeln, Reihenfolge stabil halten
    var tags = [];
    MODELLE.forEach(function (m) {
      m.tags.forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });

    var activeTag = null;
    var activeKoll = null;

    function render() {
      grid.innerHTML = '';
      var shown = MODELLE.filter(function (m) {
        return (!activeTag || m.tags.indexOf(activeTag) !== -1) &&
               (!activeKoll || m.kollektion === activeKoll);
      });
      shown.forEach(function (m) { grid.appendChild(modelCard(m)); });

      if (note) {
        var parts = [];
        if (activeKoll) parts.push('Kollektion „' + activeKoll + '“');
        if (activeTag) parts.push('Merkmal „' + activeTag + '“');
        note.textContent = parts.length
          ? shown.length + ' von ' + MODELLE.length + ' Modellen mit ' + parts.join(' und ')
          : MODELLE.length + ' Modelle';
      }
    }

    function syncChips(container, active) {
      var chips = container.querySelectorAll('.chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed',
          String(chips[i].getAttribute('data-value') === (active === null ? 'null' : active)));
      }
    }

    function makeChip(container, label, value, get, set) {
      var b = el('button', 'chip', label);
      b.type = 'button';
      b.setAttribute('data-value', value === null ? 'null' : value);
      b.setAttribute('aria-pressed', String(get() === value));
      b.addEventListener('click', function () {
        set(get() === value ? null : value);
        syncChips(container, get());
        render();
      });
      container.appendChild(b);
      return b;
    }

    // Kollektions-Chips
    if (kollBar) {
      makeChip(kollBar, 'Alle', null,
        function () { return activeKoll; }, function (v) { activeKoll = v; })
        .setAttribute('aria-pressed', 'true');
      ['Freie Modelle', 'MOW 2026'].forEach(function (k) {
        makeChip(kollBar, k, k,
          function () { return activeKoll; }, function (v) { activeKoll = v; });
      });
    }

    // Merkmal-Chips
    makeChip(bar, 'Alle', null,
      function () { return activeTag; }, function (v) { activeTag = v; })
      .setAttribute('aria-pressed', 'true');
    tags.forEach(function (t) {
      makeChip(bar, t, t,
        function () { return activeTag; }, function (v) { activeTag = v; });
    });

    render();
  }

  /* ---------------------------------------------------------- Modellseite */

  function fillModelPage() {
    var root = document.getElementById('model-detail');
    if (!root) return;

    var params = new URLSearchParams(location.search);
    var m = bySlug(params.get('m'));

    if (!m) {
      root.innerHTML = '';
      var box = el('div', 'wrap wrap--narrow section');
      box.appendChild(el('h1', null, 'Modell nicht gefunden'));
      box.appendChild(el('p', 'lede',
        'Diese Modellreihe gibt es nicht (mehr). Die vollständige Kollektion ' +
        'finden Sie in der Übersicht.'));
      var back = el('a', 'btn', 'Zur Kollektion');
      back.href = 'kollektion.html';
      var row = el('div', 'btn-row');
      row.appendChild(back);
      box.appendChild(row);
      root.appendChild(box);
      return;
    }

    document.title = m.name + ' – sofatrend';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', m.claim + ' ' + m.intro.slice(0, 110) + '…');

    // Kopfbereich
    setText('m-name', m.name);
    setText('m-claim', m.claim);
    setText('m-intro', m.intro);

    var hero = document.getElementById('m-hero-img');
    if (hero) {
      hero.src = IMG + m.bild + '.jpg';
      hero.alt = m.name + ' – Produktansicht aus der Typen- und Preisliste';
      var frame = hero.closest('.model-hero__media');
      if (frame) frame.classList.add('model-hero__media--' + (m.bildStil || 'contain'));
    }

    setText('m-koll', m.kollektion);

    var tagList = document.getElementById('m-tags');
    if (tagList) {
      var li = el('li');
      li.appendChild(el('span', 'tag', 'Konfigurierbar'));
      tagList.appendChild(li);
    }

    setText('m-gestell', m.gestell);
    setText('m-sitz', m.sitz);

    // Aufbau: nummerierte Legende (mit Schnittzeichnung) oder belegte
    // Schichtenliste ohne Nummern, wenn keine Zeichnung vorliegt
    var build = document.getElementById('m-aufbau');
    if (build) {
      var steps = m.aufbau || m.schichten || [];
      if (!m.aufbau) build.className = 'plain-list';
      steps.forEach(function (step) { build.appendChild(el('li', null, step)); });
    }

    // Elementuebersicht
    var elems = document.getElementById('m-elemente');
    if (elems) {
      m.elemente.forEach(function (e) { elems.appendChild(el('li', null, e)); });
    }

    // Aufbau-Renderings (freigelegtes Gestell etc.) gibt es nur fuer die
    // sieben dokumentierten Modellreihen; eine Schnittzeichnung aus der
    // Preisliste haben inzwischen fast alle Modelle.
    if (m.hatAufbau) {
      setImg('m-img-gestell', IMG + m.slug + '-gestell.jpg',
             m.name + ' – Gestell mit Wellenunterfederung');
      setImg('m-img-aufbau', IMG + m.slug + '-aufbau.jpg',
             m.name + ' – Polsteraufbau im Schnitt');
      setImg('m-img-schnitt', IMG + m.slug + '-schnitt.png',
             m.name + ' – Schnittzeichnung mit nummerierten Aufbaupositionen');
    } else {
      var gal = document.getElementById('m-aufbau-galerie');
      if (gal) gal.remove();

      if (m.schnittBild) {
        setImg('m-img-schnitt', IMG + m.schnittBild,
               m.name + ' – Schnittzeichnung aus der Typen- und Preisliste');
        setText('m-aufbau-lede',
          'Die Schnittzeichnung aus der Typen- und Preisliste; daneben die ' +
          'dokumentierten Aufbau-Ebenen dieser Reihe.');
      } else {
        var schnitt = document.getElementById('m-img-schnitt');
        if (schnitt && schnitt.closest('figure')) schnitt.closest('figure').remove();
        setText('m-aufbau-lede',
          'Die dokumentierten Aufbau-Ebenen dieser Reihe. Schnittzeichnung und ' +
          'weitere Details enthält die Typen- und Preisliste.');
      }
    }

    // Weitere Ansichten aus der Typenliste
    var galSection = document.getElementById('m-galerie');
    var galGrid = document.getElementById('m-galerie-grid');
    if (galSection && galGrid) {
      if (m.galerie && m.galerie.length) {
        m.galerie.forEach(function (g) {
          var fig = document.createElement('figure');
          var img = el('img');
          img.src = IMG + g.b;
          img.alt = m.name + ' – ' + g.t;
          img.loading = 'lazy';
          fig.appendChild(img);
          var cap = document.createElement('figcaption');
          cap.textContent = g.t;
          fig.appendChild(cap);
          galGrid.appendChild(fig);
        });
      } else {
        galSection.remove();
      }
    }

    // Nachbarmodelle
    var more = document.getElementById('m-more');
    if (more) {
      MODELLE.filter(function (x) { return x.slug !== m.slug; })
             .slice(0, 3)
             .forEach(function (x) { more.appendChild(modelCard(x)); });
    }

    // Stoffwelt-Teaser: ein Muster je Qualitaet; welche Farbe gezeigt wird,
    // variiert deterministisch mit dem Modell (Index statt Zufall)
    var fabTeaser = document.getElementById('m-stoffe');
    if (fabTeaser && STOFFE.length) {
      var mIdx = MODELLE.indexOf(m);
      STOFFE.forEach(function (s) {
        if (!s.swatches) return;
        var farbe = s.farben[mIdx % s.farben.length];
        var a = el('a', 'swatch');
        a.href = 'stoffe.html#stoff-' + s.name.toLowerCase();
        a.title = s.name + ' ' + farbe + ' – zur Stoffkollektion';
        var img = el('img');
        img.src = 'assets/img/stoffe/' + s.name.toLowerCase() + '-' + farbSlug(farbe) + '.jpg';
        img.alt = 'Stoffmuster ' + s.name + ' in ' + farbe;
        img.loading = 'lazy';
        img.width = 120;
        img.height = 120;
        a.appendChild(img);
        a.appendChild(el('span', 'swatch__name', s.name));
        fabTeaser.appendChild(a);
      });
    }
  }

  function specRow(label, value) {
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.scope = 'row';
    th.textContent = label;
    var td = document.createElement('td');
    td.textContent = value;
    tr.appendChild(th);
    tr.appendChild(td);
    return tr;
  }

  function setText(id, text) {
    var n = document.getElementById(id);
    if (n) n.textContent = text;
  }

  function setImg(id, src, alt) {
    var n = document.getElementById(id);
    if (!n) return;
    n.src = src;
    n.alt = alt;
  }

  /* ------------------------------------------------------------ Stoffseite */

  function farbSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function initFabrics() {
    var root = document.getElementById('fabric-list');
    if (!root) return;

    var IMG_STOFFE = 'assets/img/stoffe/';

    STOFFE.forEach(function (s) {
      var box = el('article', 'fabric');
      box.id = 'stoff-' + s.name.toLowerCase();

      var head = el('div', 'fabric__head');
      var nameWrap = el('div');
      nameWrap.appendChild(el('h3', 'fabric__name', s.name));
      if (s.hersteller) {
        nameWrap.appendChild(el('span', 'fabric__hersteller',
          s.hersteller + (s.art ? ' · ' + s.art : '')));
      }
      head.appendChild(nameWrap);
      var pgLabel = s.pg === 'PG1' ? 'Preisgruppe 1'
                  : s.pg === 'PG2' ? 'Preisgruppe 2'
                  : 'Preisgruppe auf Anfrage';
      head.appendChild(el('span',
        'badge' + (s.pg ? ' badge--' + s.pg.toLowerCase() : ''), pgLabel));
      box.appendChild(head);

      var colors = el('div', 'fabric__colors');
      colors.appendChild(el('h4', null, s.farben.length + ' Farben'));

      if (s.swatches) {
        // Echte Musterfotos: Kachel verlinkt auf die Grossansicht
        // (mit JavaScript als Lightbox-Overlay, sonst als normaler Link)
        var grid = el('div', 'swatch-grid');
        grid.setAttribute('data-lightbox', '');
        s.farben.forEach(function (f) {
          var base = IMG_STOFFE + s.name.toLowerCase() + '-' + farbSlug(f);
          var a = el('a', 'swatch');
          a.href = base + '-gross.jpg';
          a.title = s.name + ' ' + f + ' – Großansicht öffnen';
          a.setAttribute('data-caption', s.name + ' – ' + f);
          var img = el('img');
          img.src = base + '.jpg';
          img.alt = 'Stoffmuster ' + s.name + ' in ' + f;
          img.loading = 'lazy';
          img.width = 120;
          img.height = 120;
          a.appendChild(img);
          a.appendChild(el('span', 'swatch__name', f));
          grid.appendChild(a);
        });
        colors.appendChild(grid);
      } else {
        var ul = el('ul', 'pill-list');
        s.farben.forEach(function (f) {
          var li = el('li');
          li.appendChild(el('span', 'tag', f));
          ul.appendChild(li);
        });
        colors.appendChild(ul);
      }
      box.appendChild(colors);

      root.appendChild(box);
    });
  }

  /* -------------------------------------------------------------- Lightbox */

  /* Grossansichten (Stoffmuster, Galerien) als Overlay statt neuem Tab.
     Ohne JavaScript bleiben die normalen Links auf die Bilddateien. */
  function initLightbox() {
    // Galerie-Bilder nachtraeglich verlinken; Grossansicht ist die Bilddatei
    var gals = document.querySelectorAll('.gallery');
    Array.prototype.forEach.call(gals, function (g) {
      g.setAttribute('data-lightbox', '');
      Array.prototype.forEach.call(g.querySelectorAll('figure > img'), function (img) {
        if (!img.getAttribute('src')) return;
        var a = el('a', 'gallery-zoom');
        a.href = img.getAttribute('src');
        var fig = img.parentNode;
        var cap = fig.querySelector('figcaption');
        a.setAttribute('data-caption', cap ? cap.textContent : (img.alt || ''));
        fig.insertBefore(a, img);
        a.appendChild(img);
      });
    });

    if (!document.querySelector('[data-lightbox]')) return;

    // Overlay einmalig aufbauen
    var box = el('div', 'lightbox');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Großansicht');
    box.hidden = true;

    var fig = el('figure', 'lightbox__figure');
    var img = el('img');
    img.alt = '';
    var cap = el('figcaption', 'lightbox__caption');
    var capText = el('span');
    var count = el('span', 'lightbox__count');
    cap.appendChild(capText);
    cap.appendChild(count);
    fig.appendChild(img);
    fig.appendChild(cap);

    var btnClose = el('button', 'lightbox__close', '✕');
    btnClose.type = 'button';
    btnClose.setAttribute('aria-label', 'Großansicht schließen');
    var btnPrev = el('button', 'lightbox__nav lightbox__nav--prev', '‹');
    btnPrev.type = 'button';
    btnPrev.setAttribute('aria-label', 'Vorheriges Bild');
    var btnNext = el('button', 'lightbox__nav lightbox__nav--next', '›');
    btnNext.type = 'button';
    btnNext.setAttribute('aria-label', 'Nächstes Bild');

    box.appendChild(btnClose);
    box.appendChild(btnPrev);
    box.appendChild(fig);
    box.appendChild(btnNext);
    document.body.appendChild(box);

    var items = [];
    var current = 0;
    var lastFocus = null;

    function captionFor(a) {
      return a.getAttribute('data-caption') || a.title || '';
    }

    function show(i) {
      current = (i + items.length) % items.length;
      var a = items[current];
      img.src = a.href;
      img.alt = captionFor(a);
      capText.textContent = captionFor(a);
      count.textContent = items.length > 1 ? (current + 1) + ' / ' + items.length : '';
      btnPrev.hidden = btnNext.hidden = items.length < 2;
    }

    function open(list, i, trigger) {
      if (!list.length) return;
      items = list;
      lastFocus = trigger || document.activeElement;
      box.hidden = false;
      document.body.classList.add('lightbox-open');
      show(i);
      btnClose.focus();
    }

    function close() {
      box.hidden = true;
      img.removeAttribute('src');
      document.body.classList.remove('lightbox-open');
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      var a = t && t.closest ? t.closest('[data-lightbox] a[href]') : null;
      if (!a) return;
      var group = a.closest('[data-lightbox]');
      var list = Array.prototype.slice.call(group.querySelectorAll('a[href]'));
      ev.preventDefault();
      open(list, list.indexOf(a), a);
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (ev) { if (ev.target === box) close(); });

    document.addEventListener('keydown', function (ev) {
      if (box.hidden) return;
      if (ev.key === 'Escape') close();
      else if (ev.key === 'ArrowLeft') show(current - 1);
      else if (ev.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ------------------------------------------- Hero-Statements (3C-Stil) */

  function initHeroStatements() {
    var h1 = document.getElementById('hero-statement');
    if (!h1) return;

    var statements = [
      'Polstermöbel sind<br>unser Handwerk.',
      'Qualität ist<br>unser Anspruch.',
      'Der Aufbau ist<br>unser Argument.'
    ];

    var reduce = window.matchMedia &&
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var i = 0;
    setInterval(function () {
      h1.classList.add('is-fading');
      setTimeout(function () {
        i = (i + 1) % statements.length;
        h1.innerHTML = statements[i];
        h1.classList.remove('is-fading');
      }, 620);
    }, 4600);
  }

  /* ------------------------------------------------------------ Formulare */

  /* Die Seite ist statisch und hat kein Backend. Bis eines angebunden ist,
     setzt das Formular die Eingaben in eine vorbereitete E-Mail um. */
  function initForms() {
    var forms = document.querySelectorAll('[data-mailto-form]');

    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();

        var to = form.getAttribute('data-mailto-form');
        var subject = form.getAttribute('data-subject') || 'Anfrage über sofatrend.de';
        var lines = [];

        Array.prototype.forEach.call(form.elements, function (f) {
          if (!f.name || f.type === 'submit') return;
          var label = form.querySelector('label[for="' + f.id + '"]');
          var name = label ? label.textContent.replace(/\s*\*$/, '') : f.name;
          if (f.type === 'checkbox') {
            lines.push(name + ': ' + (f.checked ? 'ja' : 'nein'));
          } else if (f.value) {
            lines.push(name + ': ' + f.value);
          }
        });

        location.href = 'mailto:' + to +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(lines.join('\n'));
      });
    });
  }

  /* ---------------------------------------------------------------- Start */

  function init() {
    initNav();
    initHeroStatements();
    initForms();
    initModelGrid();
    initFilter();
    fillModelPage();
    initFabrics();
    initLightbox(); // nach fillModelPage/initFabrics: braucht deren Galerien
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
