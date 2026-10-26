// Qualitative water analogy. The numbers follow electrical Ohm's law, not a hydraulic model.
(() => {
  const q = id => document.getElementById(id);
  const panel = document.createElement('section');
  panel.id = 'ohmWater';
  panel.className = 'water-lab visual-panel';
  panel.setAttribute('aria-labelledby', 'waterTitle');
  panel.innerHTML = `
    <span class="eyebrow">ZIEN WAT U, I EN R DOEN</span>
    <h3 id="waterTitle">Wet van Ohm: denk aan een waterkraan en tuinslang</h3>
    <p><b>Spanning is zoals drukverschil.</b> Dat duwt de stroming vooruit. <b>Stroom is zoals de hoeveelheid water per seconde.</b> Een bijna dichte kraan of een nauwe slang geeft <b>meer weerstand</b>, waardoor er bij dezelfde druk minder doorstroomt.</p>
    <div class="water-modes" role="group" aria-label="Kies een watervergelijking">
      <button type="button" data-water-mode="tap" aria-pressed="true">Waterkraan</button>
      <button type="button" data-water-mode="hose" aria-pressed="false">Tuinslang</button>
    </div>
    <div id="waterScene"></div>
    <div class="water-controls">
      <label>Drukverschil ↔ spanning U: <output id="waterUOut"></output>
        <input id="waterU" type="range" min="0" max="24" step="1" value="12">
        <small>Links: geen drukverschil. Rechts: meer drukverschil.</small>
      </label>
      <label><span id="waterRLabel"></span>: <output id="waterROut"></output>
        <input id="waterR" type="range" min="10" max="80" step="1" value="40">
        <small id="waterRHint"></small>
      </label>
    </div>
    <div class="water-metrics" aria-live="polite">
      <div><span>Drukverschil ↔ spanning</span><strong id="waterVoltage"></strong></div>
      <div><span>Vernauwing ↔ weerstand</span><strong id="waterResistance"></strong></div>
      <div><span>Doorstroming ↔ stroom</span><strong id="waterCurrent"></strong></div>
    </div>
    <p id="waterEquation" class="formula"></p>
    <p id="waterExplain" class="guide-note" role="status"></p>
    <div class="cap-actions">
      <button type="button" id="waterMorePressure">Verdubbel de druk / spanning</button>
      <button type="button" id="waterMoreResistance">Verdubbel de weerstand</button>
      <button type="button" id="waterReset">Terug naar 12 V en 40 Ω</button>
      <button type="button" id="waterApply">Neem waarden over in de calculator</button>
    </div>
    <details class="guide-detail"><summary>Waar stopt de vergelijking met water?</summary>
      <p>Dit is een vereenvoudigde vergelijking om U, I en R te begrijpen. De getallen horen bij de elektrische formule I = U / R. Het zijn geen waterdrukken in bar, slangmaten of liters per seconde. Een echte kraan en tuinslang volgen niet altijd hetzelfde lineaire verband.</p>
      <p>We vergelijken de <b>hoeveelheid water per seconde</b>, niet alleen de snelheid van een waterstraal. Een sproeikop kan een snellere, dunnere straal maken terwijl er minder water per seconde doorheen gaat. Ook een langere slang kan meer weerstand geven.</p>
      <p>In een elektrische kring moet er een gesloten stroompad zijn. De lading verdwijnt niet uit de draad zoals water uit een open kraan. Spanning is een verschil tussen twee punten. Een weerstand zet elektrische energie om in warmte; stroom wordt niet “opgebruikt”.</p>
    </details>`;
  q('powerohm').querySelector('.work').before(panel);
  let mode = 'tap';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function draw() {
    const U = Number(q('waterU').value), R = Number(q('waterR').value), I = U / R;
    const opening = 1 - (R - 10) / 70;
    const flow = Math.min(I / 2.4, 1);
    const needle = (-225 + U / 24 * 270) * Math.PI / 180;
    const width = 4 + opening * 22;
    const stream = 2 + flow * 16;
    const path = mode === 'tap'
      ? 'M180 135 H390 Q430 135 430 175 V225'
      : 'M180 135 H275 Q305 135 305 175 V205 Q305 255 355 255 H470 Q520 255 520 205 V175 Q520 135 570 135 H640';
    const water = U > 0 ? `<path class="water-flow" d="${path}" fill="none" stroke="#86ecf9" stroke-width="${stream}" stroke-linecap="round" style="animation-duration:${2.4 - flow * 2}s;${reducedMotion.matches ? 'animation:none' : ''}"/>` : '';
    q('waterScene').innerHTML = `<svg viewBox="0 0 720 320" role="img" aria-label="${mode === 'tap' ? 'Waterkraan' : 'Tuinslang'}: ${U === 0 ? 'geen doorstroming' : 'meer druk geeft meer doorstroming; meer vernauwing geeft minder doorstroming'}">
      <rect x="30" y="45" width="150" height="170" rx="15" fill="#eef4f3" stroke="#789b9c" stroke-width="3"/>
      <rect x="40" y="55" width="130" height="150" rx="5" fill="#b1e6ef"/><circle cx="105" cy="109" r="43" fill="white" stroke="#789b9c" stroke-width="3"/><path d="M105 109 L${105 + 31 * Math.cos(needle)} ${109 + 31 * Math.sin(needle)}" stroke="#087e82" stroke-width="5" stroke-linecap="round"/><circle cx="105" cy="109" r="5" fill="#087e82"/>
      <text x="105" y="28" text-anchor="middle">Drukbron</text>
      <text x="105" y="247" text-anchor="middle">Meer druk ↔ meer U</text>
      <path d="${path}" fill="none" stroke="#446e72" stroke-width="${mode === 'hose' ? width + 12 : 40}" stroke-linecap="round"/>
      ${water}
      ${mode === 'tap' && U > 0 ? `<path class="water-flow" d="M430 225 V265" fill="none" stroke="#41b9d3" stroke-width="${stream}" stroke-linecap="round" style="animation-duration:${2.4 - flow * 2}s;${reducedMotion.matches ? 'animation:none' : ''}"/>` : ''}
      ${mode === 'tap' ? `<path d="M315 89 V135" stroke="#aa8155" stroke-width="12"/><path d="M287 85 H343" stroke="#aa8155" stroke-width="12" stroke-linecap="round"/><rect x="303" y="${135 - width / 2}" width="24" height="${width}" rx="3" fill="#b1e6ef" stroke="#aa8155" stroke-width="3"/><text x="320" y="59" text-anchor="middle">${opening > .65 ? 'Kraan verder open' : opening < .25 ? 'Kraan bijna dicht' : 'Kraan deels open'}</text><path d="M385 265 Q430 290 475 265" fill="none" stroke="#789b9c" stroke-width="5"/><text x="555" y="215" text-anchor="middle">${U === 0 ? 'Geen waterstroom' : 'Hoeveelheid per seconde'}</text>` : `<text x="435" y="98" text-anchor="middle">${opening > .65 ? 'Brede slang' : opening < .25 ? 'Nauwe slang' : 'Slang met middelgrote doorgang'}</text><text x="435" y="304" text-anchor="middle">Nauwer ↔ meer R ↔ minder doorstroming bij dezelfde U</text>`}
    </svg>`;
    q('waterUOut').textContent = `${fmt(U)} V`;
    q('waterROut').textContent = `${fmt(R)} Ω`;
    q('waterRLabel').textContent = mode === 'tap' ? 'Kraanstand ↔ weerstand R' : 'Doorgang van de slang ↔ weerstand R';
    q('waterRHint').textContent = mode === 'tap' ? 'Links: verder open, minder weerstand. Rechts: dichter, meer weerstand.' : 'Links: breder, minder weerstand. Rechts: nauwer, meer weerstand.';
    q('waterVoltage').textContent = `U = ${fmt(U)} V`;
    q('waterResistance').textContent = `R = ${fmt(R)} Ω`;
    q('waterCurrent').textContent = `I = ${fmt(I)} A`;
    q('waterEquation').textContent = `Stroom = spanning / weerstand\nI = U / R = ${fmt(U)} / ${fmt(R)} = ${fmt(I)} A`;
    q('waterExplain').textContent = U === 0
      ? 'Zonder drukverschil is er hier geen doorstroming. Elektrisch: bij U = 0 V en een eindige weerstand is I = 0 A.'
      : mode === 'tap'
        ? 'Draai de kraan verder open: de weerstand daalt en er stroomt bij hetzelfde drukverschil meer water per seconde. Elektrisch: bij dezelfde U geeft minder R meer I.'
        : 'Vergelijk een brede en een nauwe slang bij hetzelfde drukverschil. Door de nauwe slang stroomt minder water per seconde. Elektrisch: bij dezelfde U geeft meer R minder I.';
    q('waterMorePressure').disabled = U === 0 || U * 2 > 24;
    q('waterMoreResistance').disabled = R * 2 > 80;
    q('waterApply').disabled = U === 0;
  }
  ['waterU', 'waterR'].forEach(id => q(id).addEventListener('input', draw));
  panel.querySelectorAll('[data-water-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.waterMode;
    panel.querySelectorAll('[data-water-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    draw();
  }));
  q('waterMorePressure').onclick = () => { q('waterU').value = Number(q('waterU').value) * 2; draw(); };
  q('waterMoreResistance').onclick = () => { q('waterR').value = Number(q('waterR').value) * 2; draw(); };
  q('waterReset').onclick = () => { q('waterU').value = 12; q('waterR').value = 40; draw(); };
  q('waterApply').onclick = () => {
    q('opPair').value = 'UR';
    q('opPair').dispatchEvent(new Event('change', {bubbles: true}));
    q('opValue0').value = q('waterU').value;
    q('opValue1').value = q('waterR').value;
    q('opValue1').dispatchEvent(new Event('input', {bubbles: true}));
    q('opResults').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center'});
  };
  const link = document.createElement('button');
  link.type = 'button';
  link.textContent = 'Bekijk Ohm met een waterkraan en tuinslang →';
  link.className = 'water-link';
  link.onclick = () => {
    document.querySelector('#tabs [data-tab="powerohm"]').click();
    panel.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'});
  };
  q('calc').querySelector('article').append(link);
  reducedMotion.addEventListener('change', draw);
  draw();
})();
