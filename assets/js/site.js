/* ==========================================================================
   sofatrend - Seitenlogik
   Alles feature-basiert: jede Funktion prueft selbst, ob ihr Ziel-Element
   auf der aktuellen Seite existiert. Ein Skript fuer alle Seiten.
   ========================================================================== */

(function () {
  'use strict';

  var STOFFE = window.SOFATREND_STOFFE || [];

  /* Oberflaechentexte: Deutsch im Code, Englisch ueber diese Tabelle,
     aktiv wenn <html lang="en"> (Seiten unter /en/, siehe tools/build.py) */
  var EN = {
    'Menü schließen': 'Close menu',
    'Menü öffnen': 'Open menu',
    'Stoffmuster ': 'Fabric sample ',
    ' in ': ' in ',
    ' Farben': ' colours',
    'Zu einer Stoffqualität springen': 'Jump to a fabric quality',
    'Großansicht': 'Enlarged view',
    'Großansicht schließen': 'Close enlarged view',
    'Vorheriges Bild': 'Previous image',
    'Nächstes Bild': 'Next image',
    'Anfrage über die sofatrend-Website': 'Enquiry via the sofatrend website',
    'Ihr E-Mail-Programm wurde mit den Angaben geöffnet. Bitte senden Sie die E-Mail dort ab.': 'Your e-mail program has been opened with your details. Please send the e-mail from there.',
    'Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in der Regel innerhalb von zwei Werktagen.': 'Thank you, we have received your enquiry. We usually reply within two working days.',
    'Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie die Pflichtfelder oder schreiben Sie uns direkt per E-Mail.': 'The enquiry could not be sent. Please check the required fields or write to us directly by e-mail.',
    'Vielen Dank, Ihre Anfrage ist eingegangen.': 'Thank you, we have received your enquiry.',
    'Ihre Anfrage wird gesendet …': 'Your enquiry is being sent …',
    'Die Anfrage konnte nicht gesendet werden.': 'The enquiry could not be sent.',
    'Datenschutz-Einwilligung: ': 'Privacy consent: ',
    'ja': 'yes', 'nein': 'no'
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
        toggle.setAttribute('aria-label', open ? T('Menü schließen') : T('Menü öffnen'));
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

  /* ------------------------------------------------------------ Stoffseite */

  function farbSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function initFabrics() {
    var root = document.getElementById('fabric-list');
    if (!root) return;

    var IMG_STOFFE = ASSETS + 'assets/img/stoffe/';

    STOFFE.forEach(function (s) {
      var box = el('article', 'fabric');
      box.id = 'stoff-' + s.name.toLowerCase();

      var head = el('div', 'fabric__head');
      var nameWrap = el('div');
      nameWrap.appendChild(el('h3', 'fabric__name', s.name));
      head.appendChild(nameWrap);
      var headRight = el('div', 'fabric__actions');
      head.appendChild(headRight);
      box.appendChild(head);

      var colors = el('div', 'fabric__colors');
      colors.appendChild(el('h4', null, s.farben.length + T(' Farben')));

      if (s.swatches) {
        // Echte Musterfotos: Kachel verlinkt auf die Grossansicht
        // (mit JavaScript als Lightbox-Overlay, sonst als normaler Link)
        var grid = el('div', 'swatch-grid');
        grid.setAttribute('data-lightbox', '');
        s.farben.forEach(function (f) {
          var base = IMG_STOFFE + s.name.toLowerCase() + '-' + farbSlug(f);
          var a = el('a', 'swatch');
          a.href = base + '-gross.webp';
          a.setAttribute('data-caption', s.name + ' – ' + f);
          a.setAttribute('data-farbe-key', 'stoff:' + s.name + ':' + f);
          a.setAttribute('data-farbe-label', 'Stoff ' + s.name + ' ' + f);
          var img = el('img');
          img.src = base + '.webp';
          img.alt = T('Stoffmuster ') + s.name + T(' in ') + f;
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
      jump.setAttribute('aria-label', T('Zu einer Stoffqualität springen'));
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
    box.setAttribute('aria-label', T('Großansicht'));
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
    btnClose.setAttribute('aria-label', T('Großansicht schließen'));
    var btnPrev = el('button', 'lightbox__nav lightbox__nav--prev', '‹');
    btnPrev.type = 'button';
    btnPrev.setAttribute('aria-label', T('Vorheriges Bild'));
    var btnNext = el('button', 'lightbox__nav lightbox__nav--next', '›');
    btnNext.type = 'button';
    btnNext.setAttribute('aria-label', T('Nächstes Bild'));

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
            lines.push(T('Datenschutz-Einwilligung: ') + (f.checked ? T('ja') : T('nein')));
          } else if (f.value) {
            lines.push(name + ': ' + f.value);
          }
        });
        return lines;
      }

      function openMailto() {
        var to = form.getAttribute('data-mailto-form');
        var subject = form.getAttribute('data-subject') || T('Anfrage über die sofatrend-Website');
        location.href = 'mailto:' + to +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(collectLines().join('\n'));
        say(T('Ihr E-Mail-Programm wurde mit den Angaben geöffnet. Bitte senden Sie die E-Mail dort ab.'));
      }

      var back = new URLSearchParams(location.search);
      if (back.has('gesendet')) {
        say(T('Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in der Regel innerhalb von zwei Werktagen.'));
      } else if (back.has('fehler')) {
        say(T('Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie die Pflichtfelder oder schreiben Sie uns direkt per E-Mail.'), true);
      }

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

        var hp = form.querySelector('[name="website"]');
        if (hp && hp.value) { say(T('Vielen Dank, Ihre Anfrage ist eingegangen.')); return; } // Bot

        var endpoint = form.getAttribute('data-endpoint');
        if (!endpoint || typeof fetch !== 'function') { openMailto(); return; }

        if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
        say(T('Ihre Anfrage wird gesendet …'));

        var data = new FormData(form);
        data.append('_t', String(loadedAt));
        data.append('_subject', form.getAttribute('data-subject') || T('Anfrage über die sofatrend-Website'));

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
            say(T('Vielen Dank, Ihre Anfrage ist eingegangen. Wir melden uns in der Regel innerhalb von zwei Werktagen.'));
            return;
          }
          // Der Server hat geantwortet, aber abgelehnt (Pflichtfeld, Limit …):
          // Meldung zeigen statt doppelt per E-Mail-Programm zu senden
          say((r.json && r.json.error) || T('Die Anfrage konnte nicht gesendet werden.'), true);
        }).catch(function () {
          // Kein Backend erreichbar: auf E-Mail-Programm ausweichen
          openMailto();
        }).then(function () {
          if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
        });
      });
    });
  }


  /* ------------------------------------------------- Kontakt-Vorbelegung */

  /* Termin-Link von der Ausstellungsseite: Anliegen vorbelegen */
  function initKontaktParams() {
    var params = new URLSearchParams(location.search);
    var anl = document.getElementById('k-anliegen');
    if (anl && params.get('anliegen') === 'termin') {
      anl.value = 'Terminvereinbarung';
      anl.closest('form').scrollIntoView({ block: 'start' });
    }
  }

  /* ---------------------------------------------------------------- Start */

  function init() {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    initNav();
    initForms();
    initFabrics();
    initLightbox(); // nach initFabrics: braucht deren Musterkacheln
    initKontaktParams();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
