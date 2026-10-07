<?php
/**
 * sofatrend – Versand des Kontaktformulars (kontakt.html)
 *
 * Läuft auf jedem Hoster mit PHP ab 7.4. Erwartet einen POST des Formulars
 * und antwortet mit JSON ({"ok":true} oder {"ok":false,"error":"..."}).
 * Das Formular-JavaScript (assets/js/site.js) weicht bei einem Fehler
 * automatisch auf das E-Mail-Programm des Besuchers aus.
 *
 * Vor dem Livegang anpassen:
 *   - EMPFAENGER: Postfach, das die Anfragen erhalten soll
 *   - ABSENDER:   Adresse der eigenen Domain (sonst lehnen viele Mailserver ab)
 */

const EMPFAENGER = 'info@sofatrend.sk';
const ABSENDER   = 'website@sofatrend.eu';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function antwort(bool $ok, string $fehler = '', int $status = 200): void {
    http_response_code($status);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $fehler], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, 'Nur POST erlaubt.', 405);
}

// Honeypot: Bots füllen das versteckte Feld aus
if (!empty($_POST['website'])) {
    antwort(true);
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

if ($firma === '' || $name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antwort(false, 'Bitte alle Pflichtfelder ausfüllen.', 422);
}
if (!$einwilligung) {
    antwort(false, 'Bitte der Datenschutzerklärung zustimmen.', 422);
}

$betreff = 'Anfrage über die Website: ' . $anliegen . ' (' . $status . ')';
$zeilen = [
    'Firma:          ' . $firma,
    'Ansprechpartner: ' . $name,
    'E-Mail:         ' . $email,
    'Telefon:        ' . ($telefon !== '' ? $telefon : '–'),
    'Status:         ' . $status,
    'Anliegen:       ' . $anliegen,
    '',
    'Nachricht:',
    $nachricht,
    '',
    '--',
    'Gesendet am ' . date('d.m.Y H:i') . ' über das Kontaktformular der Website',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unbekannt'),
];

$header = [
    'From: sofatrend Website <' . ABSENDER . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: sofatrend-kontaktformular',
];

// Header-Injection ausschließen: Reply-To darf keine Zeilenumbrüche enthalten
if (preg_match('/[\r\n]/', $name . $email)) {
    antwort(false, 'Ungültige Eingabe.', 422);
}

$ok = mail(
    EMPFAENGER,
    '=?UTF-8?B?' . base64_encode($betreff) . '?=',
    implode("\n", $zeilen),
    implode("\r\n", $header)
);

antwort($ok, $ok ? '' : 'Der Versand ist fehlgeschlagen.', $ok ? 200 : 500);
