# sofatrend – B2B-Website

Statische Website für den Polstermöbelhersteller SOFA TREND s.r.o. (Topoľčany,
Slowakei), komplett auf Deutsch und konsequent B2B: keine Preise, kein
Warenkorb – stattdessen Kollektion, Aufbauqualität, Stoffwelt und
Händlerservices mit Anfrage-Wegen.

Gestaltung nach den beiden Referenzen des Auftraggebers:

- **Westwing**: Serifen-Display (Source Serif 4), Creme-Grund, randlose
  bildgeführte Kacheln, unterstrichene Uppercase-Textlinks
- **3C-Gruppe**: Full-Bleed-Hero mit großem, zentriertem, wechselndem
  Statement („Polstermöbel sind unser Handwerk." …), redaktionelle
  Wechselabschnitte

## Ansehen

Kein Build, keine Abhängigkeiten. Zwei Möglichkeiten:

1. **Mit lokalem Server (empfohlen, nötig für das Video):**
   Im Ordner darüber liegt `serve.ps1`:
   ```
   powershell -NoProfile -ExecutionPolicy Bypass -File ..\serve.ps1
   ```
   Dann <http://localhost:8317> öffnen.
2. `index.html` direkt doppelklicken – funktioniert ebenfalls, nur
   Video-Spulen kann je nach Browser haken.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Kennzahlen, Kollektion, Unternehmensfilm, Aufbau, Stoffe, Händler-CTA |
| `kollektion.html` | Alle 17 Modelle („Modelle") mit Merkmal-Filter; Maße und Preise auf Anfrage |
| `modell.html?m=<slug>` | Detailseite je Modell (Aufbau, Konstruktion, Elemente – bewusst ohne Maße) – ein Template, Daten aus `assets/data/modelle.js` |
| `qualitaet.html` | Gestell/Federung/Schaum/Bezug, Schnittzeichnungen, Polstercharaktere, Toleranzen, Produktpass |
| `stoffe.html` | 9 Stoffqualitäten mit echten Musterfotos je Farbe (Kachel + Großansicht in `assets/img/stoffe/`): Textaafoam (REBEL, RHYTHM, GLORY, CAYENNE, CRISP PG2) und Globatex (FANTASY, LENNON, MIRACLE, ARLES PG2); Prüfwerte bewusst nur auf Anfrage |
| `schulung.html` | Schulungswissen für Verkaufsteams in fünf Modulen (Aufbau, Stoffkennwerte, Polstercharaktere, Funktionen, Reklamation) |
| `produktpass.html` | Der A5-Produktpass online in fünf Kapiteln (Aufstellung, Pflege, Nutzung, Gewährleistung, Entsorgung) + PDF-Download unter `downloads/produktpass.pdf` |
| `haendler.html` | B2B-Leistungen und Anfrageformular |
| `unternehmen.html` | Unternehmensseite (enthält markierte Platzhalter) + Film |
| `kontakt.html` | Kontaktdaten (Platzhalter) und Formular |
| `404.html` | Gestaltete Fehlerseite (beim Hoster als Error-Page eintragen) |

Eine einheitliche Gruppe „Modelle" (17): `deep-free`, `deep-seat`, `modena`,
`bellagio`, `modular`, `como`, `pisa`, `hamilton`, `pure`, `cubetto`,
`positano`, `capri`, `soho`, `malibu`, `amalfi`, `lucca`, `monza`.
Auf Wunsch entfernt (per Git-Historie wiederherstellbar): SFT 26 017,
SFT 26 021, Bali, Mailand. Die frühere Aufteilung „Freie Modelle" /
„MOW 2026" wurde zu „Modelle" zusammengeführt.

Ebenfalls auf Wunsch entfernt (22.09.2026): **alle Maße, Artikel-,
Bestell- und SR-Nummern** – Maßtabellen, der Direktvergleich „Maße und
Aufbau auf einen Blick", Fuß-Bestellnummern sowie Zahlenangaben in
Fließtexten (auch auf Startseite und Schulungsseite). Diese Zahlen
erhalten Händler erst mit der zugesandten Typen- und Preisliste; an
ihre Stelle sind „auf Anfrage"-Hinweise mit Kontakt-CTA getreten.

Die Produkt-Präsentationsbilder (`<slug>-szene.webp`) sind die Renderings von
Seite 1 der jeweiligen Typen- und Preisliste, direkt als eingebettete JPEGs
aus den PDFs extrahiert. Nur die sieben ursprünglichen Modellreihen haben
zusätzlich Schnittzeichnung und Aufbau-Renderings (`hatAufbau: true`).

## Datenquellen

Alle Produktangaben stammen aus den mitgelieferten Unterlagen:

- **Typen- und Preislisten** (`../Preislisten/`, Unterordner "Freie Modelle"
  und "MOW 2026", 22 PDFs): Seite-1-Renderings, Gestell-/Sitzbeschreibung,
  Elementtypen (Maße und Nummern daraus werden bewusst nicht veröffentlicht)
- **`sofatrend_modellaufbau.pptx`**: Produktrenderings, Schnittbilder und
  Aufbau-Legenden (nach `assets/img/` verkleinert exportiert)
- **Stoff-Stammdatenblatt** (`../Schulung/*.xlsx`): alle Stoffdaten und Farbnamen
- **A5 Produktpass**: Pflege, Polstercharaktere, Toleranzen, Gewährleistung,
  Nachhaltigkeitstext
- **`../Sofatrend Informationen/sofah.mp4`**: Unternehmensfilm – mit ffmpeg
  auf 1280p/9,6 MB komprimiert unter `assets/video/sofatrend-film.mp4`
  (Original 66 MB), Posterbild `assets/img/film-poster.webp`, lädt erst
  bei Klick (`preload="none"`)
- **<https://www.sofatrend.eu>** (bestehende Website): Kontaktdaten, Firmensitz,
  Gründungsjahr 2001, Fertigungstiefe (eigene CNC-Holzverarbeitung, Polsterei,
  Produktentwicklung), Registernummern

Bewusst **nicht** veröffentlicht: Preise (B2B – nur auf Anfrage), die
Original-Preislisten-PDFs sowie die internen Strategieunterlagen
(Marktpositionierung, Fragenkatalog, Hersteller-VK-Übersicht) – letztere
dienten nur zur Schärfung der Positionierung im Text.

## Vor dem Livegang zu erledigen

- [ ] Ansprechpartner Vertrieb/Außendienst auf `kontakt.html` eintragen
      (einziger verbliebener Platzhalter; übrige Kontaktdaten stammen von
      sofatrend.eu)
- [ ] `impressum.html` und `datenschutz.html` fertigstellen (als markierte
      Entwürfe vorhanden): Geschäftsführer, Registernummern und Hosting-Angabe
      ergänzen, juristisch prüfen lassen – Impressumspflicht!
- [ ] Kontaktformular beim Hoster scharf schalten: `kontakt-send.php`
      braucht PHP und eine Absenderadresse der eigenen Domain (siehe
      Abschnitt „Kontaktformular")

## Kontaktformular

`kontakt.html` sendet per `fetch` an das Backend aus dem Attribut
`data-endpoint` (Standard: `kontakt-send.php`, ein kleines PHP-Skript mit
Pflichtfeld-Prüfung, Honeypot und JSON-Antwort). Nur eine Antwort
`{"ok":true}` gilt als Erfolg. Antwortet der Server nicht oder liefert kein
JSON (reiner Static-Host, GitHub Pages), öffnet das Formular ersatzweise das
E-Mail-Programm des Besuchers mit allen Angaben (`data-mailto-form`).

Einrichtung beim Hoster:

1. **Mit PHP** (die meisten Shared-Hoster): in `kontakt-send.php` die
   Konstanten `EMPFAENGER` (Zielpostfach) und `ABSENDER` (Adresse der
   eigenen Domain, sonst Spam-Verdacht) setzen. SPF-Eintrag der Domain um
   den Mailserver des Hosters ergänzen.
2. **Ohne PHP**: bei einem Formular-Dienst (z. B. Formspree) ein Formular
   anlegen und dessen URL in `kontakt.html` als `data-endpoint` und `action`
   eintragen. Der Dienst muss auf `Accept: application/json` mit
   `{"ok":true}` antworten (Formspree tut das).

Das Formular enthält eine Pflicht-Checkbox mit Link auf die
Datenschutzerklärung; der Text dort muss die Formularverarbeitung
beschreiben.

## Technik

- Reines HTML/CSS/JS, keine Frameworks, kein Build-Schritt
- Modell- und Stoffdaten als JS-Globals (`assets/data/`), damit die Seiten auch
  über `file://` ohne fetch/CORS-Probleme laufen
- Schriften (Source Serif 4, Inter) lokal gehostet (`assets/fonts/`,
  `fonts.css`) – keine Google-Requests, DSGVO-freundlich
- Bilder aus PDFs/PowerPoint extrahiert, beschnitten und webtauglich
  verkleinert (15–130 KB je JPEG)
- Großansichten (Stoffmuster, Galerien) öffnen als Lightbox-Overlay mit
  Tastatursteuerung; ohne JavaScript bleiben es normale Bildlinks
- Druck-Stylesheet: Modell- und Serviceseiten drucken ohne Navigation,
  Formulare und Video (für die Verkaufsfläche)
- `404.html` für gestaltete Fehlerseiten (beim Hoster als Error-Page
  hinterlegen); Seite liegt flach im Root, Pfade sind relativ
