/* Straßenbahn-Simulator Dresden – voller Spielbetrieb.
   Rechts gefahren, Signale, Engstellen mit Gegenverkehr, Fahrgäste, Weichen,
   Fahrplan, Sifa, Wetter, Nacht, Querverkehr, Baustellen, Rangieren, Karriere. */
(() => {
  'use strict';

  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const $ = id => document.getElementById(id);

  const LAT0 = 51.0520, LON0 = 13.7370;
  const K0 = Math.cos(LAT0 * Math.PI / 180), M_LAT = 111320;
  const MOD_GAP = 0.65, TRAM_W = 2.65;
  const TRACK_OFF = 2.0;
  const STOP_WIN = 13;
  const DOOR_RATE = 2.4;
  const SIFA_MAX = 40;
  /* Ampelphasen an Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen */
  const X_CYC = 32, X_T_GREEN = 18, X_T_CLEAR = 3, X_T_CROSS = 11;

  const WX = {
    sun: { grip: 1.00, label: 'SONNE' },
    rain: { grip: 0.78, label: 'REGEN' },
    snow: { grip: 0.62, label: 'SCHNEE' },
    leaf: { grip: 0.70, label: 'LAUB' },
    fog: { grip: 0.90, label: 'NEBEL' },
  };

  /* Wagen mit eigener Physik; der Tatra wird per Karriere freigeschaltet */
  const VEHICLES = [
    { name: 'NGT6DD', len: 28, sec: 2, accel: 1.95, brake: 2.75, vmax: 19.4, coast: 0.42 },
    { name: 'NGT D8DD', len: 33, sec: 3, accel: 1.72, brake: 2.45, vmax: 19.4, coast: 0.46 },
    { name: 'NGT DXDD', len: 38, sec: 3, accel: 1.55, brake: 2.30, vmax: 18.1, coast: 0.50 },
    { name: 'NGT D12DD', len: 45, sec: 4, accel: 1.38, brake: 2.10, vmax: 16.7, coast: 0.55 },
    { name: 'Tatra T4D', len: 29, sec: 2, accel: 1.62, brake: 2.48, vmax: 17.2, coast: 0.48, unlock: 3000 },
  ];
  const veh = () => VEHICLES[S.veh];
  const tlen = () => veh().len * (SET.double ? 2 : 1) + (SET.double ? MOD_GAP : 0);
  const carLen = () => { const n = veh().sec; return (veh().len - MOD_GAP * (n - 1)) / n; };
  function carCenterS(i) { const L = carLen(); return S.s - (i * (L + MOD_GAP) + L / 2); }
  function carOnPlatform(i, st) {
    if (!st) return true;
    const c = carCenterS(i);
    return c >= st.s - st.plat && c <= st.s + 12;
  }
  function syncCars() {
    const n = veh().sec;
    S.car = new Array(n).fill(0);
    S.carT = new Array(n).fill(0);
    S.carPen = new Array(n).fill(false);
    S.doors = 0; S.doorTarget = 0;
  }
  function anyOpenCarOnPlatform(st) {
    for (let i = 0; i < S.car.length; i++) if (S.car[i] > 0.9 && carOnPlatform(i, st)) return true;
    return false;
  }

  /* --------------------------------------------------- Einstellungen */
  const DEF_SET = { weather: 'sun', night: false, double: false, cam: 0, voice: false, sifa: true };
  let SET = { ...DEF_SET };
  try { Object.assign(SET, JSON.parse(localStorage.getItem('tramdd.set') || '{}')); } catch (e) {}
  function saveSet() { try { localStorage.setItem('tramdd.set', JSON.stringify(SET)); } catch (e) {} }

  let CAREER = { points: 0, trips: 0, best: {} };
  try { Object.assign(CAREER, JSON.parse(localStorage.getItem('tramdd.career') || '{}')); } catch (e) {}
  function saveCareer() { try { localStorage.setItem('tramdd.career', JSON.stringify(CAREER)); } catch (e) {} }
  const level = () => 1 + Math.floor(CAREER.points / 2500);

  let W = 192, H = 108;
  let LINES = null, line = null, map = null;
  let segs = [], total = 0, lineCol = '#48c06d';
  let loading = false;

  const S = {
    s: 40, v: 0, doors: 0, doorTarget: 0, served: new Set(), score: 0, t: 0, veh: 0,
    started: false, paused: false, finished: false, zoom: 23, camAng: 0,
    lineId: '1', missT: 0, pax: 0, fines: 0, prevS: 40, contactCd: 0,
    inc: null, doorFault: 0, signalFail: 0, boardT: 0, alightT: 0, alight: 0, board: 0,
    boardStop: null, msgT: 0, flavorT: 30, mood: 70, sifa: SIFA_MAX, sifaDead: false,
    sand: 0, sandCd: 0, lat: 0, shunt: null, decide: null, ctx: null, rampDown: false,
    crossT: 8, prio: 0, siteWarn: 0, doorChime: 0,
    mot: 40, motMax: 40, motCut: false, motWarnT: 0, motTrips: 0,
    car: [], carT: [], carPen: [], walkers: [], tut: null,
  };
  const keys = new Set();
  const LEV = { val: 0, thr: 0, brk: 0 };

  let items = [], grid = new Map();
  const GC = 100;

  let stops = [], signals = [], switches = [], narrows = [], sites = [], oncoming = [], ai = [], incidents = [];
  let crossers = [], streetCars = [], roadPaths = [], crossings = [];
  let bedSegs = [], railSegs = [], mapPts = [], bounds = null;

  /* ---------------------------------------------------------------- Zufall */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];

  /* ---------------------------------------------------------------- Welt */
  const toXY = (lat, lon) => [(lon - LON0) * M_LAT * K0, (LAT0 - lat) * M_LAT];
  const rightOf = (ang) => [-Math.sin(ang), Math.cos(ang)];

  function clearWorld() {
    segs = []; total = 0; items = []; grid = new Map();
    stops = []; signals = []; switches = []; narrows = []; sites = [];
    oncoming = []; ai = []; incidents = []; crossers = []; bedSegs = []; railSegs = [];
    streetCars = []; roadPaths = []; crossings = []; S.walkers = [];
    mapPts = []; bounds = null; S.lat = 0; S.shunt = null;
  }

  function buildPath(chain) {
    let s = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 1; i < chain.length; i++) {
      const [ax, ay] = toXY(chain[i - 1][0], chain[i - 1][1]);
      const [bx, by] = toXY(chain[i][0], chain[i][1]);
      const len = Math.hypot(bx - ax, by - ay);
      if (len < 0.05) continue;
      segs.push({ x0: ax, y0: ay, x1: bx, y1: by, len, s0: s, ang: Math.atan2(by - ay, bx - ax) });
      if (ax < x0) x0 = ax; if (ax > x1) x1 = ax;
      if (ay < y0) y0 = ay; if (ay > y1) y1 = ay;
      s += len;
    }
    total = s;
    bounds = { x0, y0, x1, y1 };
    mapPts = [];
    for (let i = 0; i < segs.length; i += 5) mapPts.push(segs[i].x0, segs[i].y0);
    const last = segs[segs.length - 1];
    if (last) mapPts.push(last.x1, last.y1);
  }

  function sample(s) {
    s = Math.max(0, Math.min(total, s));
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (segs[mid].s0 + segs[mid].len < s) lo = mid + 1; else hi = mid;
    }
    const g = segs[lo];
    const f = Math.max(0, Math.min(1, (s - g.s0) / g.len));
    return { x: g.x0 + (g.x1 - g.x0) * f, y: g.y0 + (g.y1 - g.y0) * f, ang: g.ang };
  }

  function narrowFactor(s) {
    let f = 1;
    for (const nz of narrows) {
      if (s > nz.s0 - 16 && s < nz.s1 + 16) {
        /* 0 = eingleisig, 1 = zweigleisig: ausserhalb der Rampe 1, im Abschnitt 0 */
        const a = Math.min(1, Math.max(0, (s - (nz.s0 - 16)) / 16));
        const b = Math.min(1, Math.max(0, ((nz.s1 + 16) - s) / 16));
        f = Math.min(f, 1 - Math.min(a, b));
      }
    }
    return f;
  }

  function offsetPoint(s, d) {
    const p = sample(s);
    const r = rightOf(p.ang);
    return { x: p.x + r[0] * d, y: p.y + r[1] * d, ang: p.ang };
  }

  function indexItems() {
    const add = (it) => {
      const i = items.push(it) - 1;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const p = it.p;
      for (let k = 0; k < p.length; k += 2) {
        if (p[k] < x0) x0 = p[k];
        if (p[k] > x1) x1 = p[k];
        if (p[k + 1] < y0) y0 = p[k + 1];
        if (p[k + 1] > y1) y1 = p[k + 1];
      }
      for (let cx = Math.floor(x0 / GC); cx <= Math.floor(x1 / GC); cx++)
        for (let cy = Math.floor(y0 / GC); cy <= Math.floor(y1 / GC); cy++) {
          const key = cx + ',' + cy;
          if (!grid.has(key)) grid.set(key, []);
          grid.get(key).push(i);
        }
    };
    for (const p of map.layers.green) add({ k: 'g', p });
    for (const p of map.layers.water) add({ k: 'w', p });
    const BCOLS = ['#f8d7a0', '#f0b98c', '#ffe2b0', '#e8a97f', '#f7cfa2', '#dfae82'];
    for (const p of map.layers.buildings) {
      const h = Math.abs(Math.round(p[0] * 7 + p[1] * 13)) % BCOLS.length;
      add({ k: 'b', p, col: BCOLS[h] });
    }
    for (const r of map.layers.roads) add({ k: 'r', p: r.p, c: r.w, t: r.c });
    for (const p of map.layers.trees) add({ k: 't', p });
  }

  /* --------------------------------------------------- Streckenausstattung */
  function buildWorld() {
    const rng = mulberry32(hashStr(S.lineId));
    const ids = Object.keys(LINES);
    const startS = line.start || 40;

    stops = line.stops.map((st, i) => ({
      s: st.s, name: st.name, wait0: 1 + Math.floor(rng() * 5),
      stepFree: rng() < 0.68, plat: 24 + Math.round(rng() * 22),
      skip: false, served: false, missed: false, wait: 0, idx: i,
    }));
    for (const st of stops) st.wait = st.wait0;
    stops.forEach((st, i) => {
      st.plan = Math.max(0, (st.s - startS) / 8.2 + i * 14);
    });

    /* Echte eingleisige Abschnitte aus den OSM-Gleisen (line.single) */
    for (const [a, b] of (line.single || [])) {
      const s0 = Math.max(80, Math.round(a)), s1 = Math.min(total - 60, Math.round(b));
      if (s1 - s0 < 120) continue;
      narrows.push({ s0, s1, kind: 'single', waited: false, cleared: false, warned: false });
    }
    const inNarrow = (s, pad) => narrows.some(nz => s > nz.s0 - pad && s < nz.s1 + pad);

    /* Zusätzlich eine Baustellen-Engstelle als Zwischenfall */
    let nzS = 1600 + rng() * 900;
    for (let tries = 0; tries < 10 && nzS < total - 700; tries++) {
      const len = 110 + rng() * 70;
      if (inNarrow(nzS, 300) || inNarrow(nzS + len, 300) ||
        stops.some(st => st.s > nzS - 40 && st.s < nzS + len + 40)) {
        nzS += 900 + rng() * 800;
        continue;
      }
      narrows.push({ s0: nzS, s1: nzS + len, kind: 'bau', waited: false, cleared: false, warned: false });
      break;
    }

    let swS = 620 + rng() * 320;
    while (swS < total - 300) {
      if (!stops.some(st => Math.abs(st.s - swS) < 34) && !inNarrow(swS, 50)) {
        const req = rng() < 0.5 ? 'L' : 'R';
        const set = rng() < 0.5 ? 'L' : 'R';
        switches.push({ s: swS, req, set, set0: set, scored: false, penalized: false });
      }
      swS += 1150 + rng() * 950;
    }
    if (!switches.length) switches.push({ s: Math.min(900, total * 0.4), req: 'L', set: 'R', set0: 'R', scored: false });

    /* Langsamfahrstellen und Baustellen */
    let laS = 900 + rng() * 500;
    for (let i = 0; i < 3 && laS < total - 400; i++) {
      sites.push({ kind: 'la', s0: laS, s1: laS + 140 + rng() * 60, limit: [20, 30, 40][Math.floor(rng() * 3)] });
      laS += 2600 + rng() * 1800;
    }
    for (let i = 0; i < 2; i++) {
      const cand = stops.filter(st => st.idx > 1 && st.idx < stops.length - 2 &&
        !sites.some(si => Math.abs(si.s0 - st.s) < 300));
      if (!cand.length) break;
      const st = pick(cand, rng());
      st.skip = true;
      st.wait = 0;
      sites.push({ kind: 'bau', s0: st.s - 60, s1: st.s + 60, limit: 20, skip: st.name });
    }

    const onCount = Math.max(6, Math.min(16, Math.round(total / 1400)));
    for (let i = 0; i < onCount; i++) {
      const v = VEHICLES[Math.floor(rng() * 4)];
      const lid = pick(ids, rng());
      let os = 120 + rng() * (total - 240);
      for (let k = 0; k < 8 && narrows.some(nz => os > nz.s0 - 60 && os < nz.s1 + 60); k++) {
        os = 120 + rng() * (total - 240);
      }
      oncoming.push({
        s: os, v: 7 + rng() * 3.6,
        color: LINES[lid] ? LINES[lid].color : '#c8c8c8', num: lid,
        len: v.len, sec: v.sec, vmax: 9 + rng() * 2,
      });
    }

    ai = [];
    for (let i = 0; i < 2; i++) {
      const v = VEHICLES[Math.floor(rng() * 4)];
      const lid = pick(ids, rng());
      ai.push({
        s: startS + 230 + i * 420 + rng() * 120, v: 6 + rng() * 3,
        len: v.len, sec: v.sec, vmax: 16 + rng() * 3,
        color: LINES[lid] ? LINES[lid].color : '#cfd8dc', num: lid,
      });
    }

    let incS = 1600 + rng() * 700;
    while (incS < total - 400) {
      const r = rng();
      const kind = r < 0.26 ? 'brake' : r < 0.38 ? 'block' : r < 0.52 ? 'text'
        : r < 0.68 ? 'door' : r < 0.84 ? 'signal' : 'choice';
      incidents.push({ s: incS, kind, done: false });
      incS += 2000 + rng() * 1600;
    }
    if (!incidents.some(i => i.kind === 'choice') && incidents.length) {
      incidents[Math.floor(incidents.length / 2)].kind = 'choice';
    }
  }

  function buildTracks() {
    bedSegs = []; railSegs = [];
    const STEP = 5;
    for (const base of [TRACK_OFF, -TRACK_OFF]) {
      let prev = null;
      for (let s = 0; s <= total + STEP; s += STEP) {
        const q = sample(Math.min(total, s));
        const o = base * narrowFactor(s);
        const r = rightOf(q.ang);
        const cur = { s: Math.min(total, s), x: q.x + r[0] * o, y: q.y + r[1] * o, ang: q.ang };
        if (prev) bedSegs.push({ s0: prev.s, s1: cur.s, x0: prev.x, y0: prev.y, x1: cur.x, y1: cur.y });
        prev = cur;
      }
    }
    for (const b of bedSegs) {
      const ang = Math.atan2(b.y1 - b.y0, b.x1 - b.x0);
      const r = rightOf(ang);
      for (const d of [-0.55, 0.55]) {
        railSegs.push({
          s0: b.s0, x0: b.x0 + r[0] * d, y0: b.y0 + r[1] * d,
          x1: b.x1 + r[0] * d, y1: b.y1 + r[1] * d,
        });
      }
    }
  }

  /* Straßenverkehr auf den OSM-Straßen links und rechts der Strecke */
  function roadInfo(p) {
    const pts = [];
    let len = 0;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const x0 = p[i], y0 = p[i + 1], x1 = p[i + 2], y1 = p[i + 3];
      const l = Math.hypot(x1 - x0, y1 - y0);
      if (l < 0.5) continue;
      pts.push({ x0, y0, x1, y1, l, s0: len });
      len += l;
    }
    return { pts, len };
  }
  function buildStreetTraffic() {
    streetCars = []; roadPaths = [];
    const isPath = t => t === 'footway' || t === 'path' || t === 'steps' ||
      t === 'bridleway' || t === 'cycleway' || t === 'track';
    for (const it of items) {
      if (it.k !== 'r' || isPath(it.t) || (it.c || 0) < 2.2) continue;
      const info = roadInfo(it.p);
      if (info.len > 26) roadPaths.push({ pts: info.pts, len: info.len, c: it.c || 0, t: it.t || '' });
    }
    for (let i = 0; i < 22; i++) spawnStreetCar();
  }
  function streetPoint(path, d) {
    d = Math.max(0, Math.min(path.len - 0.01, d));
    let lo = 0, hi = path.pts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (path.pts[mid].s0 + path.pts[mid].l < d) lo = mid + 1; else hi = mid;
    }
    const g = path.pts[lo];
    const f = Math.max(0, Math.min(1, (d - g.s0) / g.l));
    return { x: g.x0 + (g.x1 - g.x0) * f, y: g.y0 + (g.y1 - g.y0) * f, ang: Math.atan2(g.y1 - g.y0, g.x1 - g.x0) };
  }
  function spawnStreetCar() {
    if (!roadPaths.length) return;
    const path = roadPaths[Math.floor(Math.random() * roadPaths.length)];
    const v0 = 4 + Math.random() * 5.5;
    streetCars.push({
      path, d: Math.random() * path.len, dir: Math.random() < 0.5 ? 1 : -1,
      v: v0, vmax: v0, len: 3.8 + Math.random() * 2.2, wid: 1.8 + Math.random() * 0.4,
      color: ['#c8453a', '#3f6fb0', '#d8d8d8', '#4a8a4f', '#c9a227', '#7a5b8f'][Math.floor(Math.random() * 6)],
    });
  }
  /* Querstraßen: Querverkehr quert nur dort, wo wirklich eine Straße über das Gleis führt */
  function buildCrossings() {
    crossings = [];
    const MAJOR_ROADS = new Set(['trunk', 'primary', 'secondary', 'tertiary']);
    const cell = 45, g = new Map();
    segs.forEach((sg, i) => {
      const x0 = Math.floor(Math.min(sg.x0, sg.x1) / cell), x1 = Math.floor(Math.max(sg.x0, sg.x1) / cell);
      const y0 = Math.floor(Math.min(sg.y0, sg.y1) / cell), y1 = Math.floor(Math.max(sg.y0, sg.y1) / cell);
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
        const key = cx + ',' + cy;
        if (!g.has(key)) g.set(key, []);
        g.get(key).push(i);
      }
    });
    const hits = [];
    for (const path of roadPaths) {
      for (const rp of path.pts) {
        if (rp.l < 3) continue;
        const steps = Math.max(1, Math.round(rp.l / 6));
        const roadAng = Math.atan2(rp.y1 - rp.y0, rp.x1 - rp.x0);
        for (let k = 0; k <= steps; k++) {
          const f = k / steps;
          const px = rp.x0 + (rp.x1 - rp.x0) * f, py = rp.y0 + (rp.y1 - rp.y0) * f;
          const cx = Math.floor(px / cell), cy = Math.floor(py / cell);
          let best = 1e9, bs = 0, bang = 0;
          for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
            for (const i of g.get(gx + ',' + gy) || []) {
              const sg = segs[i];
              const dx = sg.x1 - sg.x0, dy = sg.y1 - sg.y0;
              const L2 = dx * dx + dy * dy || 1;
              const t = Math.max(0, Math.min(1, ((px - sg.x0) * dx + (py - sg.y0) * dy) / L2));
              const d = Math.hypot(sg.x0 + dx * t - px, sg.y0 + dy * t - py);
              if (d < best) { best = d; bs = sg.s0 + sg.len * t; bang = sg.ang; }
            }
          }
          if (best > 8) continue;
          let da = Math.abs(bang - roadAng) % Math.PI;
          if (da > Math.PI / 2) da = Math.PI - da;
          if (da < 0.35) continue;   /* Straße läuft parallel zum Gleis, keine Kreuzung */
          hits.push({
            s: bs, major: (path.c || 0) >= 4.4 || MAJOR_ROADS.has(path.t),
            road: path, dRoad: rp.s0 + rp.l * f,
          });
        }
      }
    }
    hits.sort((a, b) => a.s - b.s);
    for (const h of hits) {
      if (h.s < 60 || h.s > total - 60) continue;
      const last = crossings[crossings.length - 1];
      if (last && h.s - last.s <= 28) { last.major = last.major || h.major; continue; }
      crossings.push({ s: h.s, major: h.major, road: h.road, dRoad: h.dRoad });
    }
    /* Feste, je Kreuzung versetzte Phase: Bahn und Querverkehr wechseln sich ab */
    crossings.forEach((c, i) => {
      c.skew = (c.s * 0.37 + i * 5.3) % X_CYC;
      c.sig = false;
    });
  }

  /* Echte Rotphase: an jeder Kreuzung hat entweder die Bahn oder der
     Querverkehr (Auto/Fussgaenger) Gruen, nie beide. */
  function crossPhase(c) {
    const t = ((S.t + c.skew) % X_CYC + X_CYC) % X_CYC;
    if (t < X_T_GREEN) return 'tram';
    if (t < X_T_GREEN + X_T_CLEAR) return 'clear';
    return 'cross';
  }
  function crossingOccupied(c) {
    return crossers.some(p => !p.cleared && Math.abs(p.s - c.s) < 6 && Math.abs(p.off) < 7);
  }
  function tramGreen(c) {
    /* Gruen nur in der Bahnphase. Ist der Zug schon ueber die Haltlinie,
       bleibt die Fahrt gesichert; steht noch jemand im Kreuzungsbereich,
       bleibt Rot, bis geraeumt ist. */
    const nose = S.s, tail = S.s - tlen();
    if (nose > c.s - 9 && tail < c.s + 6) return true;
    if (crossPhase(c) === 'tram') return !crossingOccupied(c);
    return false;
  }

  /* Straßenbahn-Ampeln: an jeder Haltestelle und an den Straßenkreuzungen */
  function buildSignals() {
    signals = [];
    const rng = mulberry32(hashStr(S.lineId + '-ampel'));
    for (const st of stops) {
      signals.push({
        s: Math.min(total - 20, st.s + 26), kind: 'stop', stopS: st.s,
        phase: 0, prio: false, prioT: 0,
      });
    }
    for (const c of crossings) {
      if (!c.major) continue;
      const s = c.s - 9;
      if (s < 60 || s > total - 80) continue;
      if (signals.some(g => Math.abs(g.s - s) < 28)) continue;
      if (narrows.some(nz => s > nz.s0 - 24 && s < nz.s1 + 24)) continue;
      signals.push({ s, kind: 'cross', major: true, cross: c, phase: 0, prio: false, prioT: 0 });
      c.sig = true;
    }
    signals.sort((a, b) => a.s - b.s);
  }

  function roadNear(px, py, reach) {
    for (let n = 0; n < 40; n++) {
      const path = roadPaths[Math.floor(Math.random() * roadPaths.length)];
      if (!path) break;
      const d = Math.random() * path.len;
      const p = streetPoint(path, d);
      if (Math.hypot(p.x - px, p.y - py) < reach) return { path, d };
    }
    return null;
  }
  function updateStreetTraffic(dt) {
    if (!roadPaths.length) return;
    const me = offsetPoint(S.s, TRACK_OFF);
    for (const c of streetCars) {
      /* An Bahn/Kfz-Kreuzungen: bei Bahn-Gruen steht das Auto an der Haltlinie */
      let hold = false;
      for (const cr of crossings) {
        if (cr.road !== c.path) continue;
        const gap = c.dir > 0 ? cr.dRoad - c.d : c.d - cr.dRoad;
        if (gap > 2.4 && gap < 18 && tramGreen(cr)) { hold = true; break; }
      }
      const want = hold ? 0 : (c.vmax || c.v);
      c.v += (want - c.v) * Math.min(1, dt * 3.4);
      if (c.v < 0.03) c.v = 0;
      c.d += c.dir * c.v * dt;
      if (c.d > c.path.len) { c.d = c.path.len; c.dir = -1; }
      if (c.d < 0) { c.d = 0; c.dir = 1; }
      const p = streetPoint(c.path, c.d);
      if (Math.hypot(p.x - me.x, p.y - me.y) > 320) {
        const np = roadNear(me.x, me.y, 120);
        if (np) { c.path = np.path; c.d = np.d; c.dir = Math.random() < 0.5 ? 1 : -1; }
      }
    }
  }

  /* ------------------------------------------------------------- Zeichnen */
  function poly(p, fill, stroke, lw) {
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = lw || 0.2; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function stroke(p, w, col, cap) {
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    ctx.lineCap = cap || 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function rectAt(x, y, ang, w, h, fill, edge) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = fill;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    if (edge) {
      ctx.lineWidth = 0.45;
      ctx.strokeStyle = edge;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }

  function camCenterS() {
    if (SET.cam === 1) return S.s - 4;
    if (SET.cam === 2) return S.s - tlen() * 0.85;
    if (SET.cam === 3) return S.s - 3.0;
    return S.s - tlen() / 2;
  }
  function zoomFor(fa) {
    if (SET.cam === 3) return fa.h / 14;   /* Vogel: 14 m Bildhöhe, dicht über dem Dach */
    const k = SET.cam === 1 ? 0.55 : SET.cam === 2 ? 1.35 : 1.04;
    return fa.h / (tlen() * k);
  }
  function followCam(dt) {
    const camS = camCenterS();
    const p = offsetPoint(camS, TRACK_OFF * narrowFactor(camS) + S.lat);
    let d = p.ang - S.camAng;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    S.camAng += d * (1 - Math.pow(0.0008, dt));
  }

  function freeArea() {
    const st = $('stage').getBoundingClientRect();
    const bar = $('bar').getBoundingClientRect();
    const hud = $('hud').getBoundingClientRect();
    const k = W / (st.width || W);
    const top = Math.max(0, (bar.bottom - st.top) * k + 2);
    const bot = Math.min(H, (hud.top - st.top) * k - 2);
    return { top, bot, cy: (top + bot) / 2, h: Math.max(34, bot - top) };
  }

  function drawWorld() {
    const camS = camCenterS();
    const cam = offsetPoint(camS, TRACK_OFF * narrowFactor(camS) + S.lat);
    const Z = S.zoom;
    const fa = freeArea();
    const reach = Math.hypot(W, H) / 2 / Z + 80;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#a2dd6c';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, fa.cy);
    ctx.rotate(-S.camAng - Math.PI / 2);
    ctx.scale(Z, Z);
    ctx.translate(-cam.x, -cam.y);

    const x0 = cam.x - reach, x1 = cam.x + reach, y0 = cam.y - reach, y1 = cam.y + reach;
    const near = [];
    const seenI = new Set();
    for (let cx = Math.floor(x0 / GC); cx <= Math.floor(x1 / GC); cx++)
      for (let cy = Math.floor(y0 / GC); cy <= Math.floor(y1 / GC); cy++) {
        const list = grid.get(cx + ',' + cy);
        if (!list) continue;
        for (const i of list) {
          if (seenI.has(i)) continue;
          seenI.add(i);
          near.push(items[i]);
        }
      }

    for (const it of near) if (it.k === 'g') poly(it.p, '#5fdc63');
    for (const it of near) if (it.k === 'w') poly(it.p, '#2ec8ff');
    const isPath = t => t === 'footway' || t === 'path' || t === 'steps' ||
      t === 'bridleway' || t === 'cycleway' || t === 'track';
    for (const it of near) if (it.k === 'r' && !isPath(it.t)) stroke(it.p, it.c * 2 + 1.2, '#5b6474');
    for (const it of near) if (it.k === 'r') {
      stroke(it.p, it.c * 2, isPath(it.t) ? '#e7dfc4' : '#c0c9dc', isPath(it.t) ? 'butt' : 'round');
    }
    for (const it of near) if (it.k === 'b') poly(it.p, it.col, '#6b4a2a', 0.7);
    for (const it of near) if (it.k === 't') {
      ctx.fillStyle = '#1c8f3c';
      ctx.fillRect(it.p[0] - 1.6, it.p[1] - 1.6, 3.2, 3.2);
      ctx.fillStyle = '#4fe36b';
      ctx.fillRect(it.p[0] - 1.0, it.p[1] - 1.0, 2.0, 2.0);
    }

    drawStreetTraffic();
    drawTracks(S.s - 140, S.s + 140);
    drawStops();
    drawWalkers();
    drawSites();
    drawSwitches();
    drawNarrows();
    drawSignals();
    drawDepot();
    drawCrossers();

    for (const o of oncoming) {
      if (o.s + o.len < S.s - 200 || o.s > S.s + 200) continue;
      drawTram(o.s, o.len, o.sec, o.color, -1, o.num);
    }
    for (const a of ai) {
      if (a.s < S.s - 200 || a.s - a.len > S.s + 200) continue;
      drawTram(a.s, a.len, a.sec, a.color, 1, a.num);
    }
    if (SET.double) {
      const L = veh().len;
      drawTram(S.s - L - MOD_GAP, L, veh().sec, '#ffd21a', 1, S.lineId);
    }
    drawTram(S.s, veh().len, veh().sec, '#ffd21a', 1, S.lineId, true);
    ctx.restore();

    drawNightAndWeather(fa);
    drawMinimap(fa);
  }

  function drawTracks(s0, s1) {
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    for (const [w, col] of [[3.5, '#5b5442'], [2.6, '#8a7c60']]) {
      ctx.beginPath();
      for (const b of bedSegs) {
        if (b.s1 < s0 || b.s0 > s1) continue;
        ctx.moveTo(b.x0, b.y0);
        ctx.lineTo(b.x1, b.y1);
      }
      ctx.lineWidth = w;
      ctx.strokeStyle = col;
      ctx.stroke();
    }
    ctx.beginPath();
    for (const r of railSegs) {
      if (r.s0 < s0 || r.s0 > s1) continue;
      ctx.moveTo(r.x0, r.y0);
      ctx.lineTo(r.x1, r.y1);
    }
    ctx.lineWidth = 0.46;
    ctx.strokeStyle = '#eaf0f3';
    ctx.stroke();
  }

  function drawStreetTraffic() {
    for (const c of streetCars) {
      const p = streetPoint(c.path, c.d);
      const ang = c.dir > 0 ? p.ang : p.ang + Math.PI;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(30,40,25,.3)';
      ctx.fillRect(-c.len / 2 + 0.3, -c.wid / 2 + 0.45, c.len, c.wid);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.len / 2, -c.wid / 2, c.len, c.wid);
      ctx.fillStyle = '#202a33';
      ctx.fillRect(-c.len * 0.1, -c.wid * 0.36, c.len * 0.34, c.wid * 0.72);
      ctx.restore();
    }
  }

  function drawStops() {
    for (const st of stops) {
      if (st.s < S.s - 150 || st.s > S.s + 150) continue;
      const back = st.s - (st.plat - 12);
      const a = offsetPoint(back, TRACK_OFF + 2.0);
      const b = offsetPoint(back, TRACK_OFF + 6.0);
      const c = offsetPoint(st.s + 12, TRACK_OFF + 6.0);
      const d = offsetPoint(st.s + 12, TRACK_OFF + 2.0);
      poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y], '#e6dfc9', '#7d7563', 0.6);
      const e = offsetPoint(back, TRACK_OFF + 2.5);
      const f = offsetPoint(st.s + 12, TRACK_OFF + 2.5);
      stroke([e.x, e.y, f.x, f.y], 0.6, st.skip ? '#b84a3a' : '#e8c53c');

      const sh = offsetPoint(st.s + 5, TRACK_OFF + 4.3);
      rectAt(sh.x, sh.y, sh.ang, 7.0, 2.6, '#8f9aa2', '#4b545c');
      const sg = offsetPoint(st.s - 10, TRACK_OFF + 2.8);
      rectAt(sg.x, sg.y, sg.ang, 1.6, 2.4, st.skip ? '#8a3a2e' : lineCol, '#14202a');
      if (!st.stepFree) {
        const rp = offsetPoint(st.s - 6, TRACK_OFF + 2.9);
        rectAt(rp.x, rp.y, rp.ang, 1.1, 1.1, '#2f6fb0', '#101418');
      }

      const n = Math.min(8, st.wait + (S.boardStop === st ? S.board : 0));
      for (let i = 0; i < n; i++) {
        const p = offsetPoint(st.s - 9 + (i % 6) * 2.3, TRACK_OFF + 3.9 + (i % 2) * 0.9);
        drawPersonAt(p.x, p.y, S.t * 2.2 + i * 1.7, ['#37506b', '#6b3750', '#4a5c37', '#5b4a2f'][i % 4], false);
      }
    }
  }

  function drawPersonAt(x, y, phase, color, arm) {
    const step = Math.sin(phase) * 0.3;
    ctx.fillStyle = '#20262c';
    ctx.fillRect(x - 0.45 + step, y + 0.55, 0.32, 0.8);
    ctx.fillRect(x + 0.13 - step, y + 0.55, 0.32, 0.8);
    ctx.fillStyle = color;
    ctx.fillRect(x - 0.55, y - 0.55, 1.1, 1.25);
    ctx.fillStyle = '#e3bd93';
    ctx.fillRect(x - 0.4, y - 1.55, 0.8, 0.82);
    ctx.fillStyle = '#2b333b';
    ctx.fillRect(x - 0.42, y - 1.74, 0.84, 0.24);
    if (arm) {
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.55, y - 1.3, 0.3, 1.15);
      ctx.fillStyle = '#e3bd93';
      ctx.fillRect(x + 0.56, y - 1.58, 0.29, 0.3);
    }
  }

  function drawWalkers() {
    for (const w of S.walkers) {
      if (w.st.s < S.s - 160 || w.st.s > S.s + 160 || w.delay > 0) continue;
      const t = Math.min(1, w.t);
      const e = t * t * (3 - 2 * t);
      const p = offsetPoint(w.s0 + (w.s1 - w.s0) * e, w.off0 + (w.off1 - w.off0) * e);
      drawPersonAt(p.x, p.y, S.t * 10 + w.seed, w.color, false);
    }
  }

  function drawSites() {
    for (const si of sites) {
      if (si.s1 < S.s - 140 || si.s0 > S.s + 200) continue;
      if (si.kind === 'bau') {
        for (let s = si.s0; s < si.s1; s += 10) {
          for (const side of [-1, 1]) {
            const p = offsetPoint(s, side * 3.6);
            rectAt(p.x, p.y, p.ang, 2.4, 0.8, ((s / 10) | 0) % 2 ? '#e8642c' : '#f1e9d8', '#5b3a24');
          }
        }
      } else {
        const p = offsetPoint(si.s0 - 8, TRACK_OFF + 2.2);
        rectAt(p.x, p.y, p.ang, 2.6, 2.2, '#f0c81e', '#5b4a06');
      }
    }
  }

  function drawSignals() {
    /* Signale muessen auch bei Standard-Zoom klar lesbar sein: die Leinwand
       rendert intern klein, deshalb Mindestgroesse auf dem Schirm. Die
       Innenkante bleibt am Gleis, das Gehaeuse waechst nach aussen. */
    const k = Math.max(1, Math.min(2.8, 26 / (5.3 * S.zoom)));
    for (const g of signals) {
      if (g.s < S.s - 160 || g.s > S.s + 280) continue;
      const p = offsetPoint(g.s, TRACK_OFF + 3.1 + (k - 1) * 2.65);
      const asp = signalAspect(g);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang);
      ctx.scale(k, k);
      /* Mast */
      ctx.fillStyle = '#1a2028';
      ctx.fillRect(-0.18, -1.2, 0.36, 2.4);
      /* Schatten */
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(-2.75, -1.55, 5.5, 3.1);
      /* Gehäuse: heller Rahmen, dunkler Kasten */
      ctx.fillStyle = '#f7f2e2';
      ctx.fillRect(-2.65, -1.4, 5.3, 2.8);
      ctx.fillStyle = '#0c1620';
      ctx.fillRect(-2.45, -1.2, 4.9, 2.4);
      /* Drei Lampen: Halt, Gerade, Abbiegen */
      const slots = [
        ['halt', -1.6, '#ff3b30'],
        ['free', 0, '#27e06a'],
        ['turn', 1.6, '#ffb020'],
      ];
      for (const [id, cx, col] of slots) {
        const on = (id === 'halt' && asp === 'halt') ||
          (id === 'free' && asp === 'free') ||
          (id === 'turn' && (asp === 'left' || asp === 'right'));
        if (on) {
          ctx.globalAlpha = 0.30;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(cx, 0, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = on ? col : '#1b2a36';
        ctx.beginPath();
        ctx.arc(cx, 0, 0.64, 0, Math.PI * 2);
        ctx.fill();
        if (on) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.beginPath();
          ctx.arc(cx - 0.16, -0.16, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (g.major && g.kind === 'cross') {
        /* Erkenner-Platte "A" – die Ampel erkennt die Bahn */
        ctx.fillStyle = '#f7f5ec';
        ctx.fillRect(-2.2, -0.72, 0.5, 0.5);
        ctx.fillStyle = '#0c1620';
        ctx.fillRect(-2.12, -0.64, 0.07, 0.32);
        ctx.fillRect(-2.0, -0.64, 0.07, 0.32);
        ctx.fillRect(-2.12, -0.48, 0.22, 0.06);
      }
      ctx.restore();
    }
  }

  function drawSwitches() {
    for (const sw of switches) {
      if (sw.s < S.s - 90 || sw.s > S.s + 320) continue;
      const branch = sw.req === 'L' ? 1 : -1;
      let prev = null;
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const p = offsetPoint(sw.s + t * 18, TRACK_OFF + t * 8 * branch);
        if (prev) {
          stroke([prev.x, prev.y, p.x, p.y], 2.2, '#736a58', 'butt');
          stroke([prev.x, prev.y, p.x, p.y], 0.4, '#eaf0f3', 'butt');
        }
        prev = p;
      }
      const lp = offsetPoint(sw.s - 1.5, TRACK_OFF + 2.4);
      rectAt(lp.x, lp.y, lp.ang, 1.6, 2.6, sw.set === sw.req ? '#4ef07a' : '#ff4b3a', '#11161a');
      ctx.save();
      ctx.translate(lp.x, lp.y);
      ctx.rotate(lp.ang);
      ctx.fillStyle = '#101418';
      ctx.beginPath();
      if (sw.req === 'L') {
        ctx.moveTo(-0.75, 0); ctx.lineTo(0.35, -0.75); ctx.lineTo(0.35, 0.75);
      } else {
        ctx.moveTo(0.75, 0); ctx.lineTo(-0.35, -0.75); ctx.lineTo(-0.35, 0.75);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawNarrows() {
    for (const nz of narrows) {
      if (nz.s1 < S.s - 170 || nz.s0 > S.s + 170) continue;
      const free = !narrowBusy(nz);
      if (nz.kind === 'bau') {
        for (let s = nz.s0 + 2; s < nz.s1; s += 9) {
          for (const side of [-1, 1]) {
            const p = offsetPoint(s, side * 3.3);
            rectAt(p.x, p.y, p.ang, 2.6, 0.8, ((s / 9) | 0) % 2 ? '#e8642c' : '#f1e9d8', '#5b3a24');
          }
        }
      }
      /* Einfahrsignal an beiden Enden des eingleisigen Abschnitts.
         Mindestgroesse auf dem Schirm, damit Rot/Gruen bei Standard-Zoom
         klar erkennbar ist; der Mastfuss bleibt am Gleis. */
      const ek = Math.max(1, Math.min(4.4, 16 / (0.98 * 2 * S.zoom)));
      const ends = nz.kind === 'single'
        ? [[nz.s0 - 22, 1], [nz.s1 + 22, -1]]
        : [[nz.s0 - 20, 1]];
      for (const [s, side] of ends) {
        const p = offsetPoint(s, side * (3.4 + (ek - 1) * 0.98));
        /* Mast */
        ctx.fillStyle = '#1a2028';
        ctx.fillRect(p.x - 0.18 * ek, p.y - 1.2 * ek, 0.36 * ek, 2.4 * ek);
        /* Schatten */
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        ctx.arc(p.x + 0.2 * ek, p.y + 0.24 * ek, 1.05 * ek, 0, Math.PI * 2);
        ctx.fill();
        /* Gehäuse */
        ctx.fillStyle = '#f7f2e2';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.98 * ek, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0c1620';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8 * ek, 0, Math.PI * 2);
        ctx.fill();
        /* Lampe */
        ctx.fillStyle = free ? '#27e06a' : '#ff3b30';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.52 * ek, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(p.x - 0.14 * ek, p.y - 0.14 * ek, 0.16 * ek, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawDepot() {
    if (total - S.s > 120 || S.s > total + 40) return;
    const p = offsetPoint(total - 26, TRACK_OFF + 9);
    rectAt(p.x, p.y, p.ang, 26, 14, '#6f7a83', '#3b464f');
    const q = offsetPoint(total - 6, TRACK_OFF + 3.2);
    rectAt(q.x, q.y, q.ang, 3.2, 1.5, '#e8c53c', '#11161a');
  }

  function drawCrossers() {
    for (const c of crossers) {
      if (Math.abs(c.s - S.s) > 130) continue;
      const p = offsetPoint(c.s, c.off);
      if (c.kind === 'car') {
        const ang = p.ang + Math.PI / 2 * c.dir;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(20,25,30,.25)';
        ctx.fillRect(-2.3 + 0.25, -1.1 + 0.35, 4.6, 2.2);
        ctx.fillStyle = c.color;
        ctx.fillRect(-2.3, -1.1, 4.6, 2.2);
        ctx.fillStyle = '#202a33';
        ctx.fillRect(0.6, -0.75, 1.2, 1.5);
        ctx.restore();
      } else if (c.kind === 'bike') {
        rectAt(p.x, p.y, p.ang + Math.PI / 2, 1.9, 0.5, '#22282e', null);
        drawPersonAt(p.x, p.y - 0.15, S.t * 8 + (c.seed || 0), c.color, false);
      } else {
        drawPersonAt(p.x, p.y, S.t * 9 + (c.seed || 0), c.color, c.yield);
      }
    }
  }

  /* ------------------------------------------------------------- Fahrzeuge */
  const SPR = {};
  function sprite(color) {
    if (SPR[color]) return SPR[color];
    const mw = 34, mh = 10;
    const c = document.createElement('canvas');
    c.width = mw; c.height = mh;
    const g = c.getContext('2d');
    g.fillStyle = color; g.fillRect(0, 0, mw, mh);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(1, 1, mw - 2, 1);
    g.fillStyle = '#1e2b38';
    g.fillRect(2, 2, mw - 4, 2);
    g.fillRect(2, 7, mw - 4, 2);
    g.fillStyle = 'rgba(255,255,255,.35)';
    for (let x = 8; x < mw - 5; x += 11) { g.fillRect(x, 2, 1, 2); g.fillRect(x, 7, 1, 2); }
    g.fillStyle = '#f4f7f2';
    g.fillRect(1, 4, mw - 2, 1);
    g.fillStyle = '#101418';
    g.fillRect(0, 0, mw, 1); g.fillRect(0, mh - 1, mw, 1);
    g.fillRect(0, 0, 1, mh); g.fillRect(mw - 1, 0, 1, mh);
    g.fillStyle = '#2a3a4a';
    g.fillRect(0, 3, 2, 4); g.fillRect(mw - 2, 3, 2, 4);
    SPR[color] = c;
    return c;
  }

  function drawTram(front, L, sec, color, dir, num, isPlayer) {
    const secLen = (L - MOD_GAP * (sec - 1)) / sec;
    const vw = TRAM_W * 1.02;
    const mods = [];
    for (let i = 0; i < sec; i++) {
      const rd = i * (secLen + MOD_GAP);
      const p1 = sample(front - dir * rd);
      const p2 = sample(front - dir * (rd + secLen));
      const ang = Math.atan2(p1.y - p2.y, p1.x - p2.x);
      const midS = front - dir * (rd + secLen / 2);
      const r = rightOf(ang);
      const o = TRACK_OFF * narrowFactor(midS) + (isPlayer ? S.lat : 0);
      mods.push({ x: (p1.x + p2.x) / 2 + r[0] * o, y: (p1.y + p2.y) / 2 + r[1] * o, ang, len: secLen });
    }
    for (const m of mods) {
      ctx.save();
      ctx.translate(m.x + 0.35, m.y + 0.45);
      ctx.rotate(m.ang);
      ctx.fillStyle = 'rgba(40,50,30,.32)';
      ctx.fillRect(-m.len / 2, -vw / 2, m.len, vw);
      ctx.restore();
    }
    for (const m of mods) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.ang);
      ctx.fillStyle = '#2c2611';
      ctx.fillRect(m.len / 2, -TRAM_W * 0.52, MOD_GAP, TRAM_W * 1.04);
      ctx.drawImage(sprite(color), -m.len / 2, -vw / 2, m.len, vw);
      ctx.restore();
    }
    const f = sample(front);
    const fAng = dir > 0 ? f.ang : f.ang + Math.PI;
    const r = rightOf(fAng);
    const o = TRACK_OFF * narrowFactor(front) + (isPlayer ? S.lat : 0);
    ctx.save();
    ctx.translate(f.x + r[0] * o, f.y + r[1] * o);
    ctx.rotate(fAng);
    ctx.fillStyle = '#1b2836';
    ctx.fillRect(-0.6, -TRAM_W / 2 + 0.22, 0.65, TRAM_W - 0.44);
    ctx.fillStyle = '#ffe9a3';
    ctx.fillRect(0.05, -0.55, 0.5, 0.55);
    ctx.fillRect(0.05, 0.05, 0.5, 0.55);
    ctx.restore();

    if (isPlayer) {
      const lp = offsetPoint(front, TRACK_OFF * narrowFactor(front) + S.lat);
      rectAt(lp.x, lp.y, f.ang, 1.2, 0.9, lineCol, '#101418');
    }
  }

  /* --------------------------------------------------- Wetter, Nacht, Karte */
  function drawNightAndWeather(fa) {
    const wx = SET.weather;
    if (wx === 'snow') {
      ctx.fillStyle = 'rgba(238,246,255,.14)';
      ctx.fillRect(0, 0, W, H);
    }
    if (SET.night) {
      ctx.fillStyle = 'rgba(8,14,34,.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, fa.bot, 0, fa.bot - 80);
      g.addColorStop(0, 'rgba(255,236,170,.30)');
      g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 7, fa.bot);
      ctx.lineTo(W / 2 + 7, fa.bot);
      ctx.lineTo(W / 2 + 36, fa.bot - 84);
      ctx.lineTo(W / 2 - 36, fa.bot - 84);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (wx === 'fog') {
      ctx.fillStyle = 'rgba(214,222,226,.30)';
      ctx.fillRect(0, 0, W, H);
    }
    if (wx === 'rain') {
      ctx.fillStyle = 'rgba(64,86,106,.16)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(198,226,248,.55)';
      for (let i = 0; i < 44; i++) {
        const x = (i * 37 + S.t * 90 * (i % 3 + 1)) % (W + 10) - 5;
        const y = (i * 23 + S.t * 150 * (i % 2 + 1)) % (H + 10) - 5;
        ctx.fillRect(x, y, 1, 4);
      }
    } else if (wx === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 19 + S.t * 12 * (i % 3 + 1)) % (W + 6) - 3;
        const y = (i * 13 + S.t * 22) % (H + 6) - 3;
        ctx.fillRect(x, y, 1, 1);
      }
    } else if (wx === 'leaf') {
      for (let i = 0; i < 16; i++) {
        const x = (i * 31 + S.t * 26 * (i % 2 + 1)) % (W + 8) - 4;
        const y = (i * 17 + S.t * 34) % (H + 8) - 4;
        ctx.fillStyle = i % 2 ? '#c98a2e' : '#a85f22';
        ctx.fillRect(x, y, 1.5, 1);
      }
    }
  }

  function drawMinimap(fa) {
    if (!bounds || !mapPts.length) return;
    const w = 42, h = 14, x = 4, y = fa.top + 2;
    ctx.fillStyle = 'rgba(8,13,18,.72)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#33414c';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, h);
    const bw = Math.max(1, bounds.x1 - bounds.x0), bh = Math.max(1, bounds.y1 - bounds.y0);
    const k = Math.min((w - 4) / bw, (h - 4) / bh);
    const ox = x + 2 + ((w - 4) - bw * k) / 2, oy = y + 2 + ((h - 4) - bh * k) / 2;
    ctx.beginPath();
    for (let i = 0; i < mapPts.length; i += 2) {
      const px = ox + (mapPts[i] - bounds.x0) * k;
      const py = oy + (mapPts[i + 1] - bounds.y0) * k;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    const pp = sample(S.s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + (pp.x - bounds.x0) * k - 1, oy + (pp.y - bounds.y0) * k - 1, 2, 2);
  }

  /* ---------------------------------------------------------------- HUD */
  let toastTimer = 0;
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('on');
    toastTimer = 2.6;
  }
  function showMsg(text, cls) {
    const el = $('msg');
    el.textContent = text;
    el.className = 'on ' + (cls || '');
    S.msgT = 4.2;
  }
  function say(text) {
    if (!SET.voice || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = 1.02;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* Klingel wie in Dresden: zwei helle Glockenschläge, "ding-dong" */
  let ac = null, acGain = null;
  function audioCtx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      acGain = ac.createGain();
      acGain.gain.value = 0.2;
      acGain.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function ringBell(vol = 1) {
    const c = audioCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const hit = (f, t) => {
      [[1, 0.22], [2.01, 0.09], [2.98, 0.045]].forEach(([mul, g]) => {
        const o = c.createOscillator();
        const gn = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f * mul, t);
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(g * vol, t + 0.008);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(gn);
        gn.connect(acGain);
        o.start(t);
        o.stop(t + 0.65);
      });
    };
    hit(1174.7, t0);        /* ding */
    hit(987.8, t0 + 0.17);  /* dong */
  }
  function bell() {
    ringBell(1);
    if (S.tut) S.tut.belled = true;
    clearCrossers();
    const b = $('btnBell');
    if (b) {
      b.classList.add('ring');
      setTimeout(() => b.classList.remove('ring'), 320);
    }
  }

  /* Form statt Farbe: 'halt' = liegender Balken, 'free' = senkrechter Balken,
     'left'/'right' = Schräge zum Abzweig. */
  function signalAspect(g) {
    if (g.kind === 'stop') return S.doors > 0.05 ? 'halt' : 'free';
    if (S.signalFail > 0 || g.prio) return 'free';
    const blocked = crossers.some(c => !c.cleared && Math.abs(c.s - g.s) < 16 && Math.abs(c.off) < 13);
    if (blocked) return 'halt';
    if (g.kind === 'cross' && g.cross) return tramGreen(g.cross) ? 'free' : 'halt';
    const sw = nextSwitch();
    if (sw && sw.s > g.s && sw.s - g.s < 30) return sw.req === 'L' ? 'left' : 'right';
    const t = (S.t + g.phase) % 32;
    return t < 25 ? 'free' : 'halt';
  }
  function nextSignal() {
    let best = null;
    for (const g of signals) if (g.s > S.s - 3 && (!best || g.s < best.s)) best = g;
    return best;
  }
  function nextSwitch() {
    let best = null;
    for (const sw of switches) if (sw.s > S.s - 2 && (!best || sw.s < best.s)) best = sw;
    return best;
  }
  function narrowBusy(nz) {
    return oncoming.some(o => o.s < nz.s1 + 14 && o.s + o.len > nz.s0 - 26);
  }
  function siteAt(s) {
    return sites.find(si => s >= si.s0 && s <= si.s1) || null;
  }
  function nextSite() {
    let best = null;
    for (const si of sites) if (si.s1 > S.s && (!best || si.s0 < best.s0)) best = si;
    return best;
  }
  function nextStop() {
    for (const st of stops) if (st.s > S.s + 4) return st;
    return null;
  }
  function stopsAt() {
    return stops.find(st => Math.abs(st.s - S.s) < STOP_WIN) || null;
  }

  /* Haltestelle, deren Bahnsteig der Zug gerade ueberdeckt. */
  function stopAtPlatform() {
    for (const st of stops) {
      if (st.served || st.skip) continue;
      const a = st.s - st.plat + 12;
      if (S.s >= a - 6 && S.s - tlen() <= st.s + 12 + 6) return st;
    }
    return null;
  }
  function planAt(s) {
    let n = 0;
    for (const st of stops) if (st.s < s) n++;
    let x = 0;
    /* Rotphasen an signalisierten Kreuzungen sind im Fahrplan eingeplant */
    for (const c of crossings) if (c.sig && c.s < s) x++;
    return s / 8.2 + n * 14 + x * 4.2;
  }
  function planDelta() {
    return S.t - (planAt(S.s) - planAt(line.start || 40));
  }
  function planTxt(d) {
    const v = Math.round(d);
    return (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v) + ' s';
  }

  const INC_TEXTS = [
    'Fahrgast ohne gültigen Fahrschein',
    'Durchsage: Bitte beim Einsteigen auf die Stufe achten',
    'Fahrgast mit sperrigem Gepäck blockiert den Gang',
    'Tourist fragt nach dem Weg zum Zwinger',
    'Zeitungsverkäufer steigt zu',
    'Schaffner krank – Fahrgäste kontrollieren sich selbst',
  ];
  const FLAVOR = [
    'Funk: Leitstelle, wir sind planmäßig unterwegs.',
    'Funk: Sperrung am Altmarkt, Umleitung wird geprüft.',
    'Durchsage: Bitte beim Aussteigen auf Radfahrer achten.',
    'Funk: Ein Wagen der Linie 3 meldet Verspätung.',
    'Durchsage: Wegen Bauarbeiten fährt die Linie 9 Umleitung.',
    'Funk: Haltestelle wird barrierefrei ausgebaut.',
    'Durchsage: Fundsache – ein Regenschirm wartet am Fahrerstand.',
  ];

  function updateHud() {
    if (!line) return;
    const nxt = nextStop();
    $('nextStop').textContent = nxt ? nxt.name : 'Betriebshof';
    $('nextDist').textContent = nxt ? Math.max(0, Math.round(nxt.s - S.s)) + ' m' : 'Ende';
    const kmh = Math.round(S.v * 3.6);
    $('speed').textContent = kmh;
    $('speedBar').style.width = Math.min(100, (S.v / veh().vmax) * 100) + '%';
    $('speedBar').style.background = kmh > Math.round(veh().vmax * 3.6) - 1 ? '#ff8a5c' : '';
    $('vmax').textContent = Math.round(veh().vmax * 3.6) + ' km/h max';
    $('score').textContent = S.score;
    $('pax').textContent = S.pax + ' Fahrgäste';
    $('btnLine').textContent = S.lineId;
    $('btnLine').style.background = lineCol;
    $('btnLine').style.color = '#101010';
    $('btnVeh').textContent = veh().name + (SET.double ? ' ×2' : '');
    $('moodBar').style.width = S.mood + '%';
    $('moodBar').style.background = S.mood > 65 ? '#4ef07a' : S.mood > 35 ? '#ffd21a' : '#ff6a4f';

    const d = planDelta();
    $('planChip').textContent = planTxt(d);
    $('planChip').className = 'chip ' + (Math.abs(d) <= 25 ? 'ok' : Math.abs(d) <= 60 ? 'warn' : 'bad');

    const st = stopsAt();
    const open = S.doors > 0.5;
    $('doors').classList.toggle('open', open);
    $('btnDoor').classList.toggle('on', S.doorTarget > 0.5);
    if (S.doors > 0.9) {
      $('doorHead').textContent = 'Türen offen';
      $('doorSub').textContent = S.board > 0 || S.alight > 0
        ? 'Fahrgastwechsel · ' + (S.board + S.alight) + ' offen'
        : 'schließen zum Weiterfahren';
    } else if (S.doors > 0.02) {
      $('doorHead').textContent = 'Türen bewegen sich';
      $('doorSub').textContent = '…';
    } else {
      $('doorHead').textContent = 'Türen geschlossen';
      $('doorSub').textContent = st ? (st.skip ? 'Halt entfällt' : 'halt: TÜREN drücken') : 'an der Haltestelle halten';
    }

    const g = nextSignal();
    const sigEl = $('sig');
    if (g && g.s - S.s < 280) {
      const a = signalAspect(g);
      const lbl = a === 'halt' ? 'HALT' : a === 'left' ? 'LINKS' : a === 'right' ? 'RECHTS' : 'FAHRT';
      sigEl.className = 'sig ' + (a === 'halt' ? 'red' : 'green');
      sigEl.textContent = lbl + ' ' + Math.max(0, Math.round(g.s - S.s)) + ' m';
    } else {
      sigEl.className = 'sig off';
      sigEl.textContent = '—';
    }

    const sw = nextSwitch();
    const swNear = sw && sw.s - S.s < 900;
    $('swInfo').textContent = swNear ? Math.round(sw.s - S.s) + ' m · ' + (sw.req === 'L' ? '◀' : '▶') : '—';
    $('weiche').classList.toggle('warn', !!swNear && sw.set !== sw.req && sw.s - S.s < 320);
    $('btnSwL').classList.toggle('on', !!swNear && sw.set === 'L');
    $('btnSwR').classList.toggle('on', !!swNear && sw.set === 'R');

    const si = siteAt(S.s) || nextSite();
    const siNear = si && (siteAt(S.s) || si.s0 - S.s < 260);
    if (siNear) {
      $('laChip').classList.remove('hidden');
      $('laChip').textContent = (si.kind === 'bau' ? 'BAU ' : 'LA ') + si.limit;
      $('laChip').className = 'chip ' + (S.v * 3.6 > si.limit + 2 ? 'bad' : 'warn');
    } else $('laChip').classList.add('hidden');

    $('wxChip').textContent = WX[SET.weather].label + (SET.night ? ' · NACHT' : '');
    $('prioChip').classList.toggle('hidden', !signals.some(g2 => g2.prio && g2.s > S.s - 10 && g2.s < S.s + 240));

    const chips = $('cars');
    if (chips) {
      for (const b of chips.children) {
        const i = +b.dataset.car;
        if (i >= S.car.length) continue;
        const onCar = S.car[i] > 0.5;
        const atPlat = !st || carOnPlatform(i, st);
        b.className = onCar ? 'on' : atPlat ? '' : 'bad';
      }
    }

    $('btnSifa').textContent = !SET.sifa ? 'SIFA AUS' : S.sifaDead ? 'SIFA !' : 'SIFA ' + Math.ceil(S.sifa);
    $('btnSifa').classList.toggle('alert', SET.sifa && (S.sifaDead || S.sifa < 8));
    $('btnSifa').classList.toggle('off', !SET.sifa);
    $('btnSand').textContent = S.sand > 0 ? 'SAND ✓' : S.sandCd > 0 ? 'SAND ' + Math.ceil(S.sandCd) : 'SAND';
    $('btnSand').classList.toggle('on', S.sand > 0);
    let crossD = Infinity;
    for (const c of crossers) {
      if (c.cleared) continue;
      const gap = c.s - S.s;
      if (gap > 8 && gap < 100 && gap < crossD) crossD = gap;
    }
    $('crossHint').classList.toggle('hidden', crossD === Infinity);
    if (crossD < Infinity) $('crossHint').innerHTML = 'KLINGEL <b>' + Math.round(crossD) + ' m</b>';

    $('btnCam').textContent = ['KAM', 'FST', 'MIT', 'VOGEL'][SET.cam];
    $('btnVoice').classList.toggle('on', SET.voice);

    $('motChip').textContent = (S.motCut ? 'MOT ! ' : 'MOT ') + Math.round(S.mot) + '°';
    $('motChip').className = 'chip ' + (S.motCut || S.mot > 100 ? 'bad' : S.mot > 92 ? 'warn' : 'ok');
    $('lever').classList.toggle('hot', S.mot > 92 || S.motCut);

    const nz = narrows.find(n => S.s > n.s0 - 230 && S.s < n.s1 + 40) || null;
    const nzChip = $('singleChip');
    if (nz) {
      const busy = narrowBusy(nz);
      const inside = S.s > nz.s0 - 2 && S.s - tlen() < nz.s1 + 4;
      nzChip.classList.remove('hidden');
      nzChip.textContent = nz.kind === 'bau' ? 'BAU · EINGLEISIG ' + Math.max(0, Math.round(nz.s0 - S.s)) + ' m' :
        busy ? (inside ? 'EINGLEISIG · GEGENBAHN' : 'EINGLEISIG · warten ' + Math.max(0, Math.round(nz.s0 - S.s)) + ' m') : 'EINGLEISIG';
      nzChip.className = 'chip ' + (busy ? 'bad' : 'warn');
    } else nzChip.classList.add('hidden');
  }

  /* ---------------------------------------------------------- Fahrschule */
  const TUT = [
    { t: 'Anfahren', d: 'Hebel links hochziehen oder W/↑ halten, bis der Wagen rollt.', ok: () => S.v > 3 },
    { t: 'Klingel', d: 'Fußgänger queren die Gleise? K oder KLL klingeln – sie treten zurück.', ok: () => S.tut.belled },
    { t: 'Sifa', d: 'Sifa mit F oder SIFA quittieren. Im Startbild ist sie abschaltbar.', ok: () => !SET.sifa || S.tut.sifa },
    { t: 'Zielbremsen', d: 'An der nächsten Haltestelle mit Hebel oder S/↓ anhalten.', ok: () => { const st = stopsAt(); return !!st && S.v < 0.2; } },
    { t: 'Türen & Fahrgäste', d: 'TÜREN öffnet alle Wagen am Bahnsteig, W1–W4 einzeln – kurze Bahnsteige nur vorn.', ok: () => { const T = S.tut; return T.opened && S.doors < 0.05 && S.board === 0 && S.alight === 0; } },
    { t: 'Weiche', d: 'Vor der Weiche die angezeigte Richtung mit ◀ ▶ (Z/X) stellen.', ok: () => S.tut.switched },
  ];
  function showTut() {
    const T = S.tut;
    const box = $('tut');
    if (!box) return;
    if (!T) { box.classList.add('hidden'); return; }
    if (T.done) {
      $('tutStep').textContent = 'FAHRSCHULE · BESTANDEN';
      $('tutText').textContent = 'Alle Übungen geschafft. Jetzt frei fahren – oder neu starten.';
      box.classList.remove('hidden');
      return;
    }
    $('tutStep').textContent = 'FAHRSCHULE · ' + (T.step + 1) + '/' + TUT.length + ' · ' + TUT[T.step].t;
    $('tutText').textContent = TUT[T.step].d;
    box.classList.remove('hidden');
  }
  function updateTut() {
    const T = S.tut;
    if (!T || T.done) return;
    if (S.doors > 0.9) T.opened = true;
    const step = TUT[T.step];
    if (!step || !step.ok()) return;
    T.step++;
    if (T.step >= TUT.length) {
      T.done = true;
      S.score += 200;
      toast('Fahrschule bestanden · +200');
      showMsg('Fahrschule bestanden! Ab jetzt frei fahren.', 'good');
      say('Fahrschule bestanden. Gute Fahrt.');
      showTut();
      setTimeout(() => { const b = $('tut'); if (b && S.tut && S.tut.done) b.classList.add('hidden'); }, 6000);
    } else {
      toast('Fahrschule · ' + (T.step + 1) + '/' + TUT.length);
      showTut();
    }
  }
  function startTutorial() {
    reset();
    S.tut = { step: 0, belled: false, sifa: false, opened: false, switched: false, done: false };
    $('start').classList.add('hidden');
    S.started = true; S.prevS = S.s; S.crossT = 30;
    toast('Fahrschule · Anfahren');
    showTut();
    if (SET.voice) say('Fahrschule. Bitte anfahren.');
  }

  function ctxShow(title, sub, buttons, modal) {
    S.ctx = { title, sub, buttons, modal: !!modal };
    $('ctxTitle').textContent = title;
    $('ctxSub').textContent = sub || '';
    const box = $('ctxBtns');
    box.innerHTML = '';
    buttons.forEach((b, i) => {
      const el = document.createElement('button');
      el.textContent = b.label;
      if (b.primary) el.className = 'primary';
      el.addEventListener('click', () => {
        if (!b.keep) ctxHide();
        b.fn();
      });
      box.appendChild(el);
    });
    $('ctx').classList.remove('hidden');
    $('ctx').classList.toggle('modal', !!modal);
  }
  function ctxHide() {
    S.ctx = null;
    S.decide = null;
    $('ctx').classList.add('hidden');
    $('ctx').classList.remove('modal');
  }

  /* ------------------------------------------------------------- Logik */
  function reset() {
    S.s = line.start || 40; S.v = 0; S.doors = 0; S.doorTarget = 0;
    syncCars(); S.walkers = []; S.tut = null;
    S.served = new Set(); S.score = 0; S.t = 0; S.finished = false; S.paused = false;
    S.pax = 0; S.fines = 0; S.prevS = S.s; S.inc = null; S.doorFault = 0; S.signalFail = 0;
    S.alight = 0; S.board = 0; S.boardStop = null; S.msgT = 0; S.flavorT = 30;
    S.mood = 70; S.sifa = SIFA_MAX; S.sifaDead = false; S.sand = 0; S.sandCd = 0;
    S.lat = 0; S.shunt = null; S.rampDown = false; S.crossT = 8; S.contactCd = 0;
    S.mot = 40; S.motMax = 40; S.motCut = false; S.motWarnT = 0; S.motTrips = 0;
    crossers = [];
    LEV.val = LEV.thr = LEV.brk = 0; paintLever();
    S.camAng = sample(S.s - tlen() / 2).ang;
    for (const st of stops) {
      st.wait = st.wait0; st.served = false; st.missed = false; st.wait = st.skip ? 0 : st.wait;
      if (st.s < S.s - 1) st.served = true;
    }
    for (const nz of narrows) { nz.waited = false; nz.cleared = false; nz.warned = false; }
    for (const sw of switches) {
      sw.set = sw.set0; sw.scored = false; sw.penalized = false;
    }
    for (const inc of incidents) inc.done = false;
    for (const g of signals) { g.prio = false; g.prioT = 0; }
    ctxHide();
    $('end').classList.add('hidden');
    $('tut').classList.add('hidden');
    $('start').classList.remove('hidden');
    $('msg').className = '';
    $('btnPause').textContent = 'Pause';
    S.started = false;
    applyZoom();
    buildSettings();
    buildCarChips();
    updateHud();
  }

  function applyZoom() {
    const fa = freeArea();
    S.zoom = zoomFor(fa);
  }

  function serveStop(st) {
    st.served = true;
    S.served.add(st.name);
    S.boardStop = st;
    S.alight = Math.min(S.pax, 1 + Math.floor(Math.random() * Math.min(6, S.pax)));
    S.board = st.wait; st.wait = 0;
    S.alightT = 0.25;
    S.boardT = 0.5 * (SET.double ? 1.4 : 1);
    S.carPen.fill(false);
    spawnWalkers(st);
    S.score += 100;
    S.mood = Math.min(100, S.mood + 2);
    const d = planDelta();
    const onTime = Math.abs(d) <= 25;
    if (onTime) S.score += 30;
    toast('Halt ' + st.name + ' · +100' + (onTime ? ' · pünktlich +30' : ''));
    const nxt = nextStop();
    if (nxt && !nxt.skip) { showMsg('Nächster Halt: ' + nxt.name); say('Nächster Halt: ' + nxt.name); }
    else if (nxt) showMsg('Nächster Halt entfällt: ' + nxt.name);
  }

  /* Fahrgäste laufen sichtbar zur Tür und wieder zurück */
  function spawnWalkers(st) {
    const cars = [];
    for (let i = 0; i < S.car.length; i++) if (S.car[i] > 0.9 && carOnPlatform(i, st)) cars.push(i);
    if (!cars.length) cars.push(0);
    const COL = ['#37506b', '#6b3750', '#4a5c37', '#5b4a2f'];
    for (let i = 0; i < S.alight; i++) {
      const car = cars[i % cars.length];
      S.walkers.push({
        st, kind: 'out', t: 0, dur: 2.2 + Math.random() * 1.2, delay: i * 0.18,
        s0: carCenterS(car), off0: TRACK_OFF + 2.6,
        s1: st.s - 6 - (i % 4) * 2.2, off1: TRACK_OFF + 5.2,
        color: COL[i % COL.length], seed: Math.random() * 6.28,
      });
    }
    for (let i = 0; i < S.board; i++) {
      const car = cars[i % cars.length];
      S.walkers.push({
        st, kind: 'in', t: 0, dur: 2.4 + Math.random() * 1.4, delay: i * 0.2,
        s0: st.s - 4 - (i % 5) * 2.0, off0: TRACK_OFF + 5.4,
        s1: carCenterS(car), off1: TRACK_OFF + 2.6,
        color: COL[(i + 1) % COL.length], seed: Math.random() * 6.28,
      });
    }
  }
  function updateWalkers(dt) {
    for (const w of S.walkers) {
      if (w.delay > 0) { w.delay -= dt; continue; }
      w.t += dt / w.dur;
      if (w.t >= 1) {
        w.done = true;
        if (w.kind === 'in') {
          S.board = Math.max(0, S.board - 1);
          S.pax = Math.min(120, S.pax + 1); S.score += 8;
        } else {
          S.alight = Math.max(0, S.alight - 1);
          S.pax = Math.max(0, S.pax - 1);
        }
      }
    }
    S.walkers = S.walkers.filter(w => !w.done);
  }

  function resolveIncident(delta, text, cls) {
    if (delta) S.score += delta;
    if (text) {
      toast(text + (delta > 0 ? ' · +' + delta : delta < 0 ? ' · ' + delta : ''));
      showMsg(text, cls || (delta < 0 ? 'bad' : 'good'));
    }
    S.inc = null;
  }

  function triggerIncident(inc) {
    inc.done = true;
    if (inc.kind === 'door') {
      S.doorFault = 13;
      toast('Türstörung · Türen schließen langsam');
      showMsg('Zwischenfall: Türstörung – Türen reagieren träge', 'bad');
    } else if (inc.kind === 'signal') {
      S.signalFail = 18;
      toast('Ampelstörung · nächstes Signal frei');
      showMsg('Zwischenfall: Ampelstörung auf dem Abschnitt', 'bad');
    } else if (inc.kind === 'brake') {
      S.inc = { kind: 'brake', t: 0 };
      toast('Kind auf dem Gleis!');
      showMsg('ZWISCHENFALL: Kind auf dem Gleis – sofort bremsen!', 'bad');
      say('Achtung, Kind auf dem Gleis!');
    } else if (inc.kind === 'block') {
      S.inc = { kind: 'block', t: 0, hold: 0, ok: false };
      toast('Falschparker auf dem Gleis');
      showMsg('ZWISCHENFALL: Falschparker – anhalten und warten', 'bad');
    } else if (inc.kind === 'choice') {
      S.decide = { t: 0 };
      ctxShow('Fahrgast ohnmächtig', 'Was tut die Leitstelle?', [
        { label: 'NOTRUF', primary: true, fn: () => { S.score += 60; S.mood = Math.min(100, S.mood + 8); S.t += 25; toast('Rettung gerufen · +60'); say('Rettungswagen angefordert.'); } },
        { label: 'WEITERFAHREN', fn: () => { S.score -= 40; S.mood = Math.max(0, S.mood - 15); toast('Weitergefahren · −40'); } },
      ], true);
    } else {
      S.inc = { kind: 'text', t: 0 };
      showMsg('ZWISCHENFALL: ' + pick(INC_TEXTS, Math.random()), 'bad');
    }
  }

  function updateIncident(dt) {
    if (!S.inc) return;
    S.inc.t += dt;
    const k = S.inc.kind;
    if (k === 'brake') {
      if (S.v < 0.6) resolveIncident(70, 'Rechtzeitig gebremst', 'good');
      else if (S.inc.t > 6) resolveIncident(-110, 'Zu spät gebremst', 'bad');
    } else if (k === 'block') {
      if (!S.inc.ok) {
        if (S.v < 0.5 && S.inc.t > 0.5) { S.inc.ok = true; S.inc.hold = 3; }
        else if (S.inc.t > 8) resolveIncident(-100, 'Falschparker gerammt', 'bad');
      } else {
        S.v = Math.max(0, S.v - 3.2 * dt);
        S.inc.hold -= dt;
        if (S.inc.hold <= 0) resolveIncident(50, 'Falschparker beseitigt', 'good');
      }
    } else if (k === 'text') {
      if (S.inc.t > 3.5) resolveIncident(20, '');
    }
  }

  function updateAi(dt) {
    for (const a of ai) {
      a.v += Math.max(-2.4 * dt, Math.min(1.5 * dt, a.vmax - a.v));
      a.v = Math.max(0, a.v);
      a.s += a.v * dt;
      if (a.s > total - 45 || a.s < S.s - 320) {
        const cand = S.s + 360 + Math.random() * 240;
        a.s = cand < total - 80 ? cand : Math.min(total - 80, S.s + 60);
        a.v = 5;
      }
    }
  }

  function updateOncoming(dt) {
    for (const o of oncoming) {
      o.s -= o.v * dt;
      if (o.s < S.s - 420) {
        o.s = S.s + 480 + Math.random() * 380;
        if (o.s > total + 40) o.s = total + 20 + Math.random() * 80;
        o.v = 7 + Math.random() * 3.4;
      }
      if (o.s < -40) o.s = total + 20 + Math.random() * 80;
      for (const nz of narrows) {
        const inSection = S.s > nz.s0 && S.s - tlen() < nz.s1 + 4;
        /* Nur unmittelbar vor der Einfahrt reservieren, damit das rote
           Einfahrsignal auf der Anfahrt sichtbar bleibt. */
        const approach = !inSection && S.s > nz.s0 - 18;
        if (inSection && o.s > nz.s0 - 10 && o.s < nz.s1 + 18) {
          o.s = nz.s1 + 18;
        } else if (approach && o.s > nz.s0 + 45 && o.s < nz.s1 + 18) {
          /* Weit drin stehende Gegenbahn wartet draußen; nahe Bahnen
             fahren sichtbar aus, das Signal bleibt solange rot. */
          o.s = nz.s1 + 18;
        }
      }
    }
  }

  function updateShunt(dt) {
    const sh = S.shunt, sw = sh.sw;
    const t = Math.max(0, Math.min(1, (S.s - sw.s) / 18));
    S.lat = sh.sign * t * 8;
    if (sh.phase === 'in') {
      S.v = 3;
      S.s = Math.min(S.s + 3 * dt, sw.s + 19.5);
      if (S.s >= sw.s + 19.4) {
        sh.phase = 'wait'; S.v = 0;
        ctxShow('Falsch abgebogen', 'Die Weiche stand falsch. Rangieren und zurücksetzen.', [
          { label: 'RANGIEREN', primary: true, fn: () => { sh.phase = 'out'; toast('Rückwärts rangieren'); } },
        ]);
      }
    } else if (sh.phase === 'out') {
      S.s = Math.max(sw.s - 4, S.s - 2.4 * dt);
      S.v = 0;
      if (S.s <= sw.s - 3.9) {
        S.lat = 0; S.shunt = null; S.v = 0; S.prevS = S.s;
        sw.set = sw.req; sw.penalized = false;
        toast('Rangiert · Weiche gestellt');
        showMsg('Zurück auf dem Fahrgleis. Weiterfahrt möglich.', 'good');
        ctxHide();
      }
    }
  }

  function ambientTemp() {
    return SET.weather === 'snow' ? 20 : SET.weather === 'rain' ? 28 :
      SET.weather === 'fog' ? 26 : SET.weather === 'leaf' ? 24 : 34;
  }

  function updateCrossers(dt) {
    S.crossT -= dt;
    if (S.crossT <= 0 && S.started && !S.finished) {
      S.crossT = 7 + Math.random() * 7;
      {
        /* Fussgaenger und Autos queren nur bei ihrer eigenen Gruenphase, und
           zwar an der naechsten Kreuzung – auch wenn die Bahn dort schon steht. */
        const cand = crossings.filter(c => c.s > S.s + Math.max(6, S.v * 3.5) &&
          c.s < S.s + 120 && crossPhase(c) === 'cross').sort((a, b) => a.s - b.s);
        if (cand.length) {
          const cs = cand[0].s;
          const dir = Math.random() < 0.5 ? -1 : 1;
          const kind = Math.random() < 0.55 ? 'car' : Math.random() < 0.55 ? 'bike' : 'person';
          crossers.push({
            s: cs, off: -13 * dir, dir,
            sp: kind === 'car' ? 4.5 + Math.random() * 3 : 1.7 + Math.random() * 1.4,
            kind, color: ['#c8453a', '#3f6fb0', '#d8d8d8', '#4a8a4f'][Math.floor(Math.random() * 4)],
            warned: false, cleared: false, yield: false, seed: Math.random() * 6.28,
          });
        }
      }
    }
    for (const c of crossers) {
      if (c.yield) c.off += Math.sign(c.off || 1) * 2.8 * dt;
      else c.off += c.dir * c.sp * dt;
      if (!c.warned && Math.abs(c.s - S.s) < 65) {
        c.warned = true;
        if (c.kind === 'person') showMsg('Fußgänger quert die Gleise – Klingel (K)!', 'bad');
        else if (c.kind === 'bike') showMsg('Radfahrer kreuzt die Gleise – Klingel (K)!', 'bad');
        else showMsg('Auto kreuzt die Gleise!', 'bad');
      }
      if (!c.yield && Math.abs(c.s - S.s) < 4.6 && Math.abs(c.off) < 5.5 && S.v > 1.5) {
        S.score -= 120;
        S.mood = Math.max(0, S.mood - 18);
        S.v = 0;
        c.off = 20;
        toast('Unfall mit Querverkehr · −120');
        showMsg('Zusammenstoß mit Querverkehr. Sofort gebremst.', 'bad');
      }
    }
    crossers = crossers.filter(c => Math.abs(c.off) < 14);
  }
  function clearCrossers() {
    if (!S.started) return;
    let n = 0;
    for (const c of crossers) {
      if (c.cleared || c.kind === 'car') continue;
      if (Math.abs(c.s - S.s) > 135 || Math.abs(c.off) > 13) continue;
      c.cleared = true; c.yield = true;
      n++;
    }
    if (n) {
      S.score += 20 * n;
      toast('Klingel · ' + (n === 1 ? 'Fußgänger geht zurück' : n + ' weichen zurück') + ' · +' + 20 * n);
    }
  }

  function update(dt) {
    if (!line || !S.started || S.paused || S.finished) return;
    if (S.decide) return;
    if (S.ctx && !S.ctx.modal && S.v > 0.6) ctxHide();
    S.t += dt;
    if (S.tut) updateTut();
    S.contactCd -= dt;
    if (S.doorFault > 0) S.doorFault -= dt;
    if (S.signalFail > 0) S.signalFail -= dt;
    if (S.sand > 0) S.sand -= dt;
    if (S.sandCd > 0) S.sandCd -= dt;
    if (S.motWarnT > 0) S.motWarnT -= dt;

    updateCrossers(dt);

    if (S.shunt) {
      updateShunt(dt);
      return;
    }

    /* Sifa (im Startbild abschaltbar) */
    if (SET.sifa && (S.v > 0.3 || LEV.thr > 0)) {
      S.sifa -= dt;
      if (S.sifa <= 0) {
        if (!S.sifaDead) { S.sifaDead = true; S.mood = Math.max(0, S.mood - 6); toast('Sifa! Wachsamkeitstaste drücken'); showMsg('Sifa ausgelöst – Zwangsbremsung bis zur Quittung', 'bad'); }
      }
    }

    const p = veh();
    const grip = Math.min(1.1, WX[SET.weather].grip + (S.sand > 0 ? 0.2 : 0));
    const mass = (1 + Math.min(0.22, S.pax * 0.0035)) * (SET.double ? 1.9 : 1);
    let thr = S.doors < 0.02 ? Math.max(keys.has('gas') ? 1 : 0, LEV.thr) : 0;
    const brk = Math.max(keys.has('brk') ? 1 : 0, LEV.brk);
    if (S.inc && S.inc.kind === 'block' && S.inc.ok) thr = 0;
    if (S.sifaDead) { thr = 0; }
    if (S.rampDown) thr = Math.min(thr, 0.25);

    /* Fahrmotoren: Dauerstrom heizt, kurze Fahrstufe 4 kühlt beim Rollen wieder ab */
    S.motMax = Math.max(S.motMax, S.mot);
    if (S.motCut) {
      thr = 0;
      S.mot -= dt * 3.4;
      if (S.mot <= 82) {
        S.motCut = false;
        toast('Motor abgekühlt · Leistung frei');
        showMsg('Fahrmotor wieder kühl. Mit Fahrstufe 2 oder 3 weiterfahren.', 'good');
      }
    } else {
      const heat = thr > 0.52 ? Math.pow((thr - 0.52) / 0.48, 1.6) * 3.1 : -0.95;
      S.mot += heat * dt * (SET.double ? 1.15 : 1);
      if (S.mot >= 102) {
        S.motCut = true; S.motTrips++;
        S.score -= 60; S.mood = Math.max(0, S.mood - 8);
        LEV.val = LEV.thr = 0; paintLever();
        toast('Thermoschutz · Motor abgeschaltet −60');
        showMsg('Fahrmotor überhitzt! Zwangsbremsung – abkühlen lassen.', 'bad');
        say('Motor überhitzt. Thermoschutz hat abgeschaltet.');
      } else if (S.mot > 92 && S.motWarnT <= 0) {
        S.motWarnT = 9;
        toast('Motor heiß · Leistung gedrosselt');
      }
    }
    S.mot = Math.min(112, Math.max(ambientTemp(), S.mot));
    const derate = S.mot > 100 ? 0.4 : S.mot > 92 ? 0.62 : S.mot > 84 ? 0.85 : 1;

    let a = 0;
    if (thr > 0) {
      let power = p.accel * thr / mass * derate;
      power *= 1 - (1 - grip) * 0.3;
      if (SET.double) power *= 0.62;
      if (grip < 0.8 && !(S.sand > 0) && thr > 0.75 && S.v < 4) {
        power *= 0.55;
        if (Math.random() < dt * 0.8) toast('Räder schleudern · SANDEN');
      }
      a += power;
    }
    if (brk > 0) a -= p.brake * brk * grip / mass;
    if (thr === 0 && brk === 0) a -= p.coast / mass;
    if (S.sifaDead) a -= 3.2;
    if (S.motCut) a -= 2.2;
    S.v = Math.max(0, Math.min(p.vmax, S.v + a * dt));
    S.prevS = S.s;
    S.s = Math.min(total, S.s + S.v * dt);

    const rate = DOOR_RATE * (S.doorFault > 0 ? 0.45 : 1);
    for (let i = 0; i < S.carT.length; i++) {
      const dd = S.carT[i] - S.car[i];
      if (Math.abs(dd) > 1e-4) S.car[i] += Math.sign(dd) * Math.min(Math.abs(dd), dt * rate);
    }
    S.doors = S.car.length ? Math.max(...S.car) : 0;
    S.doorTarget = S.carT.length ? Math.max(...S.carT) : 0;
    if (S.doors < 0.02 && S.rampDown && S.board === 0 && S.alight === 0) S.rampDown = false;

    const st = stopAtPlatform();
    if (st && S.v < 0.25 && anyOpenCarOnPlatform(st)) serveStop(st);
    updateWalkers(dt);

    /* Vorrangschaltung */
    for (const g of signals) {
      if (!g.prio && g.s > S.s && g.s - S.s < 150 && S.v > 6) {
        g.prioT += dt;
        if (g.prioT > 1.2) g.prio = true;
      }
    }

    for (const g of signals) {
      if (S.prevS < g.s && S.s >= g.s) {
        const asp = signalAspect(g);
        if (asp === 'halt' && S.signalFail <= 0) {
          S.score -= 50; S.fines++;
          S.mood = Math.max(0, S.mood - 4);
          toast('Rotlicht überfahren · −50');
          showMsg('Ampel Halt überfahren. Bitte künftig halten.', 'bad');
        } else if (asp !== 'halt') S.score += 5;
      }
    }

    /* Weichen */
    for (const sw of switches) {
      if (sw.s < S.s - 30 || sw.s > S.s + 40) continue;
      if (sw.set !== sw.req && S.s > sw.s - 1.5) {
        if (!sw.penalized) {
          sw.penalized = true; S.score -= 80;
          S.shunt = { sw, sign: sw.req === 'L' ? 1 : -1, phase: 'in' };
          S.v = Math.min(S.v, 3);
          toast('Weiche falsch · in die Abstellung');
          showMsg('Falsche Weiche: abgebogen. Rangieren und zurücksetzen.', 'bad');
          say('Falsche Weiche. Rangieren.');
        }
      } else if (sw.set === sw.req && !sw.scored) {
        sw.scored = true; S.score += 30; toast('Weiche richtig · +30');
        if (S.tut) S.tut.switched = true;
      }
    }

    for (const nz of narrows) {
      if (nz.cleared) continue;
      const busy = narrowBusy(nz);
      const stopAt = nz.s0 - 17;
      if (busy && S.s > stopAt - 120 && S.s < stopAt + 1) {
        if (!nz.warned) {
          nz.warned = true; nz.waited = true;
          showMsg(nz.kind === 'single' ? 'Eingleisig: Gegenbahn abwarten' : 'Engstelle: Gegenbahn abwarten', 'bad');
          toast(nz.kind === 'single' ? 'Eingleisig · Gegenbahn kommt' : 'Gegenverkehr · bremsen');
        }
        const room = Math.max(1, stopAt - S.s);
        S.v = Math.min(S.v, Math.sqrt(2 * 2.4 * room));
        if (S.s > stopAt) { S.s = stopAt; S.v = 0; }
      }
      if (S.s > nz.s1) {
        nz.cleared = true;
        if (nz.waited) { S.score += 40; toast((nz.kind === 'single' ? 'Eingleisig frei' : 'Engstelle frei') + ' · +40'); }
      }
    }

    /* Langsamfahrstellen und Baustellen */
    const si = siteAt(S.s);
    if (si) {
      if (S.v * 3.6 > si.limit + 3) {
        S.v = Math.min(S.v, si.limit / 3.6);
        if (S.siteWarn <= 0) {
          S.siteWarn = 4;
          S.score -= 30;
          toast((si.kind === 'bau' ? 'Baustelle' : 'Langsamfahrt') + ' · −30');
        }
      }
      if (si.kind === 'bau' && !si.shown) {
        si.shown = true;
        showMsg('Baustelle: Halt ' + si.skip + ' entfällt', 'bad');
      }
    }
    S.siteWarn -= dt;

    for (const inc of incidents) if (!inc.done && S.s >= inc.s) triggerIncident(inc);
    updateIncident(dt);

    for (const a2 of ai) {
      const rear = a2.s - a2.len;
      if (S.s > rear - 1.2 && S.s < a2.s + 1) {
        S.s = Math.max(rear - 1.2, S.s - 0.4);
        S.v = Math.min(S.v, Math.max(0, a2.v - 1));
        if (S.contactCd <= 0) {
          S.contactCd = 6;
          S.score -= 60;
          S.mood = Math.max(0, S.mood - 6);
          toast('Zu dicht aufgefahren · −60');
          showMsg('Auffahrgefahr! Abstand zur Kolonne halten.', 'bad');
        }
      }
    }

    S.flavorT -= dt;
    if (S.flavorT <= 0) {
      S.flavorT = 38 + Math.random() * 24;
      showMsg(pick(FLAVOR, Math.random()));
    }

    S.missT -= dt;
    if (S.missT <= 0) {
      S.missT = 1;
      for (const stop of stops) {
        if (stop.served || stop.skip || stop.missed) continue;
        /* Erst wenn der ganze Zug am Bahnsteig vorbei ist. */
        if (S.s - tlen() > stop.s + 12) {
          stop.missed = true;
          toast('Halt verpasst: ' + stop.name);
          S.mood = Math.max(0, S.mood - 3);
        }
      }
    }

    if (S.pax > 0 && Math.random() < dt * 0.05) S.mood = Math.min(100, S.mood + 0.4);
    S.mood = Math.max(0, Math.min(100, S.mood));

    if (S.s >= total - 1 && S.v < 0.1) finish();
  }

  function finish() {
    S.finished = true;
    const served = stops.filter(st => st.served || st.skip).length;
    const d = planDelta();
    const punct = Math.max(0, 240 - Math.abs(d));
    const moodBonus = Math.round(S.mood * 2);
    S.score += punct + moodBonus;
    CAREER.points += Math.max(0, S.score);
    CAREER.trips++;
    CAREER.best[S.lineId] = Math.max(CAREER.best[S.lineId] || 0, S.score);
    saveCareer();
    const lvl = level();
    $('endText').textContent =
      `${served} von ${stops.length} Halten · ${S.pax} Fahrgäste · ` +
      `${Math.floor(S.t / 60)}:${String(Math.floor(S.t % 60)).padStart(2, '0')} · ` +
      `${planTxt(d)} · Motor max ${Math.round(S.motMax)}° · Stimmung ${Math.round(S.mood)} · ${S.score} Punkte ` +
      `(Pünktlichkeit +${punct}, Stimmung +${moodBonus}) · Karriere: ${lvl}`;
    $('end').classList.remove('hidden');
  }

  /* ------------------------------------------------------------ Eingabe */
  function openDoorsHere() {
    const st = stopsAt();
    let n = 0;
    for (let i = 0; i < S.carT.length; i++) {
      if (!st || carOnPlatform(i, st)) { S.carT[i] = 1; n++; }
    }
    if (st && n < S.carT.length) toast('Kurzer Bahnsteig · nur ' + n + ' Wagen am Bahnsteig');
  }
  function toggleDoors() {
    if (!S.started || S.paused) return;
    if (S.doors < 0.5) {
      if (S.v > 0.3) { toast('Erst halten'); return; }
      const st = stopsAt();
      if (st && st.skip) { toast('Halt entfällt (Baustelle)'); return; }
      if (st && !st.stepFree && !S.rampDown) {
        ctxShow('Rampe nötig', 'Dieser Bahnsteig ist nicht barrierefrei.', [
          { label: 'RAMPE', primary: true, fn: () => { S.rampDown = true; openDoorsHere(); S.score += 10; S.mood = Math.min(100, S.mood + 3); toast('Rampe ausgefahren'); } },
          { label: 'ABBRECHEN', fn: () => {} },
        ]);
        return;
      }
      openDoorsHere();
    } else {
      if (S.board > 0 || S.alight > 0) {
        if (S.doorChime <= 0) { S.doorChime = 4; toast('Tür blockiert · Fahrgast steigt noch ein'); }
        return;
      }
      for (let i = 0; i < S.carT.length; i++) S.carT[i] = 0;
      if (S.rampDown) S.rampDown = false;
    }
    updateHud();
  }
  /* Türen je Wagen – W1 … W4 */
  function toggleCar(i) {
    if (!S.started || S.paused || i >= S.carT.length) return;
    if (S.carT[i] > 0.5) { S.carT[i] = 0; updateHud(); return; }
    if (S.v > 0.3) { toast('Erst halten'); return; }
    const st = stopsAt();
    if (st && st.skip) { toast('Halt entfällt · Türen bleiben zu'); return; }
    if (st && !carOnPlatform(i, st) && !S.carPen[i]) {
      S.carPen[i] = true;
      S.score -= 25;
      toast('Wagen ' + (i + 1) + ' neben dem Bahnsteig · −25');
    }
    S.carT[i] = 1;
    updateHud();
  }

  function togglePause() {
    S.paused = !S.paused;
    $('btnPause').textContent = S.paused ? 'Weiter' : 'Pause';
  }

  function setVehicle(i) {
    let n = 0;
    do {
      S.veh = (i + VEHICLES.length) % VEHICLES.length;
      i = S.veh + 1;
      if (S.veh === VEHICLES.length - 1 && CAREER.points < VEHICLES[S.veh].unlock) {
        toast('Tatra ab ' + VEHICLES[S.veh].unlock + ' Karrierepunkten');
      }
      n++;
    } while (VEHICLES[S.veh].unlock && CAREER.points < VEHICLES[S.veh].unlock && n < VEHICLES.length);
    applyZoom();
    syncCars();
    buildCarChips();
    updateHud();
  }

  function setSwitch(dir) {
    if (!S.started || S.paused || S.shunt) return;
    const sw = nextSwitch();
    if (!sw || sw.s - S.s > 520) { toast('Keine Weiche in Reichweite'); return; }
    sw.set = dir;
    if (sw.set === sw.req) {
      sw.penalized = false;
      if (S.tut) S.tut.switched = true;
      toast('Weiche ' + (dir === 'L' ? 'links' : 'rechts') + ' gestellt');
    } else {
      toast('Weiche ' + (dir === 'L' ? 'links' : 'rechts') + ' · falsch');
    }
    updateHud();
  }

  function pressSifa() {
    if (!SET.sifa) { toast('Sifa ist aus · im Startbild einschalten'); return; }
    if (!S.started) return;
    if (S.tut) S.tut.sifa = true;
    S.sifa = SIFA_MAX;
    if (S.sifaDead) { S.sifaDead = false; toast('Sifa quittiert'); }
  }
  function sand() {
    if (S.sandCd > 0) return;
    S.sand = 4; S.sandCd = 12;
    toast('Sanden · mehr Grip');
    updateHud();
  }
  function cycleCam() {
    SET.cam = (SET.cam + 1) % 4;
    saveSet();
    applyZoom();
    updateHud();
  }
  function toggleVoice() {
    SET.voice = !SET.voice;
    saveSet();
    updateHud();
    if (SET.voice) say('Ansagen eingeschaltet');
  }
  function takePhoto() {
    const c = document.createElement('canvas');
    c.width = W * 4; c.height = H * 4;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(cv, 0, 0, c.width, c.height);
    c.toBlob(b => {
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'strassenbahn-' + S.lineId + '-' + Date.now() + '.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        toast('Foto gespeichert');
      } catch (e) { toast('Foto nicht möglich'); }
    });
  }

  function paintLever() {
    const knob = $('knob');
    const track = $('leverTrack');
    const f = 1 - (LEV.val + 1) / 2;
    const h = track.clientHeight || 158;
    const kh = knob.offsetHeight || 24;
    knob.style.top = (kh / 2 + f * (h - kh)) + 'px';
    knob.style.marginTop = (-kh / 2) + 'px';
    knob.textContent = String(Math.round(Math.abs(LEV.val) * 100));
    knob.classList.toggle('brk', LEV.val < 0);
  }
  function leverFromEvent(e) {
    const tr = $('leverTrack').getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (e.clientY - tr.top) / tr.height));
    let val = 1 - 2 * f;
    if (Math.abs(val) < 0.14) val = 0;
    /* Fahrstufen: 0, 25, 50, 75, 100 % */
    val = Math.round(val * 4) / 4;
    LEV.val = val;
    LEV.thr = Math.max(0, val);
    LEV.brk = Math.max(0, -val);
    paintLever();
  }

  addEventListener('keydown', (e) => {
    const k = e.key;
    if (['ArrowUp', 'ArrowDown', ' ', 'w', 's', 'd', 'z', 'x', 'f', 'g', 'k'].includes(k)) e.preventDefault();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.add('gas');
    else if (k === 'ArrowDown' || k === 's' || k === 'S') keys.add('brk');
    else if (k === 'd' || k === 'D' || k === ' ') toggleDoors();
    else if (k === 'z' || k === 'Z' || k === 'q' || k === 'Q') setSwitch('L');
    else if (k === 'x' || k === 'X' || k === 'e' || k === 'E') setSwitch('R');
    else if (k === 'f' || k === 'F') pressSifa();
    else if (k === 'k' || k === 'K') bell();
    else if (k === 'g' || k === 'G') sand();
    else if (k === 'b' || k === 'B') {
      if (S.shunt && S.shunt.phase === 'wait') { S.shunt.phase = 'out'; ctxHide(); toast('Rückwärts rangieren'); }
    }
    else if (k === 'c' || k === 'C') cycleCam();
    else if (k === 'v' || k === 'V') takePhoto();
    else if (k === 'm' || k === 'M') toggleVoice();
    else if (k === 'p' || k === 'P') togglePause();
    else if (k >= '7' && k <= '9') toggleCar(+k - 7);
    else if (k === '0') toggleCar(3);
    else if (k >= '1' && k <= '5') setVehicle(+k - 1);
    else if (k === 'r' || k === 'R') reset();
    else if (k === '+' || k === '=') S.zoom = Math.min(9, S.zoom * 1.12);
    else if (k === '-' || k === '_') S.zoom = Math.max(1.2, S.zoom / 1.12);
  });
  addEventListener('keyup', (e) => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.delete('gas');
    if (k === 'ArrowDown' || k === 's' || k === 'S') keys.delete('brk');
  });

  /* ------------------------------------------------------- Linien / Laden */
  const mapCache = new Map();

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.json();
  }

  async function setLine(id, keepStart) {
    if (loading || !LINES) return;
    const meta = LINES[id];
    if (!meta) return;
    loading = true;
    try {
      if (!mapCache.has(id)) {
        toast('Linie ' + id + ' lädt …');
        mapCache.set(id, await fetchJSON('assets/game/map_' + id + '.json'));
      }
      map = mapCache.get(id);
      line = meta;
      lineCol = meta.color;
      S.lineId = String(id);
      clearWorld();
      buildPath(meta.chain);
      buildWorld();
      buildTracks();
      indexItems();
      buildStreetTraffic();
      buildCrossings();
      buildSignals();
      const vi = VEHICLES.findIndex(v => v.name === meta.vehicle);
      S.veh = vi >= 0 ? vi : 1;
      reset();
      if (keepStart) { $('start').classList.add('hidden'); S.started = true; }
      paintLineButtons();
      resize();
      updateHud();
      $('lineInfo').textContent =
        `${(meta.length / 1000).toFixed(1)} km · ${meta.stops.length} Halte · ${veh().name} · ` +
        `${Math.round(veh().vmax * 3.6)} km/h · ${meta.stops[0].name} → ${meta.stops[meta.stops.length - 1].name}`;
    } catch (err) {
      toast('Linie ' + id + ' konnte nicht geladen werden');
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function paintLineButtons() {
    for (const b of $('linePick').children) b.classList.toggle('on', b.dataset.line === S.lineId);
  }

  function buildLineButtons() {
    const ids = Object.keys(LINES);
    const target = $('linePick');
    target.innerHTML = '';
    for (const id of ids) {
      const b = document.createElement('button');
      b.dataset.line = String(id);
      b.textContent = id;
      b.style.background = LINES[id].color;
      b.addEventListener('click', () => setLine(String(id)));
      target.appendChild(b);
    }
    paintLineButtons();
  }

  /* ---------------------------------------------------- Einstellungen */
  const SET_DEFS = [
    { key: 'sifa', label: 'Sifa', opts: [[true, 'AN'], [false, 'AUS']] },
    { key: 'weather', label: 'Wetter', opts: [['sun', 'SONNE'], ['rain', 'REGEN'], ['snow', 'SCHNEE'], ['leaf', 'LAUB'], ['fog', 'NEBEL']] },
    { key: 'night', label: 'Zeit', opts: [[false, 'TAG'], [true, 'NACHT']] },
    { key: 'double', label: 'Zug', opts: [[false, 'SOLO'], [true, 'DOPPEL']] },
    { key: 'cam', label: 'Kamera', opts: [[0, 'VERFOLG'], [1, 'FÜHRERSTAND'], [2, 'MITFAHRER'], [3, 'VOGEL']] },
    { key: 'voice', label: 'Ansagen', opts: [[false, 'AUS'], [true, 'AN']] },
  ];

  function buildSettings() {
    const box = $('setRows');
    box.innerHTML = '';
    for (const def of SET_DEFS) {
      const row = document.createElement('div');
      row.className = 'setrow';
      const lab = document.createElement('span');
      lab.textContent = def.label;
      row.appendChild(lab);
      const wrap = document.createElement('div');
      wrap.className = 'setopts';
      for (const [val, txt] of def.opts) {
        const b = document.createElement('button');
        b.textContent = txt;
        b.dataset.k = def.key;
        b.dataset.v = String(val);
        b.addEventListener('click', () => {
                      SET[def.key] = typeof val === 'boolean' ? val : def.key === 'cam' ? +val : String(val);
          if (def.key === 'sifa' && !SET.sifa) { S.sifaDead = false; S.sifa = SIFA_MAX; }
          saveSet();
          buildSettings();
          applyZoom();
          updateHud();
        });
        wrap.appendChild(b);
      }
      row.appendChild(wrap);
      box.appendChild(row);
    }
    paintSettings();
    $('career').textContent =
      `Karriere: Level ${level()} · ${CAREER.points} Punkte · ${CAREER.trips} ${CAREER.trips === 1 ? 'Fahrt' : 'Fahrten'}` +
      (CAREER.best[S.lineId] ? ` · Bestwert Linie ${S.lineId}: ${CAREER.best[S.lineId]}` : '') +
      (CAREER.points >= 3000 ? ' · Tatra freigeschaltet' : ` · Tatra ab 3000 Punkten`);
  }
  function paintSettings() {
    for (const b of $('setRows').querySelectorAll('button')) {
      const k = b.dataset.k;
      const v = b.dataset.v;
      const cur = SET[k];
      const on = typeof cur === 'boolean' ? String(cur) === v : String(cur) === v;
      b.classList.toggle('on', on);
    }
  }

  function buildCarChips() {
    const box = $('cars');
    if (!box) return;
    box.innerHTML = '';
    for (let i = 0; i < veh().sec; i++) {
      const b = document.createElement('button');
      b.dataset.car = String(i);
      b.textContent = 'W' + (i + 1);
      b.title = 'Türen Wagen ' + (i + 1);
      b.addEventListener('click', (e) => { e.preventDefault(); toggleCar(i); });
      box.appendChild(b);
    }
  }

  function bind() {
    $('btnTut').addEventListener('click', startTutorial);
    $('btnGo').addEventListener('click', () => {
      $('start').classList.add('hidden');
      S.started = true;
      S.prevS = S.s;
      toast('Los – Hebel hoch gibt Strom');
      if (SET.voice) say('Abfahrt.');
    });
    $('btnPause').addEventListener('click', togglePause);
    $('btnVeh').addEventListener('click', () => setVehicle(S.veh + 1));
    $('btnDoor').addEventListener('click', (e) => { e.preventDefault(); toggleDoors(); });
    $('btnAgain').addEventListener('click', reset);
    $('btnLine').addEventListener('click', () => {
      S.started = false;
      buildSettings();
      $('start').classList.remove('hidden');
    });
    $('btnSwL').addEventListener('click', (e) => { e.preventDefault(); setSwitch('L'); });
    $('btnSwR').addEventListener('click', (e) => { e.preventDefault(); setSwitch('R'); });
    $('btnSifa').addEventListener('click', (e) => { e.preventDefault(); pressSifa(); });
    $('btnBell').addEventListener('click', (e) => { e.preventDefault(); bell(); });
    $('btnSand').addEventListener('click', (e) => { e.preventDefault(); sand(); });
    $('btnCam').addEventListener('click', cycleCam);
    $('btnVoice').addEventListener('click', toggleVoice);
    $('btnShot').addEventListener('click', takePhoto);

    const lever = $('lever');
    let drag = false;
    lever.addEventListener('pointerdown', (e) => {
      drag = true;
      try { lever.setPointerCapture(e.pointerId); } catch (_) {}
      leverFromEvent(e);
      e.preventDefault();
    });
    lever.addEventListener('pointermove', (e) => { if (drag) leverFromEvent(e); });
    lever.addEventListener('pointerup', (e) => { drag = false; try { lever.releasePointerCapture(e.pointerId); } catch (_) {} });
    lever.addEventListener('pointercancel', () => { drag = false; });

    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      S.zoom = Math.max(1.2, Math.min(9, S.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    }, { passive: false });
  }

  /* ------------------------------------------------------------- Start */
  function resize() {
    cv.width = W; cv.height = H;
    applyZoom();
    const st = $('stage').getBoundingClientRect();
    $('stage').classList.toggle('short', st.height < 330);
  }

  let last = 0, hudTick = 6;
  function loop(ts) {
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0);
    last = ts;
    updateOncoming(dt);
    updateAi(dt);
    updateStreetTraffic(dt);
    update(dt);
    if (line) { followCam(dt); drawWorld(); }
    if (--hudTick <= 0) { updateHud(); hudTick = 6; }
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) $('toast').classList.remove('on');
    }
    if (S.msgT > 0) {
      S.msgT -= dt;
      if (S.msgT <= 0) $('msg').className = '';
    }
    if (S.doorChime > 0) S.doorChime -= dt;
    requestAnimationFrame(loop);
  }

  (async () => {
    try {
      LINES = (await fetchJSON('assets/world/lines.json')).lines;
      buildLineButtons();
      buildSettings();
      await setLine('1');
      bind();
      paintLever();
      requestAnimationFrame(loop);
    } catch (e) {
      document.body.innerHTML = '<p style="padding:20px;color:#f88">Strecken konnten nicht geladen werden: ' + e + '</p>';
    }
  })();

  addEventListener('resize', () => { if (line) resize(); });

  /* Debug-Haken für Tests */
  const toastLog = [];
  const _toast0 = toast;
  toast = (t) => { toastLog.push(t); _toast0(t); };
  window.__tram = {
    S, SET, CAREER, get line() { return line; }, get stops() { return stops; },
    get switches() { return switches; }, get signals() { return signals; },
    get narrows() { return narrows; }, get sites() { return sites; }, get crossings() { return crossings; },
    get oncoming() { return oncoming; }, get ai() { return ai; },
    get incidents() { return incidents; }, get crossers() { return crossers; },
    get streetCars() { return streetCars; }, get roadPaths() { return roadPaths; },
    crossPhase, tramGreen, crossingOccupied, setLine,
    get lineStops() { return stops; },
    crossInfo: () => crossings.map((c, i) => ({
      i, s: +c.s.toFixed(1), major: !!c.major, sig: !!c.sig,
      phase: crossPhase(c), green: tramGreen(c), occupied: crossingOccupied(c),
      carsWaiting: streetCars.filter(sc => sc.path === c.road &&
        Math.abs(sc.d - c.dRoad) < 20).length,
    })),
    get walkers() { return S.walkers; }, get tut() { return S.tut; },
    get total() { return total; },
    get bedSegs() { return bedSegs; },
    get toasts() { return toastLog; },
    nf: (s) => narrowFactor(s),
    tlen: () => tlen(),
    stopAtPlatform, narrowBusy, signalAspect,
    setS: (s) => { S.s = s; S.prevS = s; S.v = 0; },
    doors: (v) => { for (let i = 0; i < S.carT.length; i++) S.carT[i] = v; },
    bell, startTutorial, toggleCar, toggleDoors, openDoorsHere,
    carInfo: () => S.car.map((v, i) => ({
      car: i + 1, center: +carCenterS(i).toFixed(1),
      plat: (stopsAt() || {}).plat, ok: carOnPlatform(i, stopsAt()),
    })),
    streetInfo: () => {
      const me = offsetPoint(S.s, TRACK_OFF);
      return streetCars.map(c => { const p = streetPoint(c.path, c.d); return Math.round(Math.hypot(p.x - me.x, p.y - me.y)); });
    },
  };
})();
