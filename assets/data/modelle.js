/* ==========================================================================
   Modelldaten
   Quellen: Typen- und Preislisten in ../Preislisten/ ("Freie Modelle" und
   "MOW 2026") sowie die Aufbau-Praesentation "sofatrend_modellaufbau".
   Szenenbilder (<slug>-szene.jpg) sind die Seite-1-Renderings der Preislisten.

   Bewusst OHNE Masse, Artikel- und Bestellnummern: diese Zahlen erhalten
   Haendler erst mit der zugesandten Typen- und Preisliste.

   Felder:
   - kollektion : 'Modelle' (einheitliche Gruppe)
   - bild       : Basisname des Praesentationsbilds (+ '.jpg' / '-thumb.jpg')
   - bildStil   : 'cover' (Wohnszene, randlos) | 'contain' (Freisteller)
   - aufbau     : nummerierte Legende, passend zur Schnittzeichnung
                  (nur die sieben Modelle mit hatAufbau: true)
   - schichten  : belegte Aufbau-Ebenen ohne Nummerierung (neue Modelle,
                  bewusst unvollstaendig statt geraten)

   Als globale Variable statt JSON, damit die Seiten auch per file:// laufen.
   ========================================================================== */

window.SOFATREND_MODELLE = [

  /* == Modelle ======================================================== */

  {
    slug: 'deep-free',
    name: 'Deep Free',
    kollektion: 'Modelle',
    bild: 'deep-free-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'deep-free-a1.jpg', t: 'Variante mit Longchair in Grau' },
      { b: 'deep-free-a2.jpg', t: 'Rückansicht' }
    ],
    claim: 'Tiefes, legeres Sitzen mit losen Kissen.',
    intro: 'Deep Free ist die legere Modellreihe im Programm: eine extra tiefe ' +
           'Sitzfläche und ein Tonnentaschenfederkern, der auch bei großzügigen ' +
           'Sitzflächen punktelastisch bleibt. Alle tragenden Teile des Gestells sind aus Massivholz.',
    tags: ['Tonnentaschenfederkern', 'Longchair', 'Kopfstütze'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, Tonnentaschenfederkern mit PUR-Schaum ' +
          '(mind. RG 35), abgedeckt mit Textilvlies und Wattevlies.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
             'Tonnentaschenfederkern mit PUR Schaum', 'Inlett mit Füllung',
             'Bezugsmaterial', 'Fuß'],
    elemente: ['1-Sitzer mit Armlehne links / rechts', '1-Sitzer ohne Armlehne',
               'Longchair links / rechts', 'Kopfstütze']
  },

  {
    slug: 'deep-seat',
    name: 'Deep Seat',
    kollektion: 'Modelle',
    bild: 'deep-seat-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'deep-seat-a1.jpg', t: 'Mit Kopfstütze, Bezug in Rosé' },
      { b: 'deep-seat-a2.jpg', t: 'Eckvariante in Creme' },
      { b: 'deep-seat-a3.jpg', t: 'Wohnlandschaft in Rosé' }
    ],
    claim: 'Maximale Sitztiefe, niedrige Sitzhöhe.',
    intro: 'Deep Seat ist das tiefste und zugleich niedrigste Modell der ' +
           'Kollektion - ein kubischer Baukasten für große Wohnflächen, ' +
           'bis hin zum Longchair XL.',
    tags: ['Tonnentaschenfederkern', 'Longchair', 'Kopfstütze', 'XL-Tiefe'],
    gestell: 'Stabiles Grundgestell aus Massivholz und Holzwerkstoffen.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, Tonnentaschenfederkern mit PUR-Schaum ' +
          '(mind. RG 35), abgedeckt mit Textilvlies und Wattevlies.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
             'Tonnentaschenfederkern mit PUR Schaum', 'Inlett mit Füllung',
             'Bezugsmaterial', 'Fuß'],
    elemente: ['1-Sitzer mit Armlehne links / rechts', '1-Sitzer ohne Armlehne',
               'Spitzecke', 'Longchair rechts / Longchair XL', 'Kopfstütze']
  },

  {
    slug: 'modena',
    name: 'Modena',
    kollektion: 'Modelle',
    bild: 'modena-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'modena-a1.jpg', t: 'Variante in Creme' },
      { b: 'modena-a2.jpg', t: '3-Sitzer, flache Linie' },
      { b: 'modena-a3.jpg', t: 'Ecklösung im Cord-Bezug' }
    ],
    claim: 'Niedrige Linie, umlaufender Sichtholzrahmen.',
    intro: 'Modena setzt auf eine flache Silhouette und die größte Sitztiefe ' +
           'im Programm. Der optionale Sichtholzrahmen läuft als sichtbare ' +
           'Sockelkante um das Möbel und gibt der Reihe ihr eigenes Gesicht.',
    tags: ['Tonnentaschenfederkern', 'Longchair', 'Sichtholzrahmen'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, Tonnentaschenfederkern mit PUR-Schaum ' +
          '(mind. RG 35), abgedeckt mit Textilvlies und Wattevlies.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
             'Tonnentaschenfederkern mit PUR Schaum', 'PUR Schaum',
             'Bezugsmaterial', 'Sichtholzrahmen', 'Fuß'],
    elemente: ['1-Sitzer mit Armlehne links / rechts', '1-Sitzer ohne Armlehne',
               'Longchair rechts']
  },

  {
    slug: 'bellagio',
    name: 'Bellagio',
    kollektion: 'Modelle',
    bild: 'bellagio-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'bellagio-a1.jpg', t: 'Rückenteile und Armlehne in Funktion' },
      { b: 'bellagio-a2.jpg', t: 'Mit Kopfstützen und Kissen' }
    ],
    claim: 'Funktionsmodell mit klappbarer Armlehne.',
    intro: 'Bellagio ist die Funktionsreihe: die Armlehne ist klappbar ausgeführt, ' +
           'die Sitztiefe lässt sich in zwei Stufen verstellen. Dazu ein breites ' +
           'Programm an Anreihelementen, Spitzecken, Hockern und Kissen.',
    tags: ['Funktion', 'Longchair', 'Anreihelemente'],
    gestell: 'Stabiles Grundgestell aus Massivholz und Holzwerkstoffen.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, PUR-Schaum, Inlett mit Füllung.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'PUR Schaum', 'Inlett mit Füllung',
             'Bezugsmaterial', 'Fuß'],
    elemente: ['2-Sitzer mit Armlehne links / rechts / beidseitig',
               '2-Sitzer ohne Armlehne', 'Longchair links / rechts',
               'Spitzecke', 'Abschlussteil mit 1-Sitzer links / rechts',
               'Hocker quadratisch, Hockerbank',
               'Kissen mit Boden, Spitzkissen']
  },

  {
    slug: 'modular',
    name: 'Modular',
    kollektion: 'Modelle',
    bild: 'modular-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'modular-a1.jpg', t: 'Elementgruppe mit Hocker' },
      { b: 'modular-a2.jpg', t: 'Organische Rückansicht' }
    ],
    claim: 'Organisch geformte Basiselemente, frei kombinierbar.',
    intro: 'Modular verzichtet auf Armlehnen und arbeitet stattdessen mit runden und ' +
           'geraden Basiselementen, losen Rückenkissen und großzügigen Hockern. ' +
           'Der Sitz besteht durchgehend aus Tonnentaschenfederkern.',
    tags: ['Tonnentaschenfederkern', 'Frei kombinierbar'],
    gestell: 'Stabiles Grundgestell aus Massivholz und Holzwerkstoffen.',
    sitz: 'Hochwertiger punktelastischer Tonnentaschenfederkernsitz (TTFK), abgedeckt ' +
          'mit Textilvlies, Schaum (mind. RG 35) und Wattevlies.',
    aufbau: ['Gestell', 'Tonnentaschenfederkern', 'PUR Schaum', 'PUR Schaum',
             'Bezugsmaterial', 'Fuß'],
    elemente: ['Basiselement rund', 'Basiselement gerade',
               'Hocker quadratisch', 'Armlehnen-Kissen']
  },

  {
    slug: 'como',
    name: 'Como',
    kollektion: 'Modelle',
    bild: 'como-szene',
    bildStil: 'cover',
    hatAufbau: true,
    claim: 'Verstellbare Kopfstützen, Sitzvorzug motorisch.',
    intro: 'Como ist das komfortorientierte Modell: verstellbare Kopfstützen, ' +
           'Sitzvorzug wahlweise motorisch und eine erweiterbare Gesamttiefe. ' +
           'Alle tragenden Gestellteile aus Massivholz.',
    tags: ['Funktion', 'Longchair', 'Kopfstütze', 'Motorisch'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, weicher Polsteraufbau aus PUR-Schaum.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
             'PUR Schaum', 'Bezugsmaterial', 'Fuß'],
    elemente: ['2-Sitzer mit Armlehne links / rechts',
               '2-Sitzer ohne Armlehne, auch mit Sitzvorzug motorisch',
               'Longchair links / rechts', 'Spitzecke',
               'Hocker quadratisch']
  },

  {
    slug: 'pisa',
    name: 'Pisa',
    kollektion: 'Modelle',
    bild: 'pisa-szene',
    bildStil: 'cover',
    hatAufbau: true,
    galerie: [
      { b: 'pisa-a1.jpg', t: 'Freisteller mit Ottomane' }
    ],
    claim: 'Kompakte Grundform mit Ottomane.',
    intro: 'Pisa ist eines der kompaktesten Modelle der Kollektion: flache ' +
           'Silhouette, klare Blockarmlehne. Die Ottomane lässt sich links oder ' +
           'rechts anstellen - passend für kleinere Grundrisse.',
    tags: ['Ottomane', 'Kompakt'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, PUR-Schaum.',
    aufbau: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
             'PUR Schaum', 'Bezugsmaterial', 'Fuß'],
    elemente: ['2-Sitzer mit Armteil links / rechts',
               'Ottomane mit Armteil links / rechts']
  },

  {
    slug: 'hamilton',
    name: 'Hamilton',
    kollektion: 'Modelle',
    bild: 'hamilton-szene',
    bildStil: 'cover',
    schnittBild: 'hamilton-schnitt.jpg',
    claim: 'Kubische Armlehne, Umbauecke, Nierenkissen.',
    intro: 'Hamilton kombiniert eine extra tiefe Sitzfläche mit einer kubischen ' +
           'Armlehne und einer Umbauecke. Der Sitz steht auf Tonnentaschenfederkern, ' +
           'das Gestell auf Massivholz, das Möbel selbst auf flachen Kunststoffgleitern.',
    tags: ['Tonnentaschenfederkern', 'Umbauecke'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, Tonnentaschenfederkern mit PUR-Schaum, ' +
          'Textilvlies, Schaum (mind. RG 35) und Wattevlies.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'Tonnentaschenfederkern mit PUR Schaum', 'Bezugsmaterial', 'Fuß / Gleiter'],
    elemente: ['2-Sitzer links', 'Umbauecke rechts', 'Nierenkissen']
  },

  {
    slug: 'pure',
    name: 'Pure',
    kollektion: 'Modelle',
    bild: 'pure-szene',
    bildStil: 'cover',
    schnittBild: 'pure-schnitt.jpg',
    galerie: [
      { b: 'pure-a1.jpg', t: 'Freisteller mit Armlehnen-Kissen' },
      { b: 'pure-a2.jpg', t: 'Rückansicht mit losen Rückenkissen' }
    ],
    claim: 'Armloses Basisprogramm auf Tonnentaschenfederkern.',
    intro: 'Pure arbeitet wie Modular ohne feste Armlehnen: extra tiefe ' +
           'Basiselemente mit losen Rückenkissen, ergänzt um Armlehnen-Kissen - ' +
           'und ein durchgehender Tonnentaschenfederkernsitz.',
    tags: ['Tonnentaschenfederkern', 'Frei kombinierbar'],
    gestell: 'Stabiles Grundgestell aus Massivholz und Holzwerkstoffen.',
    sitz: 'Hochwertiger punktelastischer Tonnentaschenfederkernsitz (TTFK), abgedeckt ' +
          'mit Textilvlies, Schaum (mind. RG 35) und Wattevlies.',
    schichten: ['Gestell', 'Tonnentaschenfederkern', 'PUR Schaum', 'Bezugsmaterial'],
    elemente: ['Basiselemente (armlos)', 'Armlehnen-Kissen']
  },



  {
    slug: 'cubetto',
    name: 'Cubetto',
    kollektion: 'Modelle',
    bild: 'cubetto-szene',
    bildStil: 'cover',
    claim: 'Wurfhocker mit Polystyrol-Inlett.',
    intro: 'Cubetto ist der Wurfhocker zum Programm: kompaktes, würfelnahes ' +
           'Format, gefüllt mit einem Inlett aus hochwertigen Polystyrolkugeln - ' +
           'in allen Stoffgruppen beziehbar.',
    tags: ['Hocker', 'Kompakt'],
    gestell: 'Formstabiles Kissenmöbel ohne Rahmengestell.',
    sitz: 'Inlett aus hochwertigen Polystyrolkugeln, Nachlassen der Sitzfestigkeit ' +
          'im Laufe der Nutzung ist materialtypisch.',
    schichten: ['Inlett aus hochwertigen Polystyrolkugeln', 'Bezugsmaterial'],
    elemente: ['Wurfhocker']
  },


  {
    slug: 'positano',
    name: 'Positano',
    kollektion: 'Modelle',
    bild: 'positano-szene',
    bildStil: 'cover',
    schnittBild: 'positano-schnitt.jpg',
    claim: 'Sitztiefe stufenweise verstellbar.',
    intro: 'Positano bringt verstellbare Rückenteile und eine stufenweise ' +
           'verstellbare Sitztiefe mit - bei bewusst niedriger Sitzhöhe. Die ' +
           'breiten Armteile tragen Nierenkissen und Ablagen.',
    tags: ['Funktion', 'Longchair'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, PUR-Schaum.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'PUR Schaum', 'Bezugsmaterial', 'Gleiter'],
    elemente: ['Longchair links / rechts mit Rückenteilverstellung',
               '1-Sitzer mit Rückenteilverstellung', 'Nierenkissen', 'Armteil']
  },



  {
    slug: 'capri',
    name: 'Capri',
    kollektion: 'Modelle',
    bild: 'capri-szene',
    bildStil: 'cover',
    schnittBild: 'capri-schnitt.jpg',
    claim: 'Niedrige Lehne, extra tiefer Sitz.',
    intro: 'Capri ist die flache Lounge-Neuheit: niedrige Gesamthöhe, eine ' +
           'extra tiefe Sitzfläche und breite 1-Sitzer-Elemente.',
    tags: ['XL-Tiefe', 'Kompakt'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern, abgedeckt mit Textilvlies; PUR-Schaum.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'PUR Schaum', 'Bezugsmaterial', 'Gleiter'],
    elemente: ['1-Sitzer mit Armlehne links / rechts (extra breit)',
               '1-Sitzer mit Abschluss rechts']
  },

  {
    slug: 'soho',
    name: 'Soho',
    kollektion: 'Modelle',
    bild: 'soho-szene',
    bildStil: 'cover',
    schnittBild: 'soho-schnitt.jpg',
    galerie: [
      { b: 'soho-a1.jpg', t: 'Metallkufe in Schwarz' }
    ],
    claim: 'Auf Metallkufen, wahlweise mit Trapezelement.',
    intro: 'Soho steht auf schwarzen Metallkufen und ist in zwei ' +
           'Programmvarianten geplant - mit und ohne Trapezelement. Höhe und ' +
           'Sitztiefe unterscheiden sich je nach Ausführung.',
    tags: ['Metallkufe', 'Trapezecke'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern, abgedeckt mit Textilvlies; PUR-Schaum mit ' +
          'Wattevlies-Abdeckung.',
    schichten: ['Gestell', 'Wellenunterfederung', 'PUR Schaum', 'Bezugsmaterial', 'Gleiter'],
    elemente: ['Programmvariante mit Trapezelement (eigene Typenliste)',
               'Programmvariante ohne Trapezelement (eigene Typenliste)']
  },

  {
    slug: 'malibu',
    name: 'Malibu',
    kollektion: 'Modelle',
    bild: 'malibu-szene',
    bildStil: 'cover',
    schnittBild: 'malibu-schnitt.jpg',
    claim: 'Gel-Schaum-Polsterung, Umbauecke.',
    intro: 'Malibu polstert als einziges Modell mit einer zusätzlichen ' +
           'Gel-Schaum-Lage und kombiniert das mit einer Umbauecke und schmalen ' +
           'Armteilen über die volle Tiefe.',
    tags: ['Gel-Schaum', 'Umbauecke'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, PUR-Schaum und Gel-Schaum, ' +
          'abgedeckt mit Wattevlies.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'PUR Schaum', 'Gel-Schaum', 'Bezugsmaterial'],
    elemente: ['Umbauecke links / rechts', '2-Sitzer mit Armteil',
               'Kissen mit Boden']
  },


  {
    slug: 'amalfi',
    name: 'Amalfi',
    kollektion: 'Modelle',
    bild: 'amalfi-szene',
    bildStil: 'cover',
    schnittBild: 'amalfi-schnitt.jpg',
    claim: 'Basiselemente auf Kufe, Tonnentaschenfederkern.',
    intro: 'Amalfi baut auf großen, breiten Basiselementen auf, steht auf ' +
           'einer schwarzen Metallkufe und sitzt durchgehend auf ' +
           'punktelastischem Tonnentaschenfederkern.',
    tags: ['Tonnentaschenfederkern', 'Frei kombinierbar', 'Metallkufe'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Hochwertiger punktelastischer Tonnentaschenfederkernsitz (TTFK), abgedeckt ' +
          'mit Textilvlies, Schaum (mind. RG 35) und Wattevlies.',
    schichten: ['Gestell', 'Tonnentaschenfederkern', 'PUR Schaum', 'Bezugsmaterial'],
    elemente: ['Basiselement in zwei Breiten']
  },

  {
    slug: 'lucca',
    name: 'Lucca',
    kollektion: 'Modelle',
    bild: 'lucca-szene',
    bildStil: 'cover',
    schnittBild: 'lucca-schnitt.jpg',
    claim: 'Kompakt mit Umbauecke und Hockerbank.',
    intro: 'Lucca ist die kompakte Neuheit: Umbauecke, Hockerbank und breite ' +
           '1-Sitzer-Elemente auf kleiner Stellfläche.',
    tags: ['Umbauecke', 'Kompakt'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, Schaumstoff.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'Schaumstoff', 'Bezugsmaterial'],
    elemente: ['1-Sitzer mit Armteil links / rechts (extra breit)', 'Umbauecke',
               'Hockerbank', 'Kissen']
  },

  {
    slug: 'monza',
    name: 'Monza',
    kollektion: 'Modelle',
    bild: 'monza-szene',
    bildStil: 'cover',
    schnittBild: 'monza-schnitt.jpg',
    claim: 'Kompakter Longchair-Klassiker.',
    intro: 'Monza bringt die klassische Longchair-Kombination in kompakter ' +
           'Form - mit klarer Silhouette und schlanken Armteilen.',
    tags: ['Longchair', 'Kompakt'],
    gestell: 'Stabiles Grundgestell, alle tragenden Teile aus Massivholz.',
    sitz: 'Stahl-Wellenfedern mit Abdeckung, PUR-Schaum.',
    schichten: ['Gestell', 'Wellenunterfederung', 'Abdeckung der Wellenfederung',
                'PUR Schaum', 'Bezugsmaterial', 'Fuß / Gleiter'],
    elemente: ['2-Sitzer mit Armlehne links / rechts',
               'Longchair links / rechts']
  }
];
