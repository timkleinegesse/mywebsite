<?php
/**
 * sofatrend – Versand des Kontaktformulars (kontakt.html)
 *
 * Läuft auf jedem Hoster mit PHP ab 7.4. Erwartet einen POST des Formulars.
 * Mit "Accept: application/json" (Formular-JavaScript) antwortet es mit JSON
 * ({"ok":true} oder {"ok":false,"error":"..."}), sonst (Browser ohne
 * JavaScript) mit einer Weiterleitung zurück auf kontakt.html.
 *
 * Spamschutz: Honeypot-Feld, Mindest-Ausfülldauer (Zeitstempel aus dem
 * JavaScript), Herkunftsprüfung (Origin) und ein Limit je IP-Adresse. Die
 * IP-Adresse wird dafür nur gehasht und höchstens eine Stunde im
 * temporären Verzeichnis des Servers gehalten, nicht in die E-Mail geschrieben.
 *
 * Vor dem Livegang anpassen:
 *   - EMPFAENGER: Postfach, das die Anfragen erhalten soll
 *   - ABSENDER:   Adresse der eigenen Domain (sonst lehnen viele Mailserver ab)
 */

const EMPFAENGER = 'info@sofatrend.sk';
const ABSENDER   = 'website@sofatrend.eu';

const LIMIT_ANZAHL   = 5;    // Anfragen je IP ...
const LIMIT_FENSTER  = 3600; // ... innerhalb dieser Sekunden
const MIN_DAUER      = 3;    // Sekunden zwischen Seitenaufruf und Absenden

// Erlaubte Werte der Auswahlfelder (wie in kontakt.html)
const KUNDENSTATUS = ['Neukunde', 'Bestandskunde'];
const ANLIEGEN     = ['Kontaktaufnahme', 'Terminvereinbarung', 'Unterlagen und Muster'];

$willJson = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

header('Cache-Control: no-store');

function antwort(bool $ok, string $fehler = '', int $status = 200): void {
    global $willJson;
    if ($willJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $fehler], JSON_UNESCAPED_UNICODE);
    } else {
        // Ohne JavaScript: zurück zum Formular, dort erscheint die Meldung
        header('Location: kontakt.html?' . ($ok ? 'gesendet=1' : 'fehler=1') . '#anfrage', true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, 'Nur POST erlaubt.', 405);
}

// Herkunft: Formulare fremder Seiten abweisen (Origin fehlt bei manchen
// Browsern und bei direkten Aufrufen, dann greifen die übrigen Prüfungen)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== strtok($_SERVER['HTTP_HOST'] ?? '', ':')) {
    antwort(false, 'Ungültige Herkunft.', 403);
}

// Honeypot: Bots füllen das versteckte Feld aus – stillschweigend "ok"
if (!empty($_POST['website'])) {
    antwort(true);
}

// Zu schnell ausgefüllt: typisch für Bots. Der Zeitstempel kommt aus dem
// Formular-JavaScript; ohne JavaScript fehlt er und wird nicht geprüft.
$start = isset($_POST['_t']) ? (int) $_POST['_t'] : 0;
if ($start > 0 && (time() - intdiv($start, 1000)) < MIN_DAUER) {
    antwort(true);
}

// Limit je IP-Adresse (gehasht, nur im temporären Verzeichnis)
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$limitDatei = sys_get_temp_dir() . '/sofatrend-kontakt-' . substr($ipHash, 0, 32);
$jetzt = time();
$zeiten = [];
if (is_readable($limitDatei)) {
    $zeiten = array_filter(
        array_map('intval', explode(',', (string) file_get_contents($limitDatei))),
        static function (int $t) use ($jetzt): bool { return $t > $jetzt - LIMIT_FENSTER; }
    );
}
if (count($zeiten) >= LIMIT_ANZAHL) {
    antwort(false, 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später erneut oder schreiben Sie uns direkt an ' . EMPFAENGER . '.', 429);
}

$feld = static function (string $name, int $max = 2000): string {
    $v = isset($_POST[$name]) ? (string) $_POST[$name] : '';
    $v = trim(str_replace(["\r", "\0"], '', $v));
    return mb_substr($v, 0, $max);
};

$firma     = $feld('firma', 200);
$name      = $feld('name', 200);
$email     = $feld('email', 200);
$telefon   = $feld('telefon', 100);
$status    = $feld('kundenstatus', 50);
$anliegen  = $feld('anliegen', 100);
$nachricht = $feld('nachricht', 5000);
$einwilligung = !empty($_POST['datenschutz']);

// Einzeilige Felder: keine Zeilenumbrüche (Header-Injection, Betreff)
if (preg_match('/[\n]/', $firma . $name . $email . $telefon)) {
    antwort(false, 'Ungültige Eingabe.', 422);
}
if ($firma === '' || $name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antwort(false, 'Bitte alle Pflichtfelder ausfüllen.', 422);
}
if (!in_array($status, KUNDENSTATUS, true) || !in_array($anliegen, ANLIEGEN, true)) {
    antwort(false, 'Ungültige Auswahl.', 422);
}
if (!$einwilligung) {
    antwort(false, 'Bitte der Datenschutzerklärung zustimmen.', 422);
}

$betreff = 'Anfrage über die Website: ' . $anliegen . ' (' . $status . ')';
$zeilen = [
    'Firma:           ' . $firma,
    'Ansprechpartner: ' . $name,
    'E-Mail:          ' . $email,
    'Telefon:         ' . ($telefon !== '' ? $telefon : '–'),
    'Status:          ' . $status,
    'Anliegen:        ' . $anliegen,
    '',
    'Nachricht:',
    $nachricht,
    '',
    '--',
    'Gesendet am ' . date('d.m.Y H:i') . ' über das Kontaktformular der Website',
];

// Anzeigename RFC-konform kodieren: Kommas, spitze Klammern oder Umlaute im
// Namen können so keine weiteren Empfänger erzeugen
$replyName = mb_encode_mimeheader($name, 'UTF-8', 'B', "\r\n");

$header = [
    'From: sofatrend Website <' . ABSENDER . '>',
    'Reply-To: ' . $replyName . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    // quoted-printable bricht lange Zeilen um (Grenze 998 Zeichen je Zeile)
    'Content-Transfer-Encoding: quoted-printable',
    'X-Mailer: sofatrend-kontaktformular',
];

$ok = mail(
    EMPFAENGER,
    mb_encode_mimeheader($betreff, 'UTF-8', 'B', "\r\n"),
    quoted_printable_encode(implode("\r\n", $zeilen)),
    implode("\r\n", $header),
    '-f' . ABSENDER // Envelope-Absender passend zu SPF/DMARC
);

if ($ok) {
    $zeiten[] = $jetzt;
    @file_put_contents($limitDatei, implode(',', $zeiten), LOCK_EX);
}

antwort($ok, $ok ? '' : 'Der Versand ist fehlgeschlagen.', $ok ? 200 : 500);
