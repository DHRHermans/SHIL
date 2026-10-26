// Presentation only: the calculators continue to use their original numerical models.
(() => {
  const topicHelp = [
    'a en b zijn de twee korte zijden; c is de schuine zijde. ² betekent: vermenigvuldig de lengte met zichzelf. √ betekent: neem de wortel. Voorbeeld: √(3² + 4²) = 5.',
    'Z is de grootte van de totale tegenwerking in ohm (Ω). R is weerstand. X is het verschil tussen de reactantie van spoelen en condensatoren. Vul hier de grootte van X in, zonder minteken. Voorbeeld: √(30² + 40²) = 50 Ω.',
    'U is de bronspanning. U_R is de spanning over de weerstand. U_X is het verschil tussen de spoelspanning en condensatorspanning; vul hier de grootte in. Alle spanningen staan in volt. Voorbeeld: √(60² + 80²) = 100 V.',
    'P is actief vermogen (W); Q is reactief vermogen (var); S is schijnbaar vermogen (VA). Vul hier de grootte van Q in, zonder minteken. Voorbeeld: √(800² + 600²) = 1000 VA.',
    'X_L hoort bij een spoel; X_C bij een condensator. f is frequentie in Hz, L inductantie in H en C capaciteit in F. π is ongeveer 3,1416. Het C-veld gebruikt µF: de app deelt dat getal door 1 000 000 voordat ze de formule toepast.',
    'U is spanning in volt (V); I is stroom in ampère (A); R is weerstand in ohm (Ω). × betekent maal; / betekent gedeeld door. Voorbeeld: I = 12 / 40 = 0,3 A.',
    'φ (fie) is de grootte van de fasehoek in graden. cos φ is een verhouding tussen 0 en 1. arccos is de omgekeerde cosinus: daarmee vind je de hoek terug. Voorbeeld: arccos(0,8) ≈ 36,87°. Gebruik DEG op een losse rekenmachine.',
    'U_RMS is de effectieve spanning: de waarde die je meestal op een wisselspanningsmeter leest. Û (U met een dakje) is de piek. √2 is ongeveer 1,414. Voorbeeld: 230 × √2 ≈ 325 V.'
  ];
  const addHelp = (selector, id, text) => {
    const anchor = document.querySelector(selector);
    if (!anchor) return;
    const help = document.createElement('p');
    help.className = 'formula-help';
    help.id = id;
    help.textContent = text;
    anchor.after(help);
  };
  addHelp('#formula', 'basicFormulaHelp', topicHelp[index]);
  addHelp('#motorFormula', 'motorFormulaHelp', 'U is spanning in volt; I is stroom in ampère; P₁ is elektrisch ingangsvermogen en P₂ is asvermogen. cos φ is de arbeidsfactor. η (èta) is rendement als verhouding: 88% wordt 0,88. √3 is ongeveer 1,732 en hoort hier bij symmetrische driefasenvoeding. De formule gebruikt vermogen in W; het invoerveld en resultaat gebruiken kW (1 kW = 1000 W).');
  addHelp('#effFormula', 'effFormulaHelp', 'P₁ is wat het toestel opneemt; P₂ wat het nuttig afgeeft. η (èta) is het rendement. Eerst deel je de vermogens: 5,5 / 6,25 = 0,88. Om dat als procent te lezen: 0,88 × 100 = 88%.');
  addHelp('#powerohm .work .formula', 'ohmFormulaHelp', 'U = spanning (V), I = stroom (A), R = weerstand (Ω), P = vermogen (W). I² betekent I × I; U² betekent U × U. Elke regel beschrijft hetzelfde verband, met andere bekende waarden.');
  addHelp('#compTarget', 'compFormulaHelp', 'Q_C is de positieve grootte van het reactieve vermogen dat de condensatorbank levert. C is capaciteit; f frequentie; U netspanning. De kleine C benoemt de condensator en is geen macht. tan en arccos zijn hoekfuncties: de calculator rekent die voor je uit. Bij een driefasenbank is C de capaciteit van één condensator.');
  addHelp('#msFormula', 'speedFormulaHelp', 'nₛ is het toerental van het draaiveld; n dat van de rotor, in omwentelingen per minuut. f is frequentie in Hz; p is het aantal poolparen. s is slip als verhouding: 3% = 0,03. Voorbeeld: nₛ = 60 × 50 / 2 = 1500 min⁻¹.');
  addHelp('#mlTorques', 'loadFormulaHelp', 'T is koppel (draaikracht) in N·m; n is toerental in omwentelingen per minuut. i is de overbrengingsverhouding: bij i = 3 draait de uitgang driemaal trager. η is rendement als verhouding: 95% = 0,95. π is ongeveer 3,1416.');
  addHelp('#fluxSteps', 'fluxFormulaHelp', 'B is fluxdichtheid (T); A is oppervlak (m²); N is het aantal windingen. Φ (fie) is flux per winding; λ (lambda) is de flux van alle windingen samen. θ (theta) is de hoek tussen het veld en de lijn loodrecht op de spoel. ω (omega) is hoeksnelheid, inclusief draairichting. e is de spanning op dit moment; Ê is de piek; E is de effectieve spanning.');
  function updateTopicHelp() {
    const help = document.getElementById('basicFormulaHelp');
    if (help.dataset.topic !== String(index)) {
      help.dataset.topic = String(index);
      help.textContent = topicHelp[index];
    }
  }
  ['click', 'change', 'input'].forEach(event => document.addEventListener(event, updateTopicHelp));
  updateTopicHelp();

  const indexPattern = /([A-Za-zτφηθ])_([A-Za-z]+(?:,[A-Za-z]+)?)/g;
  const svgNS = 'http://www.w3.org/2000/svg';
  function renderText(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, code, pre, textarea, sub, tspan, [data-plain-text]')) return;
    let value = node.data;
    const namedIndices = {
      Tmotor:'T_motor', Tlast:'T_last', nmotor:'n_motor', nlast:'n_last',
      Plast:'P_last', Pmechanisch:'P_mechanisch', Pnet:'P_net',
      Pmotorverlies:'P_motorverlies', Poverbrengingsverlies:'P_overbrengingsverlies',
      Pverlies:'P_verlies', Qmotor:'Q_motor', Qnet:'Q_net', Snet:'S_net', Inet:'I_net',
      'ηoverbrenging':'η_overbrenging', 'φoud':'φ_oud', 'φdoel':'φ_doel', 'φnet':'φ_net'
    };
    for (const [name, indexed] of Object.entries(namedIndices)) value = value.replaceAll(name, indexed);
    // A middle dot between equations is punctuation, not a multiplication.
    if (/=.+ · .+=/.test(value)) value = value.replaceAll(' · ', parent.closest('.formula') ? '\n' : '; ');
    if (!value.includes('_')) {
      if (node.data !== value) node.data = value;
      return;
    }
    const matches = [...value.matchAll(indexPattern)];
    if (!matches.length) return;
    // Native select options cannot contain sub elements: spell the index out instead.
    if (parent.closest('option')) {
      node.data = value.replace(indexPattern, '$1 ($2)');
      return;
    }
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(value.slice(offset, match.index) + match[1]));
      const sub = parent.namespaceURI === svgNS
        ? document.createElementNS(svgNS, 'tspan') : document.createElement('sub');
      if (parent.namespaceURI === svgNS) {
        sub.setAttribute('baseline-shift', 'sub');
        sub.setAttribute('font-size', '70%');
      }
      sub.textContent = match[2];
      fragment.append(sub);
      offset = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(value.slice(offset)));
    node.replaceWith(fragment);
  }
  function render(root) {
    if (root.nodeType === Node.TEXT_NODE) return renderText(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(renderText);
  }
  render(document.body);
  // Also format calculator updates and SVG labels without replacing controls or handlers.
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') render(record.target);
      else record.addedNodes.forEach(render);
    }
  }).observe(document.body, {childList: true, characterData: true, subtree: true});
})();
