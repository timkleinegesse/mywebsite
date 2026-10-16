/* ==========================================================================
   sofatrend - Seitenlogik
   Alles feature-basiert: jede Funktion prueft selbst, ob ihr Ziel-Element
   auf der aktuellen Seite existiert. Ein Skript fuer alle Seiten.
   ========================================================================== */

(function () {
  'use strict';

  var STOFFE = window.SOFATREND_STOFFE || [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ----------------------------------------------------------- Navigation */

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (toggle && nav) {
      var setOpen = function (open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
        nav.setAttribute('data-open', String(open));
      };
      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      // Escape schliesst das mobile Menue und gibt den Fokus zurueck
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setOpen(false);
          toggle.focus();
        }
      });
      // Bei Wechsel auf Desktop-Breite den mobilen Zustand zuruecksetzen.
      // Grenze wie im CSS (max-width: 1060px), sonst schliesst jedes
      // resize-Event (z. B. einklappende URL-Leiste) das offene Menue.
      window.addEventListener('resize', function () {
        if (window.innerWidth > 1060) setOpen(false);
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

  /* ------------------------------------------------------ Kollektionsfilter */

  /* Die Modellkarten stehen statisch in kollektion.html (tools/build.py);
     der Filter blendet sie nur ein und aus. Merkmale stehen als
     data-tags="A|B" an jeder Karte. */
  function initFilter() {
    var bar = document.getElementById('filter-bar');
    var grid = document.getElementById('model-grid');
    var note = document.getElementById('filter-note');
    if (!bar || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.model-card'));
    var tags = [];
    cards.forEach(function (c) {
      (c.getAttribute('data-tags') || '').split('|').forEach(function (t) {
        if (t && tags.indexOf(t) === -1) tags.push(t);
      });
    });

    var activeTag = null;

    function render() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = !activeTag || ('|' + c.getAttribute('data-tags') + '|').indexOf('|' + activeTag + '|') !== -1;
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (note) {
        note.textContent = activeTag
          ? shown + ' von ' + cards.length + ' Modellen mit Modellaufbau „' + activeTag + '“'
          : cards.length + ' Modelle';
      }
    }

    function chipRow(container, items, get, set) {
      var all = [['Alle', null]].concat(items);
      var btns = all.map(function (it) {
        var b = el('button', 'chip', it[0]);
        b.type = 'button';
        b.addEventListener('click', function () {
          set(get() === it[1] ? null : it[1]);
          sync();
          render();
        });
        container.appendChild(b);
        return b;
      });
      function sync() {
        btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(all[i][1] === get())); });
      }
      sync();
    }

    chipRow(bar, tags.map(function (t) { return [t, t]; }),
      function () { return activeTag; }, function (v) { activeTag = v; });
    render();
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
      head.appendChild(nameWrap);
      var headRight = el('div', 'fabric__actions');
      var mb = merkButton('stoff:' + s.name, 'Stoff ' + s.name, 'stoffe.html#stoff-' + s.name.toLowerCase());
      mb.setAttribute('data-merk-off', 'Qualität merken');
      headRight.appendChild(mb);
      head.appendChild(headRight);
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
          a.href = base + '-gross.webp';
          a.title = s.name + ' ' + f + ' – Großansicht öffnen';
          a.setAttribute('data-caption', s.name + ' – ' + f);
          a.setAttribute('data-farbe-key', 'stoff:' + s.name + ':' + f);
          a.setAttribute('data-farbe-label', 'Stoff ' + s.name + ' ' + f);
          var img = el('img');
          img.src = base + '.webp';
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

    /* Alle Qualitaeten stehen untereinander; oben eine Sprungleiste mit
       Ankern (#stoff-name), damit man direkt zu einer Qualitaet kommt */
    var boxes = Array.prototype.slice.call(root.querySelectorAll('.fabric'));
    if (boxes.length > 1) {
      var jump = el('nav', 'fabric-jump');
      jump.setAttribute('aria-label', 'Zu einer Stoffqualität springen');
      boxes.forEach(function (b, i) {
        var a = el('a', 'fabric-jump__link', STOFFE[i].name);
        a.href = '#' + b.id;
        jump.appendChild(a);
      });
      root.parentNode.insertBefore(jump, root);
    }
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
    var capMerk = merkButton('', '', '', 'merk-btn--light');
    capMerk.removeAttribute('data-merk-key');
    capMerk.hidden = true;
    cap.appendChild(capText);
    cap.appendChild(capMerk);
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
      var mk = a.getAttribute('data-farbe-key');
      capMerk.hidden = !mk;
      if (!mk) capMerk.removeAttribute('data-merk-key');
      if (mk) {
        capMerk.setAttribute('data-merk-key', mk);
        capMerk.setAttribute('data-merk-label', a.getAttribute('data-farbe-label') || captionFor(a));
        capMerk.setAttribute('data-merk-href', 'stoffe.html#' + (a.closest('.fabric') ? a.closest('.fabric').id : ''));
        capMerk.setAttribute('data-merk-off', 'Farbe merken');
        merkRefresh();
      }
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
      if (t && t.closest && t.closest('[data-merk-key]')) return;
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
      else if (ev.key === 'Tab') {
        // Fokus im Dialog halten (aria-modal)
        var f = Array.prototype.filter.call(box.querySelectorAll('button'),
          function (b) { return !b.hidden; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) {
          ev.preventDefault(); last.focus();
        } else if (!ev.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) {
          ev.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------ Formulare */

  /* Versand: zuerst an das in data-endpoint hinterlegte Backend (eigenes
     PHP-Skript beim Hoster, siehe kontakt-send.php, oder ein Formular-Dienst
     wie Formspree, der mit Accept: application/json antwortet). Antwortet das
     Backend nicht oder fehlerhaft (z. B. auf einem reinen Static-Host), oeffnet
     das Formular ersatzweise das E-Mail-Programm mit den ausgefuellten Angaben. */
  function initForms() {
    var forms = document.querySelectorAll('[data-mailto-form]');

    Array.prototype.forEach.call(forms, function (form) {
      var status = form.querySelector('.form-status');
      var button = form.querySelector('button[type="submit"]');
      var loadedAt = Date.now(); // Mindest-Ausfuelldauer, prueft kontakt-send.php

      function say(text, isError) {
        if (!status) return;
        status.hidden = false;
        status.textContent = text;
        status.classList.toggle('is-error', !!isError);
      }

      function collectLines() {
        var lines = [];
        Array.prototype.forEach.call(form.elements, function (f) {
          if (!f.name || f.type === 'submit' || f.name === 'website') return;
          var label = form.querySelector('label[for="' + f.id + '"]');
          var name = label ? label.textContent.replace(/\s+/g, ' ').replace(/\s*\*\s*$/, '').trim() : f.name;
          if (f.type === 'checkbox') {
            lines.push('Datenschutz-Einwilligung: ' + (f.checked ? 'ja' : 'nein'));
          } else if (f.value) {
            lines.push(name + ': ' + f.value);
          }
        });
        return lines;
      }

      function openMailto() {
        var to = form.getAttribute('data-mailto-form');
        var subject = form.getAttribute('data-subject') || 'Anfrage über die sofatrend-Website';
        location.href = 'mailto:' + to +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(collectLines().join('\n'));
        say('Ihr E-Mail-Programm wurde mit den Angaben geöffnet. Bitte senden Sie die E-Mail dort ab.');
      }

      var back = new URLSearchParams(location.search);
      if (back.has('gesendet')) {
        say('Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in der Regel innerhalb von zwei Werktagen.');
      } else if (back.has('fehler')) {
        say('Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie die Pflichtfelder oder schreiben Sie uns direkt per E-Mail.', true);
      }

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

        var hp = form.querySelector('[name="website"]');
        if (hp && hp.value) { say('Vielen Dank, Ihre Anfrage ist eingegangen.'); return; } // Bot

        var endpoint = form.getAttribute('data-endpoint');
        if (!endpoint || typeof fetch !== 'function') { openMailto(); return; }

        if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
        say('Ihre Anfrage wird gesendet …');

        var data = new FormData(form);
        data.append('_t', String(loadedAt));
        data.append('_subject', form.getAttribute('data-subject') || 'Anfrage über die sofatrend-Website');

        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          // Nur eine echte JSON-Antwort gilt. Ein Static-Host liefert die
          // .php-Datei als Text aus (Status 200) – das darf weder als
          // "gesendet" noch als Serverfehler durchgehen (-> E-Mail-Programm).
          return res.json().then(function (json) {
            return { status: res.status, json: json };
          }, function () {
            throw new Error('Kein JSON');
          });
        }).then(function (r) {
          if (r.json && r.json.ok === true) {
            form.reset();
            say('Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in der Regel innerhalb von zwei Werktagen.');
            return;
          }
          // Der Server hat geantwortet, aber abgelehnt (Pflichtfeld, Limit …):
          // Meldung zeigen statt doppelt per E-Mail-Programm zu senden
          say((r.json && r.json.error) || 'Die Anfrage konnte nicht gesendet werden.', true);
        }).catch(function () {
          // Kein Backend erreichbar: auf E-Mail-Programm ausweichen
          openMailto();
        }).then(function () {
          if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
        });
      });
    });
  }


  /* ------------------------------------------------------------ Merkliste */

  /* Haendler sammeln Modelle, Stoffqualitaeten und Farben und senden die
     Liste als eine Anfrage. Gespeichert wird lokal im Browser (localStorage),
     es gibt keinen Server-Zustand. */
  var MERK_KEY = 'sofatrend_merkliste';

  function merkLoad() {
    try { return JSON.parse(localStorage.getItem(MERK_KEY)) || []; } catch (e) { return []; }
  }
  function merkSave(list) {
    try { localStorage.setItem(MERK_KEY, JSON.stringify(list)); } catch (e) { /* privat/voll */ }
    merkRefresh();
  }
  function merkHas(k) {
    return merkLoad().some(function (x) { return x.k === k; });
  }
  function merkToggle(item) {
    var list = merkLoad();
    var i = -1;
    list.forEach(function (x, idx) { if (x.k === item.k) i = idx; });
    if (i >= 0) list.splice(i, 1); else list.push(item);
    merkSave(list);
    return i < 0;
  }
  function merkRemove(k) {
    merkSave(merkLoad().filter(function (x) { return x.k !== k; }));
  }

  /* Zustand aller Merk-Buttons und des Zaehlers in der Navigation angleichen */
  function merkRefresh() {
    var n = merkLoad().length;
    Array.prototype.forEach.call(document.querySelectorAll('.nav__merk-count'), function (c) {
      c.textContent = n;
      c.hidden = n === 0;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-merk-key]'), function (b) {
      var on = merkHas(b.getAttribute('data-merk-key'));
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
      var label = b.querySelector('.merk-btn__label') || b;
      label.textContent = on ? (b.getAttribute('data-merk-on') || 'Gemerkt')
                             : (b.getAttribute('data-merk-off') || 'Merken');
    });
    renderMerkliste();
  }

  function merkButton(key, label, href, cls) {
    var b = el('button', 'merk-btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    b.setAttribute('data-merk-key', key);
    b.setAttribute('data-merk-label', label);
    b.setAttribute('data-merk-href', href);
    b.setAttribute('data-merk-off', 'Merken');
    b.setAttribute('data-merk-on', 'Gemerkt');
    b.appendChild(el('span', 'merk-btn__icon', ''));
    b.appendChild(el('span', 'merk-btn__label', 'Merken'));
    return b;
  }

  /* Seite merkliste.html */
  function renderMerkliste() {
    var root = document.getElementById('merkliste');
    if (!root) return;
    var list = merkLoad();
    root.innerHTML = '';
    var empty = document.getElementById('merkliste-leer');
    var actions = document.getElementById('merkliste-aktionen');
    if (empty) empty.hidden = list.length > 0;
    if (actions) actions.hidden = list.length === 0;
    if (!list.length) return;

    var groups = [['modell', 'Modelle'], ['stoff', 'Stoffe']];
    groups.forEach(function (g) {
      var items = list.filter(function (x) { return x.k.indexOf(g[0] + ':') === 0; });
      if (!items.length) return;
      var h = el('h2', 'merkliste__group', g[1]);
      root.appendChild(h);
      var ul = el('ul', 'merkliste__list');
      items.forEach(function (x) {
        var li = el('li', 'merkliste__item');
        var a = el('a', null, x.t);
        a.href = x.h;
        li.appendChild(a);
        var rm = el('button', 'merkliste__remove', 'Entfernen');
        rm.type = 'button';
        rm.setAttribute('aria-label', x.t + ' entfernen');
        rm.addEventListener('click', function () { merkRemove(x.k); });
        li.appendChild(rm);
        ul.appendChild(li);
      });
      root.appendChild(ul);
    });
  }

  function initMerkliste() {
    // Link mit Zaehler in der Navigation, vor dem Kontakt-Button
    var cta = document.querySelector('.nav__cta');
    if (cta && !document.querySelector('.nav__merk')) {
      var link = el('a', 'nav__merk');
      link.href = 'merkliste.html';
      link.appendChild(el('span', null, 'Merkliste'));
      var count = el('span', 'nav__merk-count', '0');
      count.hidden = true;
      link.appendChild(count);
      cta.parentNode.insertBefore(link, cta);
      if ((location.pathname.split('/').pop() || '') === 'merkliste.html') {
        link.setAttribute('aria-current', 'page');
      }
    }

    // Klick auf einen Merk-Button (auch spaeter eingefuegte)
    document.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-merk-key]') : null;
      if (!b || !b.getAttribute('data-merk-key')) return;
      ev.preventDefault();
      merkToggle({ k: b.getAttribute('data-merk-key'),
                   t: b.getAttribute('data-merk-label'),
                   h: b.getAttribute('data-merk-href') });
    });

    // Liste leeren
    var clear = document.getElementById('merkliste-leeren');
    if (clear) clear.addEventListener('click', function () { merkSave([]); });

    // Kontaktformular: Merkliste in die Nachricht uebernehmen
    var params = new URLSearchParams(location.search);
    var msg = document.getElementById('k-nachricht');
    if (msg && params.has('merkliste')) {
      var list = merkLoad();
      if (list.length) {
        var lines = ['Bitte senden Sie mir Unterlagen zu meiner Merkliste:', ''];
        list.forEach(function (x) { lines.push('- ' + x.t); });
        lines.push('');
        msg.value = lines.join('\n') + (msg.value ? '\n' + msg.value : '');
        var anlM = document.getElementById('k-anliegen');
        if (anlM) anlM.value = 'Unterlagen und Muster';
        var note = document.getElementById('k-merk-hinweis');
        if (note) note.hidden = false;
        var form = msg.closest('form');
        if (form) form.scrollIntoView({ block: 'start' });
      }
    }

    // Termin-Link von der Ausstellungsseite: Anliegen vorbelegen
    var anl = document.getElementById('k-anliegen');
    if (anl && params.get('anliegen') === 'termin') {
      anl.value = 'Terminvereinbarung';
      if (!params.has('merkliste')) anl.closest('form').scrollIntoView({ block: 'start' });
    }

    merkRefresh();
    // Aenderungen in anderen Tabs uebernehmen
    window.addEventListener('storage', function (ev) { if (ev.key === MERK_KEY) merkRefresh(); });
  }

  /* ---------------------------------------------------------------- Start */

  function init() {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    initNav();
    initForms();
    initFilter();
    initFabrics();
    initLightbox(); // nach initFabrics: braucht deren Musterkacheln
    initMerkliste(); // zuletzt: braucht die Merk-Buttons der Seite
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
