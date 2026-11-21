// Straßenbahn-Simulator Dresden – Spiellogik, Bedienung und HUD.
import { NODES, LINES, VEHICLES, SPEECH, DISPATCH } from './data.js';
import { buildNetwork, findPath, edgePoint, angDiff } from './net.js';
import { initDecor, renderFrame, drawMinimap, worldToScreen } from './render.js';
import { Sfx } from './audio.js';

const net = buildNetwork();
const sfx = new Sfx();

const $ = id => document.getElementById(id);
const stage = $('stage');
const canvas = $('game');
const ctx = canvas.getContext('2d');
const mini = $('minimap');
const mctx = mini.getContext('2d');

const view = { w: 400, h: 250, zoom: 1.15, zoomBase: 1.15, zoomMul: 1, camX: 400, camY: 500 };

const STOP_OFFSET = 17;
const CAPACITY = 110;

const G = {
  mode: 'menu',
  paused: false,
  lineKey: null,
  line: null,
  dir: 0,
  route: [],
  stopIndex: 0,
  target: null,
  path: null,
  prefer: new Set(),
  tram: null,
  switches: {},
  signals: {},
  blocked: {},
  obstacles: [],
  waiting: {},
  pax: 0,
  paxTotal: 0,
  capacity: CAPACITY,
  score: 0,
  satisfaction: 70,
  clock: 6 * 3600 + 42 * 60,
  rideTime: 0,
  planned: [],
  delay: 0,
  doors: 'closed',
  doorT: 0,
  transfer: null,
  docked: null,
  atStop: null,
  doorsOpened: false,
  runner: null,
  prompt: null,
  bubbles: [],
  stats: { red: 0, missed: 0, crashes: 0, overspeed: 0, boarded: 0, alighted: 0, stops: 0, km: 0 },
  nextJunction: null,
  switchWrong: false,
  nextSignal: null,
  stopTarget: null,
  stopDistance: 0,
  lever: 0,
  leverDrag: false,
  leverKeyboard: false,
  heldKeys: new Set(),
  ramp: 'in',
  rampT: 0,
  wheelchair: null,
  aiTrams: [],
  nearestTram: null,
  bellUntil: 0,
  emergency: false,
  overspeedT: 0,
  lastEdgeId: null,
  nextEvent: 38,
  nextChatter: 16,
  detour: false,
  detourText: '',
  hornUntil: 0,
  animT: 0,
  sound: true,
  timeScale: 3,
  lastPenaltyAt: 0,
  messageCount: 0,
  summaryShown: false,
  rideEnded: false,
  hud: {},
};

// ---------------------------------------------------------------- Netz-Helfer

function blockedSet() {
  return new Set(Object.keys(G.blocked));
}

function preferFor(route) {
  const set = new Set();
  for (let i = 1; i < route.length; i++) {
    const link = (net.adj.get(route[i - 1]) || []).find(l => l.to === route[i]);
    if (link) set.add(link.edge.id);
  }
  return set;
}

function straightest(nodeId, incoming, options) {
  const pIn = edgePoint(incoming, incoming.a === nodeId ? incoming.b : incoming.a, incoming.len - 1);
  let best = options[0];
  let bestD = Infinity;
  for (const opt of options) {
    const pOut = edgePoint(opt.edge, nodeId, Math.min(14, opt.edge.len));
    const d = Math.abs(angDiff(pIn.ang, pOut.ang));
    if (d < bestD) { bestD = d; best = opt; }
  }
  return best;
}

function junctionDegree(nodeId) {
  return net.degree.get(nodeId) || 0;
}

function plannedEdgeFrom(nodeId) {
  // Ist der Knoten selbst die nächste Haltestelle, zählt die Strecke danach.
  let target = G.target;
  if (nodeId === G.target) {
    const i = G.route.indexOf(nodeId);
    target = i >= 0 ? G.route[i + 1] : null;
  }
  if (!target) return null;
  const p = findPath(net, nodeId, target, { blocked: blockedSet(), prefer: G.prefer });
  return p && p.edges[0] ? p.edges[0] : null;
}

// ---------------------------------------------------------------- Start / Ende

function buildMenu() {
  const grid = $('lineGrid');
  grid.innerHTML = '';
  for (const [key, line] of Object.entries(LINES)) {
    const from = NODES[line.route[0]].name;
    const to = NODES[line.route[line.route.length - 1]].name;
    const card = document.createElement('button');
    card.className = 'linecard';
    card.innerHTML = `
      <span class="no" style="background:${line.color}">${line.label}</span>
      <span class="lc-main">
        <span class="lc-route">${from} ↔ ${to}</span>
        <span class="lc-meta">${String(line.km).replace('.', ',')} km · ${line.min} min · ${line.vehicle}</span>
      </span>`;
    card.addEventListener('click', () => showDirections(key));
    grid.appendChild(card);
  }
}

function showDirections(key) {
  const line = LINES[key];
  const from = NODES[line.route[0]].name;
  const to = NODES[line.route[line.route.length - 1]].name;
  G.lineKey = key;
  $('dirTitle').innerHTML = `Linie <b>${line.label}</b> – welche Richtung?`;
  const btns = $('dirBtns');
  btns.innerHTML = '';
  const b1 = document.createElement('button');
  b1.className = 'btn primary';
  b1.textContent = `→ ${to}`;
  b1.addEventListener('click', () => startRide(key, 0));
  const b2 = document.createElement('button');
  b2.className = 'btn primary';
  b2.textContent = `→ ${from}`;
  b2.addEventListener('click', () => startRide(key, 1));
  btns.appendChild(b1);
  btns.appendChild(b2);
  $('dirMenu').classList.add('on');
  $('dirMenu').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function startRide(key, dir) {
  const line = LINES[key];
  const route = dir === 0 ? [...line.route] : [...line.route].reverse();
  sfx.ensure();

  G.mode = 'running';
  G.paused = false;
  G.lineKey = key;
  G.line = line;
  G.dir = dir;
  G.route = route;
  G.stopIndex = 0;
  G.target = route[1];
  G.prefer = preferFor(route);
  G.switches = {};
  G.signals = {};
  G.blocked = {};
  G.obstacles = [];
  G.waiting = {};
  G.score = 0;
  G.satisfaction = 70;
  G.clock = 6 * 3600 + 42 * 60;
  G.rideTime = 0;
  G.pax = 2 + Math.floor(Math.random() * 14);
  G.paxTotal = G.pax;
  G.doors = 'closed';
  G.doorT = 0;
  G.transfer = null;
  G.docked = route[0];
  G.atStop = route[0];
  G.doorsOpened = false;
  G.dockEdge = null;
  G.dockS = 6;
  G.runner = null;
  G.prompt = null;
  G.detour = false;
  G.detourText = '';
  G.stats = { red: 0, missed: 0, crashes: 0, overspeed: 0, boarded: 0, alighted: 0, stops: 0, km: 0 };
  G.nextJunction = null;
  G.switchWrong = false;
  G.nextSignal = null;
  G.overspeedT = 0;
  G.nextEvent = 30 + Math.random() * 18;
  G.nextChatter = 18 + Math.random() * 12;
  G.rideEnded = false;
  G.summaryShown = false;
  G.hornUntil = 0;
  G.bellUntil = 0;
  G.emergency = false;
  G.lever = 0;
  G.leverDrag = false;
  G.leverKeyboard = false;
  G.heldKeys.clear();
  G.ramp = 'in';
  G.rampT = 0;
  G.wheelchair = null;
  G.nearestTram = null;

  for (const id of route) {
    const n = NODES[id];
    let count = 2 + Math.floor(Math.random() * 9);
    if (n.major) count += 4;
    if (n.terminal) count += 3;
    if (G.blocked[id]) count = 0;
    G.waiting[id] = count;
  }
  G.waiting[route[0]] = 4 + Math.floor(Math.random() * 8);

  const first = findPath(net, route[0], route[1], { prefer: G.prefer });
  G.path = first;
  const firstEdge = first.edges[0];
  G.tram = { edge: firstEdge, from: route[0], to: route[1], s: 6, speed: 0, power: 0, brake: 0, hdg: 0 };
  G.dockEdge = firstEdge.id;
  G.lastEdgeId = firstEdge.id;
  spawnAiTrams(4);

  G.planned = computePlanned(route);
  const p = edgePoint(firstEdge, route[0], G.tram.s);
  view.camX = p.x + (view.biasPx ? view.biasPx.x / view.zoom : 0);
  view.camY = p.y + (view.biasPx ? view.biasPx.y / view.zoom : 0);

  $('menu').classList.add('hidden');
  $('summary').classList.add('hidden');
  $('pause').classList.add('hidden');
  $('help').classList.add('hidden');
  $('lineBadge').textContent = line.label;
  $('lineBadge').style.background = line.color;
  $('destName').textContent = NODES[route[route.length - 1]].name;
  $('routeTitle').textContent = `Linie ${line.label} · Richtung ${NODES[route[route.length - 1]].name}`;
  buildRouteList();
  clearMessages();
  clearBubbles();
  pushMsg(`Kurs übernommen: Linie ${line.label} nach ${NODES[route[route.length - 1]].name}. Türen öffnen zum Einsteigen.`, 'radio');
  addBubble(p.x, p.y + 12, 'Abfahrt!', 'good', 2600, true);
  G.hud = {};
  updateHUD();
}

function computePlanned(route) {
  const planned = [0];
  let t = 0;
  for (let i = 1; i < route.length; i++) {
    const p = findPath(net, route[i - 1], route[i], { prefer: G.prefer });
    const dist = p ? p.edges.reduce((s, e) => s + e.len, 0) : 500;
    t += dist / (38 / 3.6) + 11;
    planned.push(t);
  }
  return planned;
}

function finishRide(reason) {
  if (G.mode !== 'running') return;
  G.rideEnded = true;
  G.mode = 'summary';
  G.summaryShown = true;
  G.runner = null;
  G.prompt = null;
  hidePrompt();
  sfx.chime();
  showSummary(reason);
}

function showSummary(reason) {
  const s = G.stats;
  const pax = G.paxTotal;
  const end = reason || 'Fahrt beendet';
  $('summaryLead').textContent = `${end} · Linie ${G.line ? G.line.label : ''} · ${G.route.length ? NODES[G.route[0]].name + ' → ' + NODES[G.route[G.route.length - 1]].name : ''}`;
  const rows = [
    ['Punkte', G.score, G.score >= 150 ? 'good' : G.score < 0 ? 'bad' : ''],
    ['Fahrgäste befördert', pax, ''],
    ['Halte bedient', s.stops, ''],
    ['Pünktlichkeit', `${Math.max(0, Math.round(100 - Math.abs(G.delay) / 1.2))} %`, ''],
    ['Signalvergehen', s.red, s.red ? 'bad' : ''],
    ['Haltestellen verpasst', s.missed, s.missed ? 'bad' : ''],
    ['Vorfälle', s.crashes, s.crashes ? 'bad' : ''],
    ['Strecke', `${(s.km).toFixed(1)} km`, ''],
    ['Zufriedenheit', `${Math.round(G.satisfaction)} %`, G.satisfaction > 65 ? 'good' : 'bad'],
  ];
  $('summaryGrid').innerHTML = rows.map(([k, v, cls]) => `
    <div class="sbox ${cls}"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  let grade = 'Fahrgastbeauftragter in Ausbildung';
  if (G.score > 260) grade = 'Dienstlicher Leiter der Leitstelle';
  else if (G.score > 170) grade = 'Erfahrener Kursfahrer';
  else if (G.score > 90) grade = 'Solider Straßenbahnfahrer';
  else if (G.score > 20) grade = 'Fahrschüler mit Potenzial';
  $('summaryGrade').textContent = `Bewertung: ${grade}`;
  $('summary').classList.remove('hidden');
}

function toMenu() {
  G.mode = 'menu';
  G.tram = null;
  G.path = null;
  G.route = [];
  G.nextJunction = null;
  G.prompt = null;
  G.runner = null;
  clearBubbles();
  clearMessages();
  $('summary').classList.add('hidden');
  $('pause').classList.add('hidden');
  $('menu').classList.remove('hidden');
  $('dirMenu').classList.remove('on');
}

// ---------------------------------------------------------------- Fahrdynamik

function update(dt) {
  G.rideTime += dt;
  G.clock += dt;
  const t = G.tram;
  if (!t) return;

  updateLever(dt);
  updateDoors(dt);
  updateRunner(dt);
  updatePrompt(dt);
  updateRamp(dt);
  updateWheelchair(dt);
  updateAiTrams(dt);

  const doorsClosed = G.doors === 'closed';
  const canPull = doorsClosed && G.ramp === 'in';
  if (G.lever > 0.06 && !canPull && G.animT - (G.lastDoorWarn || 0) > 3) {
    G.lastDoorWarn = G.animT;
    pushMsg(G.ramp !== 'in'
      ? 'Rampe erst einfahren [R] – die Bahn fährt sonst nicht los.'
      : 'Türen sind noch offen – die Türverriegelung verhindert die Fahrt.', 'warn');
  }
  t.power = canPull ? Math.max(0, G.lever) : 0;
  t.brake = Math.max(0, -G.lever);

  let a = 2.0 * t.power - 2.9 * t.brake;
  if (G.emergency) a -= 3.8;
  if (t.speed > 0.08) a -= 0.15;
  if (t.speed <= 0 && a < 0) a = 0;
  t.speed = Math.max(0, t.speed + a * dt);
  if (G.emergency && t.speed < 0.02) t.speed = 0;

  const vmax = t.edge.vmax / 3.6;
  if (t.speed > vmax + 1.5) t.speed = Math.max(vmax + 1.5, t.speed - 3.0 * dt);

  if (t.speed * 3.6 > t.edge.vmax + 7) {
    G.overspeedT += dt;
    if (G.overspeedT > 1.5 && G.lastEdgeId !== 'speed:' + t.edge.id) {
      G.stats.overspeed++;
      penalty(8, `Zu schnell! Erlaubt sind ${t.edge.vmax} km/h.`);
      G.lastEdgeId = 'speed:' + t.edge.id;
    }
  } else {
    G.overspeedT = 0;
  }

  if (t.edge.kind === 'bridge' && t.speed > 10) {
    // Brücken sind ruhig zu befahren – kein Zwang, nur Hinweis über HUD
  }

  // Position
  let move = t.speed * dt;
  G.stats.km += move / 1000;
  while (move > 0.0001) {
    const rest = t.edge.len - t.s;
    if (move < rest) {
      t.s += move;
      move = 0;
    } else {
      t.s = t.edge.len;
      move -= rest;
      const ok = arriveAtNode();
      if (!ok) break;
      if (t.edge.len < 0.5) break;
    }
  }
  if (G.mode !== 'running') return;

  // Einmal losgefahren, gilt der Halt als verlassen
  if (G.docked && G.tram && (G.dockEdge !== G.tram.edge.id || G.tram.s > G.dockS + 22)) {
    G.docked = null;
    G.atStop = null;
    G.doorsOpened = false;
  }

  // Dock-Erkennung an der Zielhaltestelle
  if (G.target && t.to === G.target && G.docked !== G.target) {
    const stopS = t.edge.len - STOP_OFFSET;
    if (t.speed < 0.45 && t.s > stopS - 11 && t.s < t.edge.len - 0.5) {
      dockAt(G.target);
    }
  }

  updateStopTarget();
  updateNextJunction();
  updateSignals();
  updateEvents(dt);
  updateObstacles(dt);
  updateCamera(dt);
  G.animT += dt;
  updateDelay();
}

function arriveAtNode() {
  const t = G.tram;
  const node = t.to;
  const incoming = t.edge;
  const isJunction = junctionDegree(node) >= 3;

  // Signale
  const sigKey = `${node}|${incoming.id}`;
  const sig = G.signals[sigKey];
  if (isJunction && sig && sig.aspect === 'red' && t.speed > 0.7) {
    G.stats.red++;
    penalty(25, `Signalvergehen: Hp0 an der Weiche ${NODES[node].name} überfahren!`);
    t.speed = 0;
    t.power = 0;
    sfx.buzz();
    addBubbleAtNode(node, 'Das war rot!', 'warn');
  }

  if (node === G.target) {
    evaluateStop(node);
    if (G.mode !== 'running') return false;
  }

  // Sackgasse / Endstation ohne Anschluss
  let options = (net.adj.get(node) || []).filter(l => l.edge.id !== incoming.id && !G.blocked[l.edge.id]);
  if (!options.length) {
    const back = (net.adj.get(node) || []).find(l => l.edge.id === incoming.id);
    if (!back) return false;
    G.tram = { ...t, edge: back.edge, from: node, to: back.to, s: 0 };
    G.path = { nodes: [node, back.to], edges: [back.edge] };
    pushMsg('Wendemöglichkeit: Die Bahn setzt zurück.', 'info');
    return true;
  }

  const planned = plannedEdgeFrom(node);
  let chosen = options.find(l => l.edge.id === G.switches[node]);
  if (!chosen) chosen = straightest(node, incoming, options);
  if (planned && chosen.edge.id !== planned.id) {
    addBubbleAtNode(node, 'Falsche Weiche!', 'warn');
    pushMsg(`Weiche ${NODES[node].name} falsch gestellt – du fährst über ${NODES[chosen.to].name}.`, 'warn');
    sfx.buzz();
  }

  const rest = findPath(net, chosen.to, G.target, { blocked: blockedSet(), prefer: G.prefer });
  G.path = {
    nodes: [node, chosen.to, ...(rest ? rest.nodes.slice(1) : [])],
    edges: [chosen.edge, ...(rest ? rest.edges : [])],
  };
  t.edge = chosen.edge;
  t.from = node;
  t.to = chosen.to;
  t.s = 0;
  delete G.switches[node];
  delete G.signals[sigKey];
  return true;
}

function dockAt(nodeId) {
  G.docked = nodeId;
  G.atStop = nodeId;
  G.doorsOpened = false;
  G.dockEdge = G.tram.edge.id;
  G.dockS = G.tram.s;
  const n = NODES[nodeId];
  if (!G.waiting[nodeId]) G.waiting[nodeId] = 2 + Math.floor(Math.random() * 8);
  G.ramp = 'in';
  G.rampT = 0;
  maybeWheelchair(nodeId);
  sfx.bell();
  pushMsg(`Halt ${n.name}. Türen öffnen mit [D].`, 'info');
  if (Math.random() < 0.45) {
    addBubbleAtNode(nodeId, pick(SPEECH), '', 3600);
  }
  $('btnDoors').classList.add('alert');
}

function evaluateStop(nodeId) {
  const wasDocked = G.docked === nodeId;
  const plannedTime = G.planned[Math.min(G.planned.length - 1, G.stopIndex + 1)] || 0;
  const delay = G.rideTime - plannedTime;
  if (wasDocked) {
    G.stats.stops++;
    G.satisfaction = Math.min(100, G.satisfaction + 2);
    G.score += 10;
    if (!G.doorsOpened) {
      G.score -= 8;
      pushMsg('Halt ohne Türöffnung – Fahrgäste sind verwirrt.', 'warn');
    }
    if (delay <= 30) {
      G.score += 7;
      pushMsg(`Pünktlich in ${NODES[nodeId].name}.`, 'good');
    } else if (delay > 120) {
      G.score -= 5;
      pushMsg(`${Math.round(delay / 60)} Minuten Verspätung in ${NODES[nodeId].name}.`, 'warn');
    }
  } else {
    G.stats.missed++;
    G.satisfaction = Math.max(0, G.satisfaction - 9);
    G.score -= 18;
    pushMsg(`Haltestelle ${NODES[nodeId].name} verpasst!`, 'warn');
    addBubbleAtNode(nodeId, 'Hey! Wir wollten raus!', 'warn');
  }
  G.docked = null;
  G.atStop = null;
  G.doorsOpened = false;
  $('btnDoors').classList.remove('alert');
  G.stopIndex++;
  if (G.stopIndex >= G.route.length - 1) {
    G.target = null;
    finishRide('Endstation erreicht');
    return;
  }
  G.target = G.route[G.stopIndex + 1];
  G.waiting[nodeId] = 0;
}

// ---------------------------------------------------------------- Fahrschalter

function updateLever(dt) {
  if (G.leverDrag) return;
  const up = G.heldKeys.has('w') || G.heldKeys.has('arrowup');
  const down = G.heldKeys.has('s') || G.heldKeys.has('arrowdown');
  const dir = (up ? 1 : 0) - (down ? 1 : 0);
  if (dir) {
    G.leverKeyboard = true;
    G.lever = Math.max(-1, Math.min(1, G.lever + dir * dt * 1.35));
  } else if (G.leverKeyboard) {
    // Tasten losgelassen: Hebel läuft zurück in Neutral
    const step = dt * 2.6;
    if (Math.abs(G.lever) <= step) { G.lever = 0; G.leverKeyboard = false; }
    else G.lever -= Math.sign(G.lever) * step;
  }
}

// ---------------------------------------------------------------- Rollstuhl & Rampe

function isAccessible(nodeId) {
  const n = NODES[nodeId];
  return !!(n && (n.major || n.terminal));
}

function maybeWheelchair(nodeId) {
  G.wheelchair = null;
  if (Math.random() > 0.55) return;
  const mode = (G.pax > 4 && Math.random() < 0.55) ? 'alight' : 'board';
  const accessible = isAccessible(nodeId);
  G.wheelchair = { mode, node: nodeId, accessible, served: false, t: 0 };
  addBubbleAtNode(nodeId,
    mode === 'alight' ? 'Ich muss hier mit dem Rollstuhl raus!' : 'Ich komme mit dem Rollstuhl – Rampe?',
    'warn', 5600);
  pushMsg(mode === 'alight'
    ? 'Ein Rollstuhlfahrer möchte aussteigen.'
    : 'Ein Rollstuhlfahrer wartet an der Haltestelle.', 'info');
  if (!accessible) {
    pushMsg(`${NODES[nodeId].name} ist nicht barrierefrei – Rampe an der ersten Tür mit [R] ausklappen.`, 'warn');
  }
}

function updateRamp(dt) {
  if (G.ramp === 'moving') {
    G.rampT += dt;
    if (G.rampT > 1.1) {
      G.ramp = 'out';
      G.rampT = 0;
      pushMsg('Rampe ausgefahren – erste Tür ist frei.', 'good');
      sfx.doorChime();
    }
  } else if (G.ramp === 'retracting') {
    G.rampT += dt;
    if (G.rampT > 1.1) {
      G.ramp = 'in';
      G.rampT = 0;
      pushMsg('Rampe eingefahren.', 'info');
      sfx.doorWarning();
    }
  }
}

function toggleRamp() {
  if (G.mode !== 'running') return;
  if (!G.docked) { pushMsg('Die Rampe lässt sich nur an der Haltestelle ausklappen.', 'warn'); return; }
  if (G.ramp === 'moving' || G.ramp === 'retracting') return;
  if (G.doors !== 'open') {
    pushMsg('Erst die Türen öffnen [D], dann die Rampe ausklappen.', 'warn');
    return;
  }
  if (G.ramp === 'in') {
    G.ramp = 'moving';
    G.rampT = 0;
    pushMsg('Rampe wird ausgeklappt…', 'info');
    sfx.tone(300, 0.28, 'square', 0.16, 180);
  } else {
    G.ramp = 'retracting';
    G.rampT = 0;
    pushMsg('Rampe wird eingefahren…', 'info');
    sfx.tone(200, 0.28, 'square', 0.14, 320);
  }
}

function updateWheelchair(dt) {
  const w = G.wheelchair;
  if (!w || w.served) return;
  if (G.doors !== 'open') return;
  if (!w.accessible && G.ramp !== 'out') return;
  w.t += dt;
  if (w.t < 2.4) return;
  w.served = true;
  if (w.mode === 'board') {
    if (G.pax < G.capacity) { G.pax++; G.paxTotal++; G.stats.boarded++; }
    G.waiting[w.node] = Math.max(0, (G.waiting[w.node] || 0) - 1);
  } else {
    G.pax = Math.max(0, G.pax - 1);
    G.stats.alighted++;
  }
  G.score += 15;
  G.satisfaction = Math.min(100, G.satisfaction + 5);
  pushMsg(`Rollstuhlfahrer sicher ${w.mode === 'board' ? 'eingestiegen' : 'ausgestiegen'}. +15 XP`, 'good');
  addBubbleAtNode(w.node, 'Danke!', 'good', 2600);
  sfx.doorChime();
  G.wheelchair = null;
  if (G.ramp === 'out') { G.ramp = 'retracting'; G.rampT = 0; }
}

// ---------------------------------------------------------------- Andere Bahnen

function makeAiTram() {
  const pp = G.tram ? edgePoint(G.tram.edge, G.tram.from, G.tram.s) : { x: 0, y: 0 };
  const all = net.edges;
  let edge = all[Math.floor(Math.random() * all.length)];
  for (let i = 0; i < 40; i++) {
    const cand = all[Math.floor(Math.random() * all.length)];
    const m = edgePoint(cand, cand.a, cand.len / 2);
    if (Math.hypot(m.x - pp.x, m.y - pp.y) < 900) { edge = cand; break; }
  }
  const forward = Math.random() < 0.5;
  const keys = Object.keys(LINES);
  const lk = keys[Math.floor(Math.random() * keys.length)];
  return {
    edge,
    from: forward ? edge.a : edge.b,
    to: forward ? edge.b : edge.a,
    s: 10 + Math.random() * Math.max(1, edge.len - 20),
    speed: 8 + Math.random() * 5,
    lineKey: lk,
    color: LINES[lk].color,
    label: LINES[lk].label,
    cooldown: 0,
    pos: edgePoint(edge, forward ? edge.a : edge.b, 10),
    ang: 0,
  };
}

function spawnAiTrams(n = 4) {
  G.aiTrams = [];
  for (let i = 0; i < n; i++) G.aiTrams.push(makeAiTram());
}

function updateAiTrams(dt) {
  if (!G.tram) return;
  const pp = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
  for (let i = 0; i < G.aiTrams.length; i++) {
    const ai = G.aiTrams[i];
    let pos = edgePoint(ai.edge, ai.from, Math.min(ai.s, ai.edge.len));
    if (Math.hypot(pos.x - pp.x, pos.y - pp.y) > 1300) { G.aiTrams[i] = makeAiTram(); continue; }
    ai.s += ai.speed * dt;
    if (ai.s >= ai.edge.len) {
      const opts = (net.adj.get(ai.to) || []).filter(l => l.edge.id !== ai.edge.id && !G.blocked[l.edge.id]);
      if (!opts.length) { G.aiTrams[i] = makeAiTram(); continue; }
      const link = opts[Math.floor(Math.random() * opts.length)];
      ai.edge = link.edge;
      ai.from = ai.to;
      ai.to = link.to;
      ai.s = 0;
      pos = edgePoint(ai.edge, ai.from, 0);
    }
    ai.pos = pos;
    ai.ang = pos.ang;
    ai.cooldown = Math.max(0, ai.cooldown - dt);
  }
  let best = null;
  let bestD = Infinity;
  for (const ai of G.aiTrams) {
    if (!ai.pos) continue;
    const d = Math.hypot(ai.pos.x - pp.x, ai.pos.y - pp.y);
    if (d < bestD) { bestD = d; best = ai; }
  }
  G.nearestTram = best && bestD < 130 ? { ai: best, dist: bestD } : null;
}

function addBubbleAtTram(text, kind = '', ms = 2400) {
  if (!G.tram) return;
  const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
  addBubble(p.x, p.y + 12, text, kind, ms, true);
}

function greet() {
  if (G.mode !== 'running') return;
  if (!G.nearestTram) {
    bell();
    pushMsg('Keine Kollegen in der Nähe – erst näher heranfahren.', 'info');
    return;
  }
  const ai = G.nearestTram.ai;
  if (ai.cooldown > 0) { pushMsg('Die Kollegen wurden gerade schon gegrüßt.', 'info'); return; }
  ai.cooldown = 45;
  G.score += 8;
  G.satisfaction = Math.min(100, G.satisfaction + 1);
  bell();
  addBubble(ai.pos.x, ai.pos.y + 9, pick(['Guten Tag!', 'Hallo Kollege!', 'Grüß Gott!', 'Schöne Fahrt!']), 'good', 3000);
  addBubbleAtTram('Guten Tag!', 'good', 2000);
  pushMsg('Kollege gegrüßt. +8 XP', 'good');
}

function updateStopTarget() {
  const t = G.tram;
  if (!t) return;
  if (G.target && t.to === G.target && G.docked !== G.target) {
    const p = edgePoint(t.edge, t.from, t.edge.len - STOP_OFFSET);
    G.stopTarget = { x: p.x, y: p.y, ang: p.ang };
    G.stopDistance = t.edge.len - STOP_OFFSET - t.s;
  } else if (G.docked) {
    const p = edgePoint(t.edge, t.from, t.s);
    G.stopTarget = { x: p.x, y: p.y, ang: p.ang };
    G.stopDistance = 0;
  } else {
    G.stopTarget = null;
    G.stopDistance = 0;
  }
}

function updateNextJunction() {
  const t = G.tram;
  G.nextJunction = null;
  G.switchWrong = false;
  if (!t) return;
  const nodeId = t.to;
  if (junctionDegree(nodeId) < 3) return;
  const dist = t.edge.len - t.s;
  if (dist > 190) return;
  const options = (net.adj.get(nodeId) || []).filter(l => l.edge.id !== t.edge.id && !G.blocked[l.edge.id]);
  if (options.length < 2) return;
  const planned = plannedEdgeFrom(nodeId);
  let selected = G.switches[nodeId];
  if (!options.some(o => o.edge.id === selected)) selected = null;
  if (!selected) {
    const def = straightest(nodeId, t.edge, options);
    selected = def ? def.edge.id : options[0].edge.id;
  }
  G.nextJunction = {
    node: nodeId,
    fromEdge: t.edge.id,
    dist,
    options: options.map(o => ({ edgeId: o.edge.id, to: o.to, label: NODES[o.to].name })),
    selectedEdgeId: selected,
    plannedEdgeId: planned ? planned.id : null,
  };
  G.switchWrong = !!(planned && selected !== planned.id);
  // Weiche merken, damit sie beim Einfahren gestellt ist
  if (!G.switches[nodeId]) G.switches[nodeId] = selected;
}

function updateSignals() {
  const t = G.tram;
  G.nextSignal = null;
  if (!t) return;
  const nodeId = t.to;
  if (junctionDegree(nodeId) < 3) return;
  const key = `${nodeId}|${t.edge.id}`;
  if (!G.signals[key]) {
    G.signals[key] = {
      aspect: 'red',
      greenAt: G.rideTime + 2.2 + Math.random() * 3,
      node: nodeId,
      edge: t.edge.id,
    };
  }
  const sig = G.signals[key];
  const planned = plannedEdgeFrom(nodeId);
  const selected = G.nextJunction ? G.nextJunction.selectedEdgeId : null;
  const wrong = planned && selected && selected !== planned.id;
  if (wrong) {
    sig.aspect = 'red';
  } else if (G.rideTime > sig.greenAt) {
    const chosen = selected ? (net.adj.get(nodeId) || []).find(l => l.edge.id === selected) : null;
    let sharp = false;
    if (chosen) {
      const pIn = edgePoint(t.edge, t.from, t.edge.len - 1);
      const pOut = edgePoint(chosen.edge, nodeId, Math.min(14, chosen.edge.len));
      sharp = Math.abs(angDiff(pIn.ang, pOut.ang)) > 0.55;
    }
    sig.aspect = sharp ? 'hp2' : 'hp1';
  } else {
    sig.aspect = 'red';
  }
  if (t.edge.len - t.s < 185) {
    G.nextSignal = { aspect: sig.aspect, dist: t.edge.len - t.s, node: nodeId };
  }
}

// ---------------------------------------------------------------- Türen

function toggleDoors() {
  if (G.mode !== 'running') return;
  const t = G.tram;
  if (!t) return;
  // Doppelte Tastendrücke direkt hintereinander abfangen
  const now = performance.now();
  if (now - (G.lastDoorToggle || 0) < 400) return;
  G.lastDoorToggle = now;
  if (G.doors === 'opening' || G.doors === 'closing') return;
  if (G.doors === 'open') { beginClose(); return; }
  if (!G.docked) {
    pushMsg('Zum Öffnen der Türen erst an der Haltestelle halten.', 'warn');
    return;
  }
  if (t.speed > 0.35) {
    pushMsg('Die Bahn rollt noch – erst anhalten.', 'warn');
    return;
  }
  beginOpen();
}

function beginOpen() {
  G.doors = 'opening';
  G.doorT = 0;
  G.doorsOpened = true;
  sfx.doorChime();
  $('btnDoors').classList.remove('alert');
  addBubbleAtNode(G.docked, 'Endlich!', '', 2200);
}

function beginClose() {
  if (G.wheelchair && !G.wheelchair.served) {
    const w = G.wheelchair;
    if (!w.accessible && G.ramp !== 'out') {
      pushMsg('Der Rollstuhlfahrer braucht die Rampe an der ersten Tür – [R] ausklappen.', 'warn');
    } else {
      pushMsg('Der Rollstuhlfahrer steigt noch um – bitte kurz warten.', 'warn');
    }
    addBubbleAtNode(w.node, 'Moment noch!', 'warn', 2200);
    return;
  }
  if (G.ramp !== 'in') {
    pushMsg('Erst die Rampe einfahren [R].', 'warn');
    return;
  }
  G.doors = 'closing';
  G.doorT = 0;
  sfx.doorWarning();
}

function startTransfer() {
  const node = G.docked;
  const waiting = G.waiting[node] || 0;
  const alight = Math.min(G.pax, Math.round(G.pax * 0.28) + Math.floor(Math.random() * 3));
  G.transfer = {
    node,
    alight,
    board: waiting,
    alightDone: 0,
    boardDone: 0,
    t: 0,
    dur: Math.max(0.8, 0.3 + (alight + waiting) * 0.2),
    stage: 'out',
  };
  if (waiting > 0) pushMsg(`Fahrgastwechsel: ${waiting} warten, ${alight} steigen aus.`, 'info');
  else pushMsg(`Fahrgastwechsel: ${alight} steigen aus.`, 'info');
}

function updateDoors(dt) {
  const t = G.tram;
  if (!t) return;
  if (G.doors === 'opening') {
    G.doorT += dt;
    if (G.doorT > 0.6) {
      G.doors = 'open';
      startTransfer();
    }
  } else if (G.doors === 'closing') {
    G.doorT += dt;
    if (G.doorT > 0.6) {
      G.doors = 'closed';
      maybeRunner();
    }
  } else if (G.doors === 'open' && G.transfer) {
    const tr = G.transfer;
    tr.t += dt;
    const half = tr.dur / 2;
    if (tr.stage === 'out') {
      const k = Math.min(1, tr.t / half);
      const want = Math.round(tr.alight * k);
      while (tr.alightDone < want && G.pax > 0) {
        tr.alightDone++;
        G.pax--;
        G.stats.alighted++;
      }
      if (tr.t >= half) tr.stage = 'in';
    } else {
      const k = Math.min(1, (tr.t - half) / half);
      const want = Math.round(tr.board * k);
      while (tr.boardDone < want) {
        tr.boardDone++;
        if (G.pax < G.capacity) {
          G.pax++;
          G.paxTotal++;
          G.stats.boarded++;
          G.satisfaction = Math.min(100, G.satisfaction + 0.3);
        }
      }
      if (tr.t >= tr.dur) {
        G.waiting[tr.node] = Math.max(0, (G.waiting[tr.node] || 0) - tr.board);
        G.transfer = null;
        G.score += Math.min(20, Math.round(tr.board * 0.6));
        pushMsg('Fahrgastwechsel beendet. Türen schließen.', 'good');
        sfx.doorChime();
      }
    }
  }
  if (G.doors !== 'closed' && t.power > 0.02) {
    // Türverriegelung: Kraft wird unterbrochen
  }
}

function maybeRunner() {
  const node = G.docked;
  if (!node) return;
  const waitingLeft = G.waiting[node] || 0;
  if (waitingLeft <= 0 && Math.random() > 0.3) return;
  if (Math.random() > 0.8) return;
  if (!G.tram) return;
  const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
  const side = Math.random() < 0.5 ? 1 : -1;
  const sx = p.x - Math.sin(p.ang) * 13 * side;
  const sy = p.y + Math.cos(p.ang) * 13 * side;
  G.runner = {
    t: 0,
    phase: 'run',
    from: { x: sx, y: sy },
    to: { x: p.x, y: p.y },
    x: sx,
    y: sy,
    node,
  };
  addBubble(sx, sy + 8, 'Warte! Warte!', 'warn', 5200);
  showPrompt('Da rennt noch jemand! Türen noch einmal öffnen?', 'Türen öffnen', 9);
  sfx.doorWarning();
}

function reopenForRunner() {
  if (!G.runner || G.doors !== 'closed') return;
  G.doors = 'opening';
  G.doorT = 0;
  G.doorsOpened = true;
  sfx.doorChime();
  hidePrompt();
  pushMsg('Türen noch einmal geöffnet – der Fahrgast steigt ein.', 'good');
  G.score += 8;
  G.satisfaction = Math.min(100, G.satisfaction + 6);
  const node = G.docked;
  if (node) {
    G.waiting[node] = (G.waiting[node] || 0) + 1;
    G.transfer = null;
  }
  G.runner.phase = 'boarding';
}

function updateRunner(dt) {
  const r = G.runner;
  if (!r) return;
  r.t += dt;
  if (r.phase === 'run') {
    const k = Math.min(1, r.t / 2.6);
    r.x = r.from.x + (r.to.x - r.from.x) * k;
    r.y = r.from.y + (r.to.y - r.from.y) * k;
    if (k >= 1) {
      if (G.doors === 'closed' || G.doors === 'closing') {
        r.phase = 'waiting';
        r.t = 0;
      }
    }
  } else if (r.phase === 'waiting') {
    if (r.t > 7.5) {
      G.runner = null;
      G.satisfaction = Math.max(0, G.satisfaction - 7);
      G.score -= 6;
      pushMsg('Der Fahrgast hat die Bahn verpasst.', 'warn');
      addBubble(r.x, r.y + 8, 'Ach menno…', 'warn', 2600);
      hidePrompt();
    }
  } else if (r.phase === 'boarding') {
    if (r.t > 0.7) {
      G.runner = null;
      addBubble(r.x, r.y + 8, 'Danke!', 'good', 2200);
    }
  }
}

function updatePrompt(dt) {
  if (!G.prompt) return;
  G.prompt.t += dt;
  if (G.prompt.t > G.prompt.until) hidePrompt();
}

function showPrompt(text, label, seconds) {
  G.prompt = { t: 0, until: seconds };
  const el = $('prompt');
  $('promptText').textContent = text;
  $('promptBtn').textContent = label;
  el.classList.remove('hidden');
  el.dataset.action = 'doors';
}

function hidePrompt() {
  G.prompt = null;
  $('prompt').classList.add('hidden');
}

// ---------------------------------------------------------------- Haltestellen

// ---------------------------------------------------------------- Events

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function addBubbleAtNode(nodeId, text, kind = '', ms = 3400) {
  const n = NODES[nodeId];
  if (!n) return;
  addBubble(n.x, n.y + 9, text, kind, ms);
}

function updateEvents(dt) {
  if (!G.tram) return;
  G.nextChatter -= dt;
  if (G.nextChatter <= 0) {
    chatter();
    G.nextChatter = 20 + Math.random() * 24;
  }
  G.nextEvent -= dt;
  if (G.nextEvent <= 0) {
    triggerEvent();
    G.nextEvent = 42 + Math.random() * 40;
  }
  for (const [id, info] of Object.entries(G.blocked)) {
    if (G.rideTime > info.until) {
      delete G.blocked[id];
      pushMsg(`Strecke ${info.label} wieder frei.`, 'good');
      G.detour = false;
      G.detourText = '';
    }
  }
}

function chatter() {
  if (!G.tram) return;
  const line = pick(SPEECH);
  const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
  addBubble(p.x, p.y + 12, line, '', 3400, true);
}

function triggerEvent() {
  if (!G.tram || !G.target) return;
  const roll = Math.random();
  if (roll < 0.32) accidentEvent();
  else if (roll < 0.58) obstacleEvent();
  else if (roll < 0.8) {
    if (G.docked) addBubbleAtNode(G.docked, pick(SPEECH), '', 3800);
    else chatter();
  } else {
    pushMsg(pick(DISPATCH), 'radio');
  }
}

function accidentEvent() {
  if (!G.path || G.path.edges.length < 3) return;
  const candidates = G.path.edges.filter(e => e.id !== G.tram.edge.id && !G.blocked[e.id]);
  if (!candidates.length) return;
  const edge = candidates[Math.min(candidates.length - 1, 1 + Math.floor(Math.random() * 3))];
  const label = `${NODES[edge.a].name} – ${NODES[edge.b].name}`;
  G.blocked[edge.id] = { until: G.rideTime + 170, label };
  const p = edgePoint(edge, edge.a, edge.len / 2);
  G.detour = true;
  G.detourText = `Umleitung: ${label} gesperrt`;
  const rest = findPath(net, G.tram.to, G.target, { blocked: blockedSet(), prefer: G.prefer });
  if (rest) {
    G.path = {
      nodes: [G.tram.from, ...rest.nodes],
      edges: [G.tram.edge, ...rest.edges],
    };
  }
  const via = rest && rest.nodes.length > 2 ? rest.nodes.slice(1, 4).map(id => NODES[id].name).join(' – ') : '';
  pushMsg(`Unfall auf der Strecke ${label}! Du musst umleiten${via ? ' über ' + via : ''}.`, 'warn');
  addBubble(p.x, p.y + 8, 'Unfall!', 'warn', 4200);
  sfx.buzz();
  G.satisfaction = Math.max(0, G.satisfaction - 2);
}

function obstacleEvent() {
  const t = G.tram;
  const ahead = 65 + Math.random() * 55;
  const s = Math.min(t.edge.len - 8, t.s + ahead);
  if (s <= t.s + 20) return;
  const p = edgePoint(t.edge, t.from, s);
  G.obstacles.push({ edgeId: t.edge.id, s, x: p.x, y: p.y, gone: false, ttl: 14 });
  addBubble(p.x, p.y + 10, 'Wuff!', 'warn', 3000);
  pushMsg('Hindernis auf dem Gleis voraus – bremsen!', 'warn');
}

function updateObstacles(dt = 0.016) {
  const t = G.tram;
  if (!t) return;
  for (const ob of G.obstacles) {
    if (ob.gone) continue;
    ob.ttl -= dt;
    if (ob.edgeId === t.edge.id && t.s >= ob.s) {
      if (t.speed > 1.8) {
        G.stats.crashes++;
        penalty(30, 'Kollision mit einem Hindernis! Notbremsung.');
        t.speed = 0;
        t.power = 0;
        sfx.buzz();
        addBubble(ob.x, ob.y + 10, 'Autsch!', 'warn', 3000);
      } else {
        pushMsg('Gerade noch gebremst – Hindernis zieht weiter.', 'good');
      }
      ob.gone = true;
    }
    if (ob.ttl <= 0) ob.gone = true;
  }
  G.obstacles = G.obstacles.filter(o => !o.gone || o.ttl > -6);
}

function penalty(points, msg) {
  G.score -= points;
  G.satisfaction = Math.max(0, G.satisfaction - Math.round(points / 2));
  pushMsg(msg, 'warn');
}

function updateDelay() {
  const idx = Math.min(G.planned.length - 1, G.stopIndex + 1);
  const planned = G.planned[idx] || 0;
  G.delay = Math.max(0, G.rideTime - planned);
}

function updateCamera(dt) {
  if (!G.tram) return;
  const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
  // Kurvenfahrt: Ausrichtung weich nachziehen, damit die Bahn sichtbar abbiegt
  if (G.tram.hdgSmooth == null) G.tram.hdgSmooth = p.ang;
  G.tram.hdgSmooth += angDiff(p.ang, G.tram.hdgSmooth) * Math.min(1, dt * 8);
  G.tram.hdg = G.tram.hdgSmooth;
  const lead = Math.min(85, G.tram.speed * 3.2);
  const tx = p.x + Math.cos(p.ang) * lead;
  const ty = p.y + Math.sin(p.ang) * lead;
  const k = Math.min(1, dt * 4.5);
  const bias = view.biasPx || { x: 0, y: 0 };
  view.camX += (tx + bias.x / view.zoom - view.camX) * k;
  view.camY += (ty + bias.y / view.zoom - view.camY) * k;
}

// ---------------------------------------------------------------- HUD

function fmtClock(sec) {
  const s = Math.floor(sec) % 86400;
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
}

function fmtDelay(sec) {
  const s = Math.max(0, Math.round(sec));
  return `+${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function setText(el, val) {
  if (!el) return;
  if (el.textContent !== String(val)) el.textContent = val;
}

function updateHUD() {
  if (G.mode !== 'running' || !G.tram) return;
  setText($('clock'), fmtClock(G.clock));
  setText($('delay'), fmtDelay(G.delay));
  $('delayStat').classList.toggle('hot', G.delay > 90);
  setText($('pax'), `${G.pax}/${G.capacity}`);
  setText($('score'), G.score);

  setText($('zoomLbl'), `${Math.round((view.zoomMul || 1) * 100)} %`);
  if (G.hud.tempo !== G.timeScale) {
    G.hud.tempo = G.timeScale;
    for (const b of document.querySelectorAll('.tbtn')) {
      b.classList.toggle('on', Number(b.dataset.tempo) === G.timeScale);
    }
  }

  // Fahrschalter
  const lv = G.lever;
  const pct = (1 - (lv + 1) / 2) * 100;
  $('leverHandle').style.top = `${pct}%`;
  $('leverHandle').classList.toggle('gas', lv > 0.05);
  $('leverHandle').classList.toggle('brake', lv < -0.05);
  $('leverHandle').textContent = Math.abs(lv) < 0.05 ? '0' : (lv > 0 ? '+' : '−') + Math.round(Math.abs(lv) * 4);
  setText($('leverVal'), Math.abs(lv) < 0.06 ? 'Neutral' : lv > 0 ? `Gas ${Math.round(lv * 4)}` : `Bremse ${Math.round(-lv * 4)}`);
  $('btnGreet').classList.toggle('ready', !!G.nearestTram);

  const nextId = G.route[G.stopIndex + 1];
  if (nextId) {
    const n = NODES[nextId];
    const dist = G.stopDistance > 0 ? Math.round(G.stopDistance) : 0;
    setText($('nextStop'), `Nächster Halt: ${n.name}${dist ? ' · ' + dist + ' m' : ''}`);
  } else {
    setText($('nextStop'), 'Endstation');
  }

  setText($('speed'), Math.round(G.tram.speed * 3.6));
  $('speedBar').style.width = `${Math.min(100, (G.tram.speed * 3.6 / 70) * 100)}%`;
  setText($('vmax'), `${G.tram.edge.vmax} km/h erlaubt`);
  setText($('powerLvl'), Math.round(G.tram.power * 4));
  setText($('brakeLvl'), `Bremse ${Math.round(G.tram.brake * 4)}`);

  // Signalkarte
  if (G.nextSignal) {
    const sig = G.nextSignal;
    const red = sig.aspect === 'red';
    const hp2 = sig.aspect === 'hp2';
    $('sigRed').className = 'lamp' + (red ? ' on-red' : '');
    $('sigGreen').className = 'lamp' + (!red ? (hp2 ? ' on-yellow' : ' on-green') : '');
    setText($('sigAspect'), red ? 'Hp0' : hp2 ? 'Hp2' : 'Hp1');
    setText($('sigName'), red ? 'Halt' : hp2 ? 'Fahrt, 25 km/h' : 'Fahrt frei');
    setText($('sigDist'), `${Math.max(0, Math.round(sig.dist))} m`);
    setText($('sigHint'), red && G.switchWrong ? 'Weiche richtig stellen, dann wird frei.' : red ? 'Signal abwarten.' : '');
  } else {
    $('sigRed').className = 'lamp';
    $('sigGreen').className = 'lamp';
    setText($('sigAspect'), '–');
    setText($('sigName'), 'kein Signal');
    setText($('sigDist'), '');
    setText($('sigHint'), '');
  }

  // Weichenkarte
  if (G.nextJunction) {
    const nj = G.nextJunction;
    setText($('swName'), NODES[nj.node].name);
    setText($('swDist'), `${Math.max(0, Math.round(nj.dist))} m`);
    const key = `${nj.node}|${nj.options.map(o => o.edgeId).join(',')}`;
    if (G.hud.swKey !== key) {
      G.hud.swKey = key;
      const box = $('swOpts');
      box.innerHTML = '';
      nj.options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'swopt';
        b.dataset.edge = o.edgeId;
        b.innerHTML = `<span>→ ${o.label}</span><span class="k"></span>`;
        b.addEventListener('click', () => {
          G.switches[nj.node] = o.edgeId;
          sfx.tone(520, 0.05, 'square', 0.12);
        });
        box.appendChild(b);
      });
    }
    for (const b of $('swOpts').children) {
      const sel = b.dataset.edge === nj.selectedEdgeId;
      b.classList.toggle('sel', sel);
      b.classList.toggle('recommended', b.dataset.edge === nj.plannedEdgeId);
      const k = b.querySelector('.k');
      if (k) k.textContent = b.dataset.edge === nj.plannedEdgeId ? 'Route' : '';
    }
    $('swHint').classList.toggle('on', G.switchWrong);
  } else {
    setText($('swName'), 'keine Weiche in Sicht');
    setText($('swDist'), '');
    if (G.hud.swKey) { G.hud.swKey = null; $('swOpts').innerHTML = ''; }
    $('swHint').classList.remove('on');
  }

  // Türen
  const doorStates = {
    closed: ['zu', 'geschlossen', 'An der Haltestelle halten und Türen öffnen.'],
    opening: ['öffnet', 'Türen öffnen…', 'Bitte Abstand halten.'],
    open: ['offen', 'geöffnet', G.transfer ? `Fahrgastwechsel läuft · ${G.docked ? NODES[G.docked].name : ''}` : 'Fahrgastwechsel abgeschlossen.'],
    closing: ['schließt', 'Türen schließen…', 'Achtung, Türen schließen!'],
  };
  const ds = doorStates[G.doors];
  setText($('doorLbl'), ds[0]);
  setText($('doorState'), ds[1]);
  $('doorState').className = 'doorstate ' + (G.doors === 'open' ? 'open' : 'closed');
  setText($('doorSub'), ds[2]);

  const needRamp = !!(G.wheelchair && !G.wheelchair.served && !G.wheelchair.accessible && G.ramp === 'in');
  $('btnRamp').classList.toggle('alert', needRamp);
  let access = '';
  if (G.ramp === 'moving') access = '♿ Rampe fährt aus…';
  else if (G.ramp === 'out') access = '♿ Rampe ausgefahren';
  else if (G.ramp === 'retracting') access = '♿ Rampe fährt ein…';
  else if (needRamp) access = '♿ Rampe ausklappen [R]';
  else if (G.wheelchair && !G.wheelchair.served) access = '♿ Rollstuhl steigt um';
  setText($('accessInfo'), access);

  const prog = $('doorProg');
  if (G.doors === 'open' && G.transfer) {
    prog.classList.add('on');
    $('doorProgBar').style.width = `${Math.min(100, (G.transfer.t / G.transfer.dur) * 100)}%`;
  } else {
    prog.classList.remove('on');
  }

  updateRouteList();
}

function buildRouteList() {
  const list = $('routeList');
  list.innerHTML = '';
  G.route.forEach((id, i) => {
    const li = document.createElement('li');
    li.dataset.index = i;
    li.textContent = NODES[id].name;
    if (NODES[id].terminal) li.classList.add('term');
    list.appendChild(li);
  });
  updateRouteList(true);
}

function updateRouteList(force) {
  const items = $('routeList').children;
  for (let i = 0; i < items.length; i++) {
    const li = items[i];
    li.classList.toggle('done', i < G.stopIndex);
    li.classList.toggle('here', i === G.stopIndex);
    li.classList.toggle('next', i === G.stopIndex + 1);
  }
  const note = $('detourNote');
  if (G.detour) {
    note.classList.add('on');
    note.textContent = G.detourText || 'Umleitung aktiv – Weichen beachten';
  } else {
    note.classList.remove('on');
  }
}

function pushMsg(text, kind = 'info') {
  const feed = $('msgfeed');
  const el = document.createElement('div');
  el.className = 'msg ' + kind;
  el.innerHTML = `<span class="t">${fmtClock(G.clock)}</span>${text}`;
  feed.appendChild(el);
  while (feed.children.length > 4) feed.removeChild(feed.firstChild);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
  }, 6000);
}

function clearMessages() {
  $('msgfeed').innerHTML = '';
}

const bubbleEls = [];
function addBubble(x, y, text, kind = '', ms = 3400, follow = false) {
  if (bubbleEls.length > 5) {
    const old = bubbleEls.shift();
    old.el.remove();
  }
  const el = document.createElement('div');
  el.className = 'bubble ' + kind;
  el.textContent = text;
  $('bubbles').appendChild(el);
  bubbleEls.push({ x, y, el, until: performance.now() + ms, follow, drift: (Math.random() - 0.5) * 8 });
}

function clearBubbles() {
  for (const b of bubbleEls) b.el.remove();
  bubbleEls.length = 0;
}

function updateBubbles() {
  if (!bubbleEls.length) return;
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / view.w;
  const now = performance.now();
  for (let i = bubbleEls.length - 1; i >= 0; i--) {
    const b = bubbleEls[i];
    if (now > b.until) {
      b.el.remove();
      bubbleEls.splice(i, 1);
      continue;
    }
    let wx = b.x, wy = b.y;
    if (b.follow && G.tram) {
      const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
      wx = p.x;
      wy = p.y + 12;
    }
    const s = worldToScreen(view, wx, wy);
    const left = Math.max(60, Math.min(rect.width - 60, s.x * scale + b.drift));
    const top = Math.max(70, Math.min(rect.height - 190, s.y * scale));
    b.el.style.left = `${left}px`;
    b.el.style.top = `${top}px`;
    b.el.style.opacity = now > b.until - 500 ? String(Math.max(0, (b.until - now) / 500)) : '1';
  }
}

// ---------------------------------------------------------------- Eingabe

function bindInput() {
  // Fahrschalter-Hebel: ziehen, Position bleibt stehen
  const trackEl = $('leverTrack');
  const setLeverFromEvent = (e) => {
    const r = trackEl.getBoundingClientRect();
    const v = 1 - (e.clientY - r.top) / r.height;
    G.lever = Math.max(-1, Math.min(1, v * 2 - 1));
    G.leverKeyboard = false;
  };
  trackEl.addEventListener('pointerdown', e => {
    e.preventDefault();
    G.leverDrag = true;
    try { trackEl.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    setLeverFromEvent(e);
    sfx.ensure();
  });
  trackEl.addEventListener('pointermove', e => { if (G.leverDrag) setLeverFromEvent(e); });
  const endLever = () => { G.leverDrag = false; };
  trackEl.addEventListener('pointerup', endLever);
  trackEl.addEventListener('pointercancel', endLever);
  const neutral = (e) => { if (e) e.stopPropagation(); G.lever = 0; G.leverKeyboard = false; };
  $('leverNeutral').addEventListener('click', neutral);
  trackEl.addEventListener('dblclick', () => neutral());

  $('btnDoors').addEventListener('click', () => { toggleDoors(); sfx.ensure(); });
  $('btnRamp').addEventListener('click', () => { toggleRamp(); sfx.ensure(); });
  $('btnSwL').addEventListener('click', () => cycleSwitch(-1));
  $('btnSwR').addEventListener('click', () => cycleSwitch(1));
  $('btnBell').addEventListener('click', () => { bell(); sfx.ensure(); });
  $('btnGreet').addEventListener('click', () => { greet(); sfx.ensure(); });

  $('promptBtn').addEventListener('click', () => { reopenForRunner(); sfx.ensure(); });
  $('btnHelp').addEventListener('click', () => openHelp());
  $('btnHelpClose').addEventListener('click', () => closeHelp());
  $('btnSound').addEventListener('click', toggleSound);
  $('btnPause').addEventListener('click', () => setPaused(true));
  $('btnResume').addEventListener('click', () => setPaused(false));
  $('btnPauseHelp').addEventListener('click', () => { $('pause').classList.add('hidden'); openHelp(); });
  $('btnEndRide').addEventListener('click', () => { $('pause').classList.add('hidden'); finishRide('Fahrt vorzeitig beendet'); });
  $('btnAgain').addEventListener('click', () => {
    $('summary').classList.add('hidden');
    if (G.lineKey) startRide(G.lineKey, G.dir); else toMenu();
  });
  $('btnToMenu').addEventListener('click', toMenu);

  window.addEventListener('keydown', e => {
    if (e.repeat) {
      if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      return;
    }
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup' || key === 's' || key === 'arrowdown') {
      G.heldKeys.add(key);
      G.leverKeyboard = true;
      e.preventDefault();
      sfx.ensure();
      return;
    }
    switch (key) {
      case 'd': toggleDoors(); sfx.ensure(); break;
      case 'r': toggleRamp(); sfx.ensure(); break;
      case 'q': case 'arrowleft': if (G.mode === 'running') cycleSwitch(-1); e.preventDefault(); break;
      case 'e': case 'arrowright': if (G.mode === 'running') cycleSwitch(1); e.preventDefault(); break;
      case 'k': case 'h': bell(); break;
      case 'g': greet(); break;
      case '+': case '=': setZoomMul((view.zoomMul || 1) * 1.12); break;
      case '-': case '_': setZoomMul((view.zoomMul || 1) / 1.12); break;
      case '0': setZoomMul(1); break;
      case 't': if (G.runner) reopenForRunner(); break;
      case ' ': G.emergency = true; e.preventDefault(); break;
      case 'p':
        if (G.mode === 'running') setPaused(!G.paused);
        break;
      case 'escape':
        closeHelp();
        if (G.mode === 'running') setPaused(!G.paused);
        break;
      case 'm': toggleSound(); break;
      default: break;
    }
  });
  window.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup' || key === 's' || key === 'arrowdown') G.heldKeys.delete(key);
    if (key === ' ') G.emergency = false;
  });

  stage.addEventListener('wheel', e => {
    if (G.mode !== 'running') return;
    e.preventDefault();
    const f = e.deltaY > 0 ? 0.9 : 1.1;
    view.zoomMul = Math.max(0.55, Math.min(3.0, (view.zoomMul || 1) * f));
    view.zoom = view.zoomBase * view.zoomMul;
  }, { passive: false });

  $('zoomIn').addEventListener('click', () => setZoomMul((view.zoomMul || 1) * 1.15));
  $('zoomOut').addEventListener('click', () => setZoomMul((view.zoomMul || 1) / 1.15));
  $('zoomReset').addEventListener('click', () => setZoomMul(1));
  for (const b of document.querySelectorAll('.tbtn')) {
    b.addEventListener('click', () => setTempo(Number(b.dataset.tempo)));
  }

  window.addEventListener('blur', () => {
    G.heldKeys.clear();
    G.leverDrag = false;
    G.leverKeyboard = false;
    G.lever = 0;
    G.emergency = false;
  });
  window.addEventListener('resize', resize);
}

function cycleSwitch(delta) {
  if (G.mode !== 'running' || !G.nextJunction) {
    pushMsg('Keine Weiche in Sicht.', 'info');
    return;
  }
  const nj = G.nextJunction;
  const ids = nj.options.map(o => o.edgeId);
  let i = ids.indexOf(nj.selectedEdgeId);
  if (i < 0) i = 0;
  i = (i + delta + ids.length) % ids.length;
  G.switches[nj.node] = ids[i];
  nj.selectedEdgeId = ids[i];
  G.switchWrong = !!(nj.plannedEdgeId && ids[i] !== nj.plannedEdgeId);
  G.hud.swKey = null;
  sfx.tone(520, 0.05, 'square', 0.12);
}

function setZoomMul(m) {
  view.zoomMul = Math.max(0.55, Math.min(3.0, m));
  view.zoom = view.zoomBase * view.zoomMul;
}

function setTempo(t) {
  G.timeScale = Math.max(1, Math.min(3, t));
  updateHUD();
}

function bell() {
  if (G.mode !== 'running') return;
  G.bellUntil = G.animT + 0.9;
  sfx.bell();
}

function toggleSound() {
  G.sound = !G.sound;
  sfx.setEnabled(G.sound);
  $('btnSound').textContent = G.sound ? '🔊' : '🔇';
}

function setPaused(p) {
  if (G.mode !== 'running') return;
  G.paused = p;
  $('pause').classList.toggle('hidden', !p);
  G.heldKeys.clear();
  G.leverDrag = false;
  G.leverKeyboard = false;
  G.lever = 0;
  G.emergency = false;
}

function openHelp() {
  $('help').classList.remove('hidden');
  if (G.mode === 'running') G.paused = true;
}

function closeHelp() {
  $('help').classList.add('hidden');
  if (G.mode === 'running' && !$('pause').classList.contains('hidden')) return;
  if (G.mode === 'running') G.paused = false;
}

// ---------------------------------------------------------------- Rendering

function render() {
  const p = G.tram ? edgePoint(G.tram.edge, G.tram.from, G.tram.s) : null;
  if (!p) {
    view.camX = 500;
    view.camY = 300;
  }
  renderFrame(ctx, G, net, view, G.animT);
  drawMinimap(mctx, G, net, mini.width, mini.height);
}

const PIXEL_SCALE = 2;

function resize() {
  const rect = stage.getBoundingClientRect();
  const cssW = Math.max(240, Math.round(rect.width));
  const cssH = Math.max(180, Math.round(rect.height));
  // Grober Pixelpuffer, per CSS hochskaliert – ergibt den Pixelart-Look
  const w = Math.max(140, Math.round(cssW / PIXEL_SCALE));
  const h = Math.max(110, Math.round(cssH / PIXEL_SCALE));
  canvas.width = w;
  canvas.height = h;
  view.w = w;
  view.h = h;
  view.zoomBase = Math.min(4, Math.max(0.4, w / 470));
  view.zoom = view.zoomBase * (view.zoomMul || 1);
  ctx.imageSmoothingEnabled = false;

  // Kamera auf den freien Kartenbereich zwischen den HUD-Panels ausrichten
  try {
    const rp = $('rightpanel').getBoundingClientRect();
    const lp = $('routepanel');
    const routeVisible = lp && getComputedStyle(lp).display !== 'none';
    const freeL = (routeVisible ? lp.getBoundingClientRect().right : 8) / PIXEL_SCALE;
    const freeR = (rp.width ? rp.left : cssW - 8) / PIXEL_SCALE;
    const freeT = $('topbar').getBoundingClientRect().bottom / PIXEL_SCALE;
    const freeB = $('bottombar').getBoundingClientRect().top / PIXEL_SCALE;
    view.biasPx = {
      x: w / 2 - (freeL + freeR) / 2,
      y: (freeT + freeB) / 2 - h / 2,
    };
  } catch (e) {
    view.biasPx = { x: 0, y: 0 };
  }
}

// ---------------------------------------------------------------- Loop

let lastTs = 0;
function loop(ts) {
  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
  lastTs = ts;
  if (G.mode === 'running' && !G.paused) {
    update(dt * G.timeScale);
    updateHUD();
  }
  render();
  updateBubbles();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- Init

initDecor(net);
resize();
buildMenu();
bindInput();
updateHUD();

requestAnimationFrame(loop);
