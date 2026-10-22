function efficiencySolve(unknown, values) {
  let {p1, p2, eta} = values;
  if (Object.values(values).some(v => !Number.isFinite(v) || v < 0)) throw Error('Vul geldige, niet-negatieve getallen in.');
  if (unknown === 'eta') {
    if (!(p1 > 0)) throw Error('Het opgenomen vermogen P₁ moet groter zijn dan nul.');
    eta = p2 / p1 * 100;
  } else {
    if (eta > 100) throw Error('Het rendement moet tussen 0 en 100% liggen.');
    if (unknown === 'p1') {
      if (!(eta > 0)) throw Error('Bij 0% rendement kun je P₁ niet uit P₂ berekenen. Kies een rendement groter dan nul.');
      p1 = p2 / (eta / 100);
    } else {
      if (!(p1 > 0)) throw Error('Het opgenomen vermogen P₁ moet groter zijn dan nul.');
      p2 = p1 * eta / 100;
    }
  }
  if (!(p1 > 0)) throw Error('Gebruik een werkpunt met een opgenomen vermogen groter dan nul.');
  if (p2 > p1) throw Error('P₂ kan bij dit toestel niet groter zijn dan P₁. Controleer de waarden en eenheden.');
  if (![p1,p2,eta].every(Number.isFinite)) throw Error('De waarden zijn te groot om te berekenen.');
  return {p1,p2,eta,loss:p1-p2};
}
const effDefaults = {p1:6.25,p2:5.5,eta:88};
const effNames = {p1:'P₁ · opgenomen vermogen',p2:'P₂ · nuttig afgegeven vermogen',eta:'η · rendement'};
let effValues = {...effDefaults};
function effFields() {
  const u=$('#effUnknown').value, unit=$('#effUnit').value;
  $('#effFields').innerHTML=Object.keys(effNames).filter(k=>k!==u).map(k=>`<label>${effNames[k]} (${k==='eta'?'%':unit})<input data-eff="${k}" inputmode="decimal" value="${effValues[k]}" aria-label="${effNames[k]}"></label>`).join('');
  effCalculate();
}
function effCalculate() {
  const u=$('#effUnknown').value, unit=$('#effUnit').value;
  const formulas={eta:'η = P₂ / P₁ × 100%',p1:'P₁ = P₂ / (η / 100)',p2:'P₂ = P₁ × (η / 100)'};
  $('#effFormula').textContent=formulas[u];
  try {
    const v={};document.querySelectorAll('[data-eff]').forEach(el=>{if(!el.value.trim())throw Error('Vul alle bekende waarden in.');v[el.dataset.eff]=num(el.value);});
    const r=efficiencySolve(u,v);effValues={...r};
    $('#effResult').innerHTML=`${effNames[u]}<strong>${fmt(r[u])} ${u==='eta'?'%':unit}</strong>Verliesvermogen Pᵥ = ${fmt(r.loss)} ${unit}`;
    const expr=u==='eta'?`${fmt(r.p2)} / ${fmt(r.p1)} × 100`:u==='p1'?`${fmt(r.p2)} / (${fmt(r.eta)} / 100)`:`${fmt(r.p1)} × (${fmt(r.eta)} / 100)`;
    $('#effSteps').innerHTML=`<li>Gebruik P₁ en P₂ in dezelfde eenheid (${unit}); η wordt ingevuld als percentage.</li><li>${formulas[u]} → ${expr} = <b>${fmt(r[u])} ${u==='eta'?'%':unit}</b>.</li><li>Pᵥ = P₁ − P₂ = ${fmt(r.p1)} − ${fmt(r.p2)} = ${fmt(r.loss)} ${unit}.</li><li>Van elke 100 eenheden opgenomen energie worden ${fmt(r.eta)} nuttig afgegeven en gaan ${fmt(100-r.eta)} verloren.</li>`;
    $('#effVisual').innerHTML=`<div class="metric-flow"><div><b>${fmt(r.p1)} ${unit}</b><span>Opgenomen · P₁</span></div><i aria-hidden="true">→</i><div><b>${fmt(r.p2)} ${unit}</b><span>Nuttig · P₂</span></div><div><b style="color:#a35d29">${fmt(r.loss)} ${unit}</b><span>Verlies · Pᵥ</span></div></div><div style="height:32px;display:flex;border-radius:8px;overflow:hidden;background:#ddd" role="img" aria-label="Nuttig ${fmt(r.eta)} procent; verlies ${fmt(100-r.eta)} procent"><div style="width:${r.eta}%;background:#087e82"></div><div style="width:${100-r.eta}%;background:#c78b58"></div></div><div class="legend"><span style="color:#087e82">Nuttig: ${fmt(r.eta)}%</span><span style="color:#a35d29">Verlies: ${fmt(100-r.eta)}%</span></div>`;
  } catch(e) {$('#effResult').textContent=e.message;$('#effSteps').innerHTML='';$('#effVisual').textContent='Vul geldige waarden in om de vermogensverdeling te bekijken.';}
}
$('#effUnknown').onchange=effFields;
$('#effFields').oninput=effCalculate;
let effPreviousUnit='kW';
$('#effUnit').onchange=()=>{const factor=effPreviousUnit==='kW'?1000:0.001;for(const k of ['p1','p2'])effValues[k]*=factor;effPreviousUnit=$('#effUnit').value;effFields();};
$('#effExample').onclick=()=>{effValues={...effDefaults};effPreviousUnit='kW';$('#effUnit').value='kW';effFields();};
effFields();
