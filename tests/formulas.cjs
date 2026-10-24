// Run with: node --test tests/formulas.cjs (no packages required).
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const context = vm.createContext({Intl, Math, Number});
function load(name, end) { vm.runInContext(source(name).split(end)[0], context); }
load('app.js', 'let index=0');
vm.runInContext(source('app.js').split('function solve(')[1].split('function calculate(')[0].replace(/^/, 'function solve('), context);
load('power-ohm.js', '(()=>');
load('motor.js', 'function motorFields(');
load('efficiency.js', 'const effDefaults');
load('kringen.js', 'const kn=');
load('compensation.js', 'const compFields');
load('magnetism.js', '(()=>');
load('flux.js', '(()=>');
load('motor-simulation.js', '// Veldlijnen');
load('motor-load.js', '(()=>');
load('trigonometry.js', '(()=>');
load('oscilloscope.js', 'let kringScopeUpdate');
load('falstad.js', '(()=>');
const run = code => vm.runInContext(code, context);
const near = (a,b) => assert.ok(Math.abs(a-b) <= 1e-9*Math.max(1,Math.abs(b)), `${a} != ${b}`);

test('all basic calculators: every unknown and both frequency bases', () => {
 for (const [index, values] of [
  [0,{a:3,b:4,c:5}], [1,{R:30,X:40,Z:50}], [2,{UR:60,UX:80,U:100}],
  [3,{P:800,Q:600,S:1000}], [5,{U:12,I:.3,R:40}],
  [6,{pf:.8,phi:Math.acos(.8)*180/Math.PI}], [7,{rms:230,peak:230*Math.SQRT2}]
 ]) for(const unknown of Object.keys(values)) {
  const inputs={...values}; delete inputs[unknown];
  near(run(`solve(topics[${index}],${JSON.stringify(unknown)},${JSON.stringify(inputs)}).result`),values[unknown]);
 }
 for(const [unknown, inputs, expected] of [
  ['XL',{f:50,L:.1},10*Math.PI],['L',{f:50,XL:10*Math.PI},.1],
  ['f',{L:.1,XL:10*Math.PI},50],['XC',{f:50,C:100},100/Math.PI],
  ['C',{f:50,XC:100/Math.PI},100],['f',{C:100,XC:100/Math.PI},50]
 ]) near(run(`solve(topics[4],${JSON.stringify(unknown)},${JSON.stringify(inputs)}).result`),expected);
 assert.throws(()=>run('solve(topics[0],"a",{b:6,c:5})'));
 assert.throws(()=>run('solve(topics[5],"I",{U:12,R:0})'));
 assert.throws(()=>run('solve(topics[6],"phi",{pf:1.1})'));
});
test('Ohm and power: six input pairs, scale changes and invalid inputs',()=>{
 for(const scale of [.001,1,1000]) {
  const values={U:12*scale,I:.3*scale,R:40,P:3.6*scale*scale};
  for(const pair of ['UI','UR','IR','PU','PI','PR']) {
   const result=run(`ohmPowerSolve('${pair}',${values[pair[0]]},${values[pair[1]]})`);
   for(const k of Object.keys(values)) near(result[k],values[k]);
  }
 }
 for(const value of [0,-1,Infinity,NaN]) assert.throws(()=>context.ohmPowerSolve('UI',value,1));
});
test('motor: one/three phases, input/shaft power and all inversions',()=>{
 for(const phase of ['1','3']) for(const mode of ['input','shaft']) {
  const U=phase==='3'?400:230,I=10,pf=.82,eta=88;
  const P=(phase==='3'?Math.sqrt(3):1)*U*I*pf*(mode==='shaft'?.88:1)/1000;
  for(const unknown of ['U','I','pf','P']) {
   const v={phase,mode,unknown,U,I,pf,eta,P};delete v[unknown];
   const r=context.motorSolve(v);near(r.value,{U,I,pf,P}[unknown]);
   near(r.S*r.S,r.P1*r.P1+r.Q*r.Q);
  }
 }
});
test('efficiency: fractions, percentages, losses and impossible gain',()=>{
 near(context.efficiencySolve('eta',{p1:6.25,p2:5.5}).eta,88);
 near(context.efficiencySolve('p1',{p2:5.5,eta:88}).p1,6.25);
 near(context.efficiencySolve('p2',{p1:6250,eta:88}).loss,750);
 near(context.efficiencySolve('p2',{p1:10,eta:0}).p2,0);
 assert.throws(()=>context.efficiencySolve('eta',{p1:5,p2:6}));
});
test('AC circuits: independent series/parallel values and signed reactive power',()=>{
 for(const series of [true,false]) {
  const items=[{type:'R',value:30},{type:'L',value:100},{type:'C',value:100}];
  const r=context.kringSolve(items,24,50,series),xl=10*Math.PI,xc=100/Math.PI;
  const expected=series?Math.hypot(30,xl-xc):1/Math.hypot(1/30,1/xc-1/xl);
  near(r.Z,expected);near(r.I,24/expected);near(r.S*r.S,r.P*r.P+r.Q*r.Q);
  for(const type of ['L','C']) {
   const x=context.kringSolve([{type,value:100}],24,50,series);
   near(x.phi,type==='L'?Math.PI/2:-Math.PI/2);
   assert.equal(Math.sign(x.Q),type==='L'?1:-1);
  }
 }
 assert.throws(()=>context.kringSolve([{type:'R',value:1e-200}],1e200,50,true));
});
test('resonance: loaded RLC and lossless LC singularities',()=>{
 for(const series of [true,false]) for(const resistive of [true,false]) {
  const items=[{type:'L',value:100},{type:'C',value:100}];if(resistive)items.unshift({type:'R',value:30});
  const r=context.kringSolve(items,24,1/(2*Math.PI*Math.sqrt(.1*.0001)),series);
  if(resistive){near(r.Z,30);near(r.phi,0);near(r.Q,0);}
  else {assert.equal(r.cancel,true);assert.equal(r.phi,null);assert.equal(r.I,series?Infinity:0);}
 }
});
test('DC: resistor networks, capacitor open circuit and inductor singularity',()=>{
 const rs=[{type:'R',value:10},{type:'R',value:20}];
 near(context.kringSolveDC(rs,12,true).I,.4);near(context.kringSolveDC(rs,12,false).I,1.8);
 near(context.kringSolveDC([{type:'C',value:100}],12,true).I,0);
 assert.equal(context.kringSolveDC([{type:'L',value:100}],12,true).noSteady,true);
 near(context.kringSolveDC([...rs,{type:'L',value:100}],12,true).I,.4);
});
test('compensation: star/delta, target, unity and overcompensation',()=>{
 const v={P2:5.5,eta:88,pf:.82,U:400,f:50,C:0,phase:'3',connection:'delta',target:.95};
 const r=context.compensationSolve(v),star=context.compensationSolve({...v,connection:'star'});
 near(star.Ctarget,3*r.Ctarget);near(star.capU,400/Math.sqrt(3));
 near(context.compensationSolve({...v,C:r.Ctarget}).pfNew,.95);
 near(context.compensationSolve({...v,C:r.Cunity}).pfNew,1);
 assert.ok(context.compensationSolve({...v,C:2*r.Cunity}).phi<0);
 near(r.P,6250);
});
test('Faraday, Lenz and Lorentz: units, magnitudes and direction reversals',()=>{
 near(context.faradayMean({N:100,phi1:5,phi2:0,dt:.1}),5);
 for(const field of [-1,1]) for(const change of [-1,0,1]) near(context.lenzDirection(field,change).induced,-field*change);
 for(const direction of [-1,1]) for(const I of [-2,2]) {
  const r=context.lorentzWire({B:.5,I,length:20,angle:90,direction});near(r.magnitude,.2);near(r.forceY,-.1*I*direction);
 }
 near(context.lorentzWire({B:.5,I:2,length:20,angle:180,direction:1}).magnitude,0);
});
test('generator: flux, winding linkage, RMS, direction and Faraday derivative',()=>{
 const v={B:.5,A:100,N:100,f:1,theta:37,direction:'ccw'};
 const r=context.magneticFluxModel(v);near(r.peakFlux,.005);near(r.rms,Math.PI/Math.SQRT2);
 near(context.magneticFluxModel({...v,direction:'cw'}).emf,-r.emf);
 near(context.magneticFluxModel({...v,stationary:true}).emf,0);
 const dt=1e-6,a=context.magneticFluxModel({...v,theta:v.theta-360*dt}),b=context.magneticFluxModel({...v,theta:v.theta+360*dt});
 near(-(b.linkage-a.linkage)/(2*dt),r.emf);
});
test('motor speed: pole pairs, fractional/percentage slip and blocked rotor',()=>{
 for(let pairs=1;pairs<=8;pairs++) {
  const r=context.motorSpeedModel({pairs,f:50,slip:100/30});
  near(r.ns,3000/pairs);near(r.rotorHz,50/30);
  near(context.motorSpeedModel({pairs,f:50,mode:'rpm',rpm:r.n}).slip,100/30);
 }
 near(context.motorSpeedModel({pairs:2,f:50,slip:100}).n,0);
 near(context.motorSpeedModel({pairs:2,f:50,type:'sync'}).n,1500);
});
test('load model: rated/no-load calibration and power balance across loads',()=>{
 const v={Pn:5.5,etaN:88,pfN:.82,U:400,f:50,pairs:2,s0:.5,sN:100/30,P0:300,I0:4,ratio:3,gearEta:95,Tout:0};
 const zero=context.motorLoadModel(v);near(zero.Pin,300);near(zero.I,4);near(zero.Pshaft,0);
 for(const fraction of [.1,.5,1]) {
  const r=context.motorLoadModel({...v,Tout:zero.maxTout*fraction});
  near(r.Pin,r.Ploss+r.gearLoss+r.Pout);near(r.Pout,v.gearEta/100*r.Pshaft);
  near(r.Tm,fraction*r.Tn);
  if(fraction===1){near(r.Pshaft,5500);near(r.etaMotor,.88);near(r.pf,.82);}
 }
 assert.throws(()=>context.motorLoadModel({...v,Tout:zero.maxTout*2}));
 assert.equal(context.transmissionDirections(1,'gears').output,-1);
});
test('trigonometry and oscilloscope: projections and current lag/lead',()=>{
 for(const angle of [0,30,90,180,270,360]) for(const zero of ['top','right','bottom','left']) for(const direction of ['cw','ccw']) {
  const p=context.trigProject(angle,zero,direction);near(p.x*p.x+p.y*p.y,1);
 }
 for(const type of ['L','C']) for(const series of [true,false]) {
  const v={items:[{type,value:100}],U:24,f:50,series},s=context.kringScopeSignals(v,false,'source');
  near(s.phi,type==='L'?Math.PI/2:-Math.PI/2);
  near(context.kringScopeSample(s,0,50).i,type==='L'?-Math.SQRT2*s.I:Math.SQRT2*s.I);
 }
});
test('Falstad export: peak source amplitude and SI component values',()=>{
 const text=context.kringFalstadText({items:[{type:'L',value:100},{type:'C',value:100}],U:24,f:50,series:true},false);
 assert.ok(text.includes(String(24*Math.SQRT2)));assert.match(text,/l .* 0 0\.1 0/);assert.match(text,/c .* 0 0\.0001/);
});
