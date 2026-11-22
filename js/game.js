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
  };
  const keys = new Set();
  const LEV = { val: 0, thr: 0, brk: 0 };

  let items = [], grid = new Map();
  const GC = 100;

  let stops = [], signals = [], switches = [], narrows = [], sites = [], oncoming = [], ai = [], incidents = [];
  let crossers = [];
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
        const a = Math.min(1, Math.max(0, (s - (nz.s0 - 16)) / 16));
        const b = Math.min(1, Math.max(0, ((nz.s1 + 16) - s) / 16));
        f = Math.min(f, a, b);
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
    const BCOLS = ['#e8d2ab', '#dcc0a0', '#f0dcbd', '#d9b98f', '#e5c8a6', '#d2b493'];
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
      stepFree: rng() < 0.68, skip: false, served: false, wait: 0, idx: i,
    }));
    for (const st of stops) st.wait = st.wait0;
    stops.forEach((st, i) => {
      st.plan = Math.max(0, (st.s - startS) / 8.2 + i * 14);
    });

    let sigS = 280 + rng() * 280;
    while (sigS < total - 160) {
      if (!stops.some(st => Math.abs(st.s - sigS) < 42)) {
        signals.push({ s: sigS, phase: rng() * 26, prio: false, prioT: 0 });
      }
      sigS += 560 + rng() * 380;
    }

    let swS = 620 + rng() * 320;
    while (swS < total - 300) {
      if (!stops.some(st => Math.abs(st.s - swS) < 34)) {
        const req = rng() < 0.5 ? 'L' : 'R';
        const set = rng() < 0.5 ? 'L' : 'R';
        switches.push({ s: swS, req, set, set0: set, scored: false, penalized: false });
      }
      swS += 1150 + rng() * 950;
    }
    if (!switches.length) switches.push({ s: Math.min(900, total * 0.4), req: 'L', set: 'R', set0: 'R', scored: false });

    const nzCount = Math.max(2, Math.min(5, Math.round(total / 5200)));
    let nzS = 1400 + rng() * 700, nzPlaced = 0, nzTry = 0;
    while (nzPlaced < nzCount && nzTry < nzCount * 7 && nzS < total - 700) {
      nzTry++;
      const len = 105 + rng() * 65;
      if (stops.some(st => st.s > nzS - 40 && st.s < nzS + len + 40) ||
        switches.some(sw => Math.abs(sw.s - nzS) < 90) ||
        narrows.some(nz => Math.abs(nz.s0 - nzS) < 400)) {
        nzS += 240 + rng() * 160; continue;
      }
      narrows.push({ s0: nzS, s1: nzS + len, waited: false, cleared: false, warned: false });
      nzPlaced++;
      nzS += len + 2300 + rng() * 1500;
    }

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

    const onCount = Math.max(3, Math.min(9, Math.round(total / 2600)));
    for (let i = 0; i < onCount; i++) {
      const v = VEHICLES[Math.floor(rng() * 4)];
      const lid = pick(ids, rng());
      oncoming.push({
        s: 120 + rng() * (total - 240), v: 7 + rng() * 3.6,
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

    let incS = 900 + rng() * 500;
    while (incS < total - 400) {
      const r = rng();
      const kind = r < 0.26 ? 'brake' : r < 0.38 ? 'block' : r < 0.52 ? 'text'
        : r < 0.68 ? 'door' : r < 0.84 ? 'signal' : 'choice';
      incidents.push({ s: incS, kind, done: false });
      incS += 780 + rng() * 1000;
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
    return S.s - tlen() / 2;
  }
  function zoomFor(fa) {
    const k = SET.cam === 1 ? 0.55 : SET.cam === 2 ? 1.35 : 1.04;
    return fa.h / (tlen() * k);
  }
  function followCam(dt) {
    const p = offsetPoint(camCenterS(), TRACK_OFF + S.lat);
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
    const cam = offsetPoint(camCenterS(), TRACK_OFF + S.lat);
    const Z = S.zoom;
    const fa = freeArea();
    const reach = Math.hypot(W, H) / 2 / Z + 80;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#a9c48c';
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

    for (const it of near) if (it.k === 'g') poly(it.p, '#82cc6c');
    for (const it of near) if (it.k === 'w') poly(it.p, '#58c8f0');
    const isPath = t => t === 'footway' || t === 'path' || t === 'steps' ||
      t === 'bridleway' || t === 'cycleway' || t === 'track';
    for (const it of near) if (it.k === 'r' && !isPath(it.t)) stroke(it.p, it.c * 2 + 1.2, '#5f656e');
    for (const it of near) if (it.k === 'r') {
      stroke(it.p, it.c * 2, isPath(it.t) ? '#c2bda9' : '#a9afba', isPath(it.t) ? 'butt' : 'round');
    }
    for (const it of near) if (it.k === 'b') poly(it.p, it.col, '#6f5436', 0.7);
    for (const it of near) if (it.k === 't') {
      ctx.fillStyle = '#2f7038';
      ctx.fillRect(it.p[0] - 1.6, it.p[1] - 1.6, 3.2, 3.2);
      ctx.fillStyle = '#4ea457';
      ctx.fillRect(it.p[0] - 1.0, it.p[1] - 1.0, 2.0, 2.0);
    }

    drawTracks(S.s - 140, S.s + 140);
    drawStops();
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
    for (const [w, col] of [[3.5, '#4d483b'], [2.6, '#736a58']]) {
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

  function drawStops() {
    for (const st of stops) {
      if (st.s < S.s - 150 || st.s > S.s + 150) continue;
      const a = offsetPoint(st.s - 12, TRACK_OFF + 2.0);
      const b = offsetPoint(st.s - 12, TRACK_OFF + 6.0);
      const c = offsetPoint(st.s + 12, TRACK_OFF + 6.0);
      const d = offsetPoint(st.s + 12, TRACK_OFF + 2.0);
      poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y], '#e6dfc9', '#7d7563', 0.6);
      const e = offsetPoint(st.s - 12, TRACK_OFF + 2.5);
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

      const n = Math.min(7, st.wait + (S.boardStop === st ? S.board : 0));
      for (let i = 0; i < n; i++) {
        const p = offsetPoint(st.s - 8 + i * 2.4, TRACK_OFF + 3.6 + (i % 2) * 1.0);
        ctx.fillStyle = ['#37506b', '#6b3750', '#4a5c37', '#5b4a2f'][i % 4];
        ctx.fillRect(p.x - 0.4, p.y - 0.6, 0.85, 1.5);
        ctx.fillStyle = '#e3bd93';
        ctx.fillRect(p.x - 0.32, p.y - 1.4, 0.7, 0.7);
      }
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
    for (const g of signals) {
      if (g.s < S.s - 160 || g.s > S.s + 280) continue;
      const p = offsetPoint(g.s, TRACK_OFF + 2.1);
      const asp = signalAspect(g);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang);
      ctx.fillStyle = '#11161a';
      ctx.fillRect(-2.0, -1.7, 4.0, 3.4);
      ctx.fillStyle = '#3a4650';
      ctx.fillRect(-2.0, -1.7, 4.0, 0.55);
      const lamps = [['red', -1.2], ['yellow', 0], ['green', 1.2]];
      for (const [name, dx] of lamps) {
        const on = asp === name;
        ctx.fillStyle = on
          ? (name === 'red' ? '#ff4b3a' : name === 'yellow' ? '#ffd21a' : '#4ef07a')
          : 'rgba(90,100,110,.55)';
        ctx.beginPath();
        ctx.arc(dx, 0.25, on ? 0.85 : 0.55, 0, Math.PI * 2);
        ctx.fill();
        if (on) {
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(dx, 0.25, 1.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
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
      for (let s = nz.s0 + 2; s < nz.s1; s += 9) {
        for (const side of [-1, 1]) {
          const p = offsetPoint(s, side * 3.3);
          rectAt(p.x, p.y, p.ang, 2.6, 0.8, ((s / 9) | 0) % 2 ? '#e8642c' : '#f1e9d8', '#5b3a24');
        }
      }
      const ep = offsetPoint(nz.s0 - 20, TRACK_OFF + 2.1);
      rectAt(ep.x, ep.y, ep.ang, 2.4, 3.6, narrowBusy(nz) ? '#ff4b3a' : '#4ef07a', '#11161a');
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
      const size = c.kind === 'car' ? 4.6 : c.kind === 'bike' ? 2.2 : 0.9;
      rectAt(p.x, p.y, p.ang + Math.PI / 2, size, size * 0.55, c.color, '#1b2026');
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
      const lp = offsetPoint(front, TRACK_OFF + S.lat);
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
    const b = $('btnBell');
    if (b) {
      b.classList.add('ring');
      setTimeout(() => b.classList.remove('ring'), 320);
    }
  }

  const SIGNAL_CYCLE = 28;
  function signalAspect(g) {
    if (S.signalFail > 0 || g.prio) return 'green';
    const t = (S.t + g.phase) % SIGNAL_CYCLE;
    return t < 15 ? 'green' : t < 18 ? 'yellow' : 'red';
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
  function planAt(s) {
    let n = 0;
    for (const st of stops) if (st.s < s) n++;
    return s / 8.2 + n * 14;
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
      sigEl.className = 'sig ' + a;
      sigEl.textContent = (a === 'red' ? 'ROT ' : a === 'yellow' ? 'GELB ' : 'GRÜN ') +
        Math.max(0, Math.round(g.s - S.s)) + ' m';
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

    $('btnSifa').textContent = !SET.sifa ? 'SIFA AUS' : S.sifaDead ? 'SIFA !' : 'SIFA ' + Math.ceil(S.sifa);
    $('btnSifa').classList.toggle('alert', SET.sifa && (S.sifaDead || S.sifa < 8));
    $('btnSifa').classList.toggle('off', !SET.sifa);
    $('btnSand').textContent = S.sand > 0 ? 'SAND ✓' : S.sandCd > 0 ? 'SAND ' + Math.ceil(S.sandCd) : 'SAND';
    $('btnSand').classList.toggle('on', S.sand > 0);
    $('btnCam').textContent = ['KAM', 'FST', 'MIT'][SET.cam];
    $('btnVoice').classList.toggle('on', SET.voice);

    $('motChip').textContent = (S.motCut ? 'MOT ! ' : 'MOT ') + Math.round(S.mot) + '°';
    $('motChip').className = 'chip ' + (S.motCut || S.mot > 100 ? 'bad' : S.mot > 92 ? 'warn' : 'ok');
    $('lever').classList.toggle('hot', S.mot > 92 || S.motCut);
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
      st.wait = st.wait0; st.served = false; st.wait = st.skip ? 0 : st.wait;
    }
    for (const nz of narrows) { nz.waited = false; nz.cleared = false; nz.warned = false; }
    for (const sw of switches) {
      sw.set = sw.set0; sw.scored = false; sw.penalized = false;
    }
    for (const inc of incidents) inc.done = false;
    for (const g of signals) { g.prio = false; g.prioT = 0; }
    ctxHide();
    $('end').classList.add('hidden');
    $('start').classList.remove('hidden');
    $('msg').className = '';
    $('btnPause').textContent = 'Pause';
    S.started = false;
    applyZoom();
    buildSettings();
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
      if (o.s < -40) o.s = total + 20 + Math.random() * 80;
      for (const nz of narrows) {
        const playerIn = S.s > nz.s0 - 2 && S.s - tlen() < nz.s1 + 4;
        if (playerIn && o.s > nz.s0 - 20 && o.s < nz.s1 + 30) o.s = nz.s1 + 30;
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
      S.crossT = 7 + Math.random() * 8;
      if (S.v > 2) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const kind = Math.random() < 0.6 ? 'car' : Math.random() < 0.6 ? 'bike' : 'person';
        crossers.push({
          s: S.s + 70 + Math.random() * 70, off: -13 * dir, dir,
          sp: kind === 'car' ? 4.5 + Math.random() * 3 : 2 + Math.random() * 2,
          kind, color: ['#c8453a', '#3f6fb0', '#d8d8d8', '#4a8a4f'][Math.floor(Math.random() * 4)],
          warned: false,
        });
      }
    }
    for (const c of crossers) {
      c.off += c.dir * c.sp * dt;
      if (!c.warned && Math.abs(c.s - S.s) < 75) {
        c.warned = true;
        showMsg(c.kind === 'car' ? 'Auto kreuzt die Gleise!' : 'Fußgänger quert die Gleise!', 'bad');
        ringBell(0.8);
      }
      if (Math.abs(c.s - S.s) < 4.6 && Math.abs(c.off) < 5.5 && S.v > 1.5) {
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

  function update(dt) {
    if (!line || !S.started || S.paused || S.finished) return;
    if (S.decide) return;
    if (S.ctx && !S.ctx.modal && S.v > 0.6) ctxHide();
    S.t += dt;
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
      S.mot -= dt * 1.9;
      if (S.mot <= 84) {
        S.motCut = false;
        toast('Motor abgekühlt · Leistung frei');
        showMsg('Fahrmotor wieder kühl. Mit Fahrstufe 2 oder 3 weiterfahren.', 'good');
      }
    } else {
      const heat = thr > 0.52 ? Math.pow((thr - 0.52) / 0.48, 1.6) * 3.1 : -0.55;
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
    const dd = S.doorTarget - S.doors;
    if (Math.abs(dd) > 1e-4) S.doors += Math.sign(dd) * Math.min(Math.abs(dd), dt * rate);
    if (S.doors < 0.02 && S.rampDown && S.board === 0 && S.alight === 0) S.rampDown = false;

    const st = stopsAt();
    if (st && !st.skip && S.v < 0.25 && S.doors > 0.9 && !st.served) serveStop(st);

    if (st && S.doors > 0.9) {
      if (S.alight > 0) {
        S.alightT -= dt;
        if (S.alightT <= 0) { S.alight--; S.pax = Math.max(0, S.pax - 1); S.alightT = 0.22; }
      } else if (S.board > 0) {
        S.boardT -= dt;
        if (S.boardT <= 0) { S.board--; S.pax = Math.min(120, S.pax + 1); S.score += 8; S.boardT = 0.3; }
      }
    }

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
        if (asp === 'red' && S.signalFail <= 0) {
          S.score -= 50; S.fines++;
          S.mood = Math.max(0, S.mood - 4);
          toast('Rotlicht überfahren · −50');
          showMsg('Signal rot – weitergefahren. Bitte künftig halten.', 'bad');
        } else if (asp === 'green') S.score += 5;
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
      }
    }

    for (const nz of narrows) {
      if (nz.cleared) continue;
      const busy = narrowBusy(nz);
      const stopAt = nz.s0 - 17;
      if (busy && S.s > stopAt - 120 && S.s < stopAt + 1) {
        if (!nz.warned) {
          nz.warned = true; nz.waited = true;
          showMsg('Engstelle: Gegenbahn abwarten', 'bad');
          toast('Gegenverkehr · bremsen');
        }
        const room = Math.max(1, stopAt - S.s);
        S.v = Math.min(S.v, Math.sqrt(2 * 2.4 * room));
        if (S.s > stopAt) { S.s = stopAt; S.v = 0; }
      }
      if (S.s > nz.s1) {
        nz.cleared = true;
        if (nz.waited) { S.score += 40; toast('Engstelle frei · +40'); }
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
        if (!stop.served && !stop.skip && S.s > stop.s + 26 && S.s < stop.s + 29) {
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
  function toggleDoors() {
    if (!S.started || S.paused) return;
    if (S.doors < 0.5) {
      if (S.v > 0.3) { toast('Erst halten'); return; }
      const st = stopsAt();
      if (st && st.skip) { toast('Halt entfällt (Baustelle)'); return; }
      if (st && !st.stepFree && !S.rampDown) {
        ctxShow('Rampe nötig', 'Dieser Bahnsteig ist nicht barrierefrei.', [
          { label: 'RAMPE', primary: true, fn: () => { S.rampDown = true; S.doorTarget = 1; S.score += 10; S.mood = Math.min(100, S.mood + 3); toast('Rampe ausgefahren'); } },
          { label: 'ABBRECHEN', fn: () => {} },
        ]);
        return;
      }
      S.doorTarget = 1;
    } else {
      if (S.board > 0 || S.alight > 0) {
        S.doorTarget = 1; S.boardT += 1.2;
        if (S.doorChime <= 0) { S.doorChime = 4; toast('Tür blockiert · Fahrgast steigt noch ein'); }
        return;
      }
      S.doorTarget = 0;
      if (S.rampDown) S.rampDown = false;
    }
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
    updateHud();
  }

  function setSwitch(dir) {
    if (!S.started || S.paused || S.shunt) return;
    const sw = nextSwitch();
    if (!sw || sw.s - S.s > 520) { toast('Keine Weiche in Reichweite'); return; }
    sw.set = dir;
    if (sw.set === sw.req) {
      sw.penalized = false;
      toast('Weiche ' + (dir === 'L' ? 'links' : 'rechts') + ' gestellt');
    } else {
      toast('Weiche ' + (dir === 'L' ? 'links' : 'rechts') + ' · falsch');
    }
    updateHud();
  }

  function pressSifa() {
    if (!SET.sifa) { toast('Sifa ist aus · im Startbild einschalten'); return; }
    if (!S.started) return;
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
    SET.cam = (SET.cam + 1) % 3;
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
    { key: 'cam', label: 'Kamera', opts: [[0, 'VERFOLG'], [1, 'FÜHRERSTAND'], [2, 'MITFAHRER']] },
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

  function bind() {
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
  window.__tram = {
    S, SET, CAREER, get line() { return line; }, get stops() { return stops; },
    get switches() { return switches; }, get signals() { return signals; },
    get narrows() { return narrows; }, get sites() { return sites; },
    get oncoming() { return oncoming; }, get ai() { return ai; },
    get incidents() { return incidents; }, get crossers() { return crossers; },
    get total() { return total; },
    bell,
  };
})();
