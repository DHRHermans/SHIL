# SHIL — Stijn Hermans InzichtLab

Gemaakt door Stijn Hermans.
Export van de huidige versie: 23 oktober 2026.

## Op GitHub Pages plaatsen

1. Pak dit ZIP-bestand uit.
2. Maak op GitHub een nieuwe repository, bijvoorbeeld `elektrolab`.
3. Kies **Add file → Upload files** en upload de uitgepakte bestanden en de map `assets`.
4. Zorg dat `index.html` rechtstreeks in de hoofdmap van de repository staat, niet in een extra submap.
5. Open **Settings → Pages**.
6. Kies bij **Source**: **Deploy from a branch**.
7. Kies de branch **main** en de map **/(root)**. Klik op **Save**.
8. Wacht tot GitHub de website heeft gepubliceerd en open de link die GitHub Pages toont.

Let op: upload de uitgepakte bestanden, niet alleen het ZIP-bestand.
GitHub kan de beschikbaarheid van Pages laten afhangen van je abonnement en de zichtbaarheid van de repository.
Een openbare repository maakt ook de broncode zichtbaar.

## Lokaal openen

Open `index.html` in een recente browser. Bewaar alle bestanden samen en behoud de map `assets`.
Voor een lokale webserver, indien Python aanwezig is: `python -m http.server 8000`.
Open vervolgens http://localhost:8000.
Er is geen installatie of build nodig voor de app.

## Nieuw in deze versie

- Alle draaiende onderwijsmodellen starten rechtsom en bieden rechtsom/linksom. Bij uitwendige tandwielen blijft de uitgang tegengesteld draaien.
- De generator gebruikt een vaste hoekreferentie met ondertekende hoeksnelheid; omkeren keert e bij dezelfde positie om, zonder de RMS-waarde te veranderen.

- Naam en ooglogo SHIL: Stijn Hermans InzichtLab.
- Ohm en vermogen samen: alle zes combinaties van twee waarden uit U, I, R en P; 12 formules en terugrekeningen.
- Faraday met gemiddelde inductiespanning; Lenz met richting van het inductieveld; Lorentz met krachtberekening en richting.
- Basisoverzicht van zelfinductie, energieopslag, tijdsconstanten, transformator en magnetisch veld.
- 5602 rekencontroles uitgevoerd.

## Inhoud

- Formules, driehoeken, sinus/cosinus en Euler met instelbare nulpositie en draairichting.
- Serie- en parallelkringen met AC/DC-keuze en virtuele oscilloscoop.
- Motorberekeningen, kenplaatje, cos φ en condensatorcompensatie.
- Motorsimulatie, magnetische velden, poolparen, nullast en overbrenging.
- Flux- en inductielab met gekoppelde animaties.
- Begeleid leerpad en oefeningen.

## Internet en gegevens

De eigen berekeningen en animaties worden in de browser uitgevoerd.
De ingesloten Falstad/CircuitJS-simulator en externe bronlinks vereisen internet.
Falstad/CircuitJS wordt extern geladen; de simulator zelf is niet in dit pakket opgenomen.
De export neemt waarden over naar Falstad. Wijzigingen daar komen niet automatisch terug in SHIL.
Voortgang in het leerpad wordt lokaal in de browser opgeslagen. Bij een ander webadres of andere browser begint deze voortgang opnieuw.

## Onderwijsmodel

De simulaties gebruiken vereenvoudigde modellen. De uitleg in elk onderdeel beschrijft de voorwaarden.
DC-kringen tonen een stationaire toestand; de eigen oscilloscoop berekent geen inschakelverloop.
De app is een leerhulpmiddel, geen ontwerptool voor een echte elektrische installatie.

## Controles

De export komt uit bronversie SHIL met Ohm & vermogen en magnetische wetten (23 oktober 2026).
De bijbehorende rekencontroles zijn uitgevoerd. Er staan geen accountgegevens, publicatiesleutels of Git-mappen in dit pakket.

Falstad/CircuitJS: Paul Falstad en Iain Sharp. Externe simulator: https://www.falstad.com/circuit/
Broncode CircuitJS (GPL): https://github.com/sharpie7/circuitjs1

## Formules controleren

Voer vanuit de repository `node --test tests/formulas.cjs` uit (Node.js 18 of recenter; geen npm-installatie nodig). De tests controleren de basiscalculators en terugrekeningen, eenheden, AC/DC-kringen en resonantie, motorvermogen, rendement, ster/driehoekcompensatie, Faraday/Lenz/Lorentz, generatorflux, slip, overbrengingen, oscilloscoopfasen en Falstad-export.

De formulegids beschrijft de notatie in gewone taal. `notation.js` zet indices in de brontekst (zoals `U_L` en `U_lijn`) om naar echte onderindices in HTML en SVG, ook na wijzigingen in de calculators. Keuzelijsten schrijven de index tussen haakjes. Machten blijven bovenaan staan. De hoofdformules voor kringen gebruiken geen complexe getallen of somtekens; ze tonen de berekening met de ingevulde waarden. Verdiepende uitleg over j, Σ, absolute waarden en afgeleiden blijft beschikbaar via uitklapbare uitleg. `η` en `s` zijn verhoudingen; procentvelden rekenen hun invoer om met een factor 1/100. Fluxkoppeling gebruikt `λ`, arbeidsfactor `PF`.

Deze controles toetsen de ideale rekenmodellen. Ze valideren geen echte motor of elektrische installatie; veldtekeningen en de interpolatie in het lastmodel blijven onderwijsmodellen. De in de oorspronkelijke export genoemde 5602 controles zijn geen meegeleverde testsuite.

Voor de optionele browsercontrole: start vanuit de repository `python -m http.server 8000 --bind 127.0.0.1` en voer in een tweede terminal `python tests/browser_smoke.py` uit. De ingerichte cloudomgeving bevat Playwright voor Python en Chromium op `/usr/bin/chromium`. Deze controle doorloopt alle 13 tabbladen, representatieve berekeningen, de 9 leerpadstappen en de mobiele navigatie. Externe Falstad-inhoud valt buiten deze controle.
