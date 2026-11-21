/* Altstadt-Demo: Straßenbahn auf den echten OSM-Gleisen.
   Weltkoordinaten in Metern, x = Ost, y = Süd, Ursprung = Kartenmitte. */
(() => {
  'use strict';

  const cv = document.getElementById('view');
  const ctx = cv.getContext('2d');
  const mini = document.getElementById('minimap');
  const mctx = mini.getContext('2d');

  const $ = id => document.getElementById(id);

  let W = 0, H = 0, DPR = 1;
  let LEVEL = null, MAP = null;
  const segs = [];

  const PXM = 3.2;
  const MAXV = 13.9;          // 50 km/h
  const TRAM_LEN = 33.2;      // drei Module à 10,4 m + Gelenke
  const ACCEL = 1.6;
  const BRAKE = 1.9;
  const EMERG = 3.5;
  const DOOR_RATE = 2.6;      // 0..1 pro Sekunde

  const S = {
    running: false, paused: false, finished: false,
    s: 0, v: 0, thr: 0, brk: 0, deadman: false,
    doors: 0, doorTarget: 0,
    pax: 0, boarded: 0, score: 0, t: 0,
    msgT: 0, zoom: 1.7, view: 'near', nearZoom: 1,
    cam: { x: 0, y: 0 }, once: {},
  };

  const cam = S.cam;
  const keys = new Set();

  /* ---------------------------------------------------------- Level */
  function loadImage(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  }

  function initStops() {
    LEVEL.stops.forEach((st, i) => {
      st.done = false;
      st.missed = false;
      st.serving = false;
      st.timer = 0;
      st.moved = 0;
      st.alight = 2 + ((i * 3 + 4) % 7);
      st.waiting = 4 + ((i * 5 + 3) % 9);
      st.bo = 0;
      st.paxAtOpen = 0;
    });
  }

  function buildSegs() {
    segs.length = 0;
    const p = LEVEL.path;
    let s = 0;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1e-6) continue;
      segs.push({ x0, y0, x1, y1, len, s0: s, ang: Math.atan2(y1 - y0, x1 - x0) });
      s += len;
    }
    LEVEL.length = s;
  }

  function sample(s) {
    s = Math.max(0, Math.min(LEVEL.length, s));
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (segs[mid].s0 + segs[mid].len < s) lo = mid + 1; else hi = mid;
    }
    const g = segs[lo];
    const f = Math.min(1, Math.max(0, (s - g.s0) / g.len));
    return {
      x: g.x0 + (g.x1 - g.x0) * f,
      y: g.y0 + (g.y1 - g.y0) * f,
      ang: g.ang,
    };
  }

  /* ---------------------------------------------------------- HUD */
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('on');
    S.msgT = 2.2;
  }

  function currentStop() {
    return LEVEL.stops.find(st => !st.done && st.s >= S.s - 18) || null;
  }

  function atStop() {
    return LEVEL.stops.find(st => Math.abs(st.s - S.s) < 16) || null;
  }

  function renderStopList() {
    const ol = $('stopList');
    const cur = currentStop();
    ol.innerHTML = LEVEL.stops.map(st => {
      const cls = st.done ? 'done' : (st === cur ? 'now' : '');
      return `<li class="${cls}"><i></i><span>${st.name}</span></li>`;
    }).join('');
  }

  function updateHud() {
    const cur0 = currentStop();
    if (S.lastCur !== (cur0 ? cur0.name : null)) {
      S.lastCur = cur0 ? cur0.name : null;
      renderStopList();
    }
    $('speed').textContent = Math.round(S.v * 3.6);
    $('speedBar').style.width = Math.min(100, (S.v / MAXV) * 100) + '%';
    $('score').textContent = S.score;
    $('pax').textContent = S.pax;
    $('clock').textContent = Math.floor(S.t / 60) + ':' + String(Math.floor(S.t % 60)).padStart(2, '0');
    const lf = 50 + S.thr * 46 - S.brk * 46;
    $('lfill').style.left = Math.max(3, Math.min(97, lf)) + '%';

    const cur = currentStop();
    $('nextStop').textContent = 'Nächster Halt: ' + (cur ? cur.name : 'Endstation');
    $('stopDist').textContent = cur ? 'noch ' + Math.max(0, Math.round(cur.s - S.s)) + ' m' : 'Endstation erreicht';

    const st = atStop();
    const dh = $('doorHead'), ds = $('doorSub');
    if (S.doors > 0.85) {
      dh.textContent = 'Türen offen';
      ds.textContent = st ? (st.done ? 'Fahrgastwechsel fertig – Türen schließen (D)' : 'Fahrgastwechsel läuft …')
                          : 'Türen schließen (D)';
    } else if (S.doors > 0.02) {
      dh.textContent = 'Türen bewegen sich';
      ds.textContent = 'Bitte warten.';
    } else {
      dh.textContent = 'Türen geschlossen';
      ds.textContent = st ? 'An der Haltestelle: D zum Öffnen.' : 'An der Haltestelle halten und D drücken.';
    }
    $('doors').classList.toggle('open', S.doors > 0.5);
  }

  /* ---------------------------------------------------------- Physik */
  function reset() {
    S.running = false; S.paused = false; S.finished = false;
    S.s = TRAM_LEN + 1; S.v = 0; S.thr = 0; S.brk = 0; S.deadman = false;
    S.doors = 0; S.doorTarget = 0; S.pax = 0; S.boarded = 0; S.score = 0; S.t = 0;
    S.msgT = 0; S.once = {};
    initStops();
    renderStopList();
    $('end').classList.add('hidden');
    $('pauseScreen').classList.add('hidden');
    const p = sample(S.s - TRAM_LEN / 2);
    cam.x = p.x; cam.y = p.y;
    updateHud();
  }

  function update(dt) {
    if (!S.running || S.paused || S.finished) return;
    S.t += dt;
    S.thr = S.deadman ? 0 : (keys.has('gas') ? 1 : 0);
    S.brk = keys.has('brk') ? 1 : 0;

    // Türen
    const dd = S.doorTarget - S.doors;
    if (Math.abs(dd) > 1e-4) S.doors += Math.sign(dd) * Math.min(Math.abs(dd), dt * DOOR_RATE);

    const closed = S.doors < 0.02;
    let a = 0;
    if (S.deadman) a -= EMERG;
    else {
      if (closed && S.thr > 0) a += ACCEL * S.thr;
      if (S.brk > 0) a -= BRAKE * S.brk;
      if (S.thr === 0 && S.brk === 0) a -= 0.45;
    }
    S.v = Math.max(0, Math.min(MAXV, S.v + a * dt));
    S.s = Math.min(LEVEL.length, S.s + S.v * dt);

    // Türverriegelung / Hinweis
    if (!closed && S.thr > 0 && !S.once.interlock) {
      S.once.interlock = true;
      toast('Türverriegelung – erst Türen schließen');
    }
    if (closed) S.once.interlock = false;

    // Haltestellen
    const st = atStop();
    const zone = st && Math.abs(st.s - S.s) < 16;
    if (zone && S.doors > 0.8 && S.v < 0.3) {
      if (!st.serving) {
        st.serving = true;
        st.timer = 0;
        st.moved = 0;
        st.bo = 0;
        st.paxAtOpen = S.pax;
        S.score += 25;                       // sauberer Halt
      }
      st.timer += dt;
      const total = st.alight + st.waiting;
      const should = Math.min(total, Math.floor(st.timer * 4.6));
      if (should > st.moved) {
        const add = should - st.moved;
        st.moved = should;
        const off = Math.min(st.moved, st.alight);
        const on = Math.max(0, st.moved - st.alight);
        S.pax = Math.max(0, st.paxAtOpen - off) + on;
        S.boarded += on - st.bo;
        st.bo = on;
        S.score += add * 2;
      }
      if (!st.done && st.moved >= total) {
        st.done = true;
        S.score += 100;
        renderStopList();
      }
    } else if (!zone && st) {
      st.serving = false;
    }

    // Verpasste Halte
    LEVEL.stops.forEach(stop => {
      if (!stop.done && !stop.missed && S.s > stop.s + 32) {
        stop.missed = true;
        S.score -= 25;
        toast('Halt verpasst: ' + stop.name + ' (−25)');
      }
    });

    // Ende
    const last = LEVEL.stops[LEVEL.stops.length - 1];
    if (S.s >= LEVEL.length - 0.6 && last.done && S.doors < 0.05 && !S.finished) finish();

    // Kamera: in der Nahansicht klebt sie am Wagen, sonst zieht sie nach
    if (S.view === 'near') {
      // Kamera klebt am Wagenmittelpunkt: der Wagen steht oben wie unten im Bild
      const p = sample(S.s - TRAM_LEN / 2);
      const k = 1 - Math.pow(0.0015, dt);
      cam.x += (p.x - cam.x) * k;
      cam.y += (p.y - cam.y) * k;
    } else {
      const look = sample(S.s + 22);
      const here = sample(S.s);
      const tx = here.x * 0.5 + look.x * 0.5;
      const ty = here.y * 0.5 + look.y * 0.5;
      const k = 1 - Math.pow(0.001, dt);
      cam.x += (tx - cam.x) * k;
      cam.y += (ty - cam.y) * k;
    }
  }

  function finish() {
    S.finished = true;
    S.running = false;
    const served = LEVEL.stops.filter(s => s.done).length;
    const missed = LEVEL.stops.filter(s => s.missed).length;
    const grade = S.score > 640 ? 'sehr gut' : S.score > 480 ? 'gut' : S.score > 320 ? 'geht so' : 'ausbaufähig';
    $('endLead').textContent = `${served} von ${LEVEL.stops.length} Halten bedient · Bewertung: ${grade}`;
    $('endGrid').innerHTML = `
      <div><span>Punkte</span><b>${S.score}</b></div>
      <div><span>Fahrgäste</span><b>${S.boarded}</b></div>
      <div><span>Fahrzeit</span><b>${Math.floor(S.t / 60)}:${String(Math.floor(S.t % 60)).padStart(2, '0')}</b></div>
      <div><span>Verpasst</span><b>${missed}</b></div>`;
    $('end').classList.remove('hidden');
  }

  /* ---------------------------------------------------------- Zeichnen */
  function rrect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawRoute() {
    const p = LEVEL.path;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = S.view === 'near' ? 'rgba(247,166,0,.20)' : 'rgba(247,166,0,.16)';
    ctx.lineWidth = S.view === 'near' ? 0.9 : 3.4;
    ctx.beginPath();
    p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
  }

  function drawStopMarks() {
    const cur = currentStop();
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260);
    for (const st of LEVEL.stops) {
      const r = S.view === 'near' ? 3.0 : 9;
      ctx.beginPath();
      ctx.arc(st.x, st.y, r, 0, Math.PI * 2);
      if (st.done) {
        ctx.fillStyle = 'rgba(86,196,106,.22)';
        ctx.fill();
        ctx.strokeStyle = '#56c46a';
      } else if (st === cur) {
        ctx.fillStyle = `rgba(247,166,0,${0.10 + 0.12 * pulse})`;
        ctx.fill();
        ctx.strokeStyle = '#f7a600';
      } else {
        ctx.strokeStyle = 'rgba(232,238,243,.35)';
      }
      ctx.lineWidth = S.view === 'near' ? 0.45 : 0.9;
      ctx.stroke();
    }
  }

  function drawModule(sPos, len, kind) {
    const p = sample(sPos);
    const L = len, half = 1.32;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.ang);

    // Schatten
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    rrect(-L / 2 + 0.5, -half + 0.6, L, 2.64, 0.85);
    ctx.fill();

    // Wagenkasten
    rrect(-L / 2, -half, L, 2.64, 0.85);
    ctx.fillStyle = '#f6c40a';
    ctx.fill();
    ctx.lineWidth = 0.16;
    ctx.strokeStyle = '#8a6c05';
    ctx.stroke();

    // Dach mit Fugen
    rrect(-L / 2 + 0.44, -0.52, L - 0.88, 1.04, 0.24);
    ctx.fillStyle = '#d8d2bf';
    ctx.fill();
    ctx.strokeStyle = '#a49e8b';
    ctx.lineWidth = 0.1;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(116,110,95,.6)';
    ctx.lineWidth = 0.07;
    for (let i = 1; i <= 3; i++) {
      const x = -L / 2 + (L * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, -0.44);
      ctx.lineTo(x, 0.44);
      ctx.stroke();
    }

    // Dachaufbauten
    ctx.fillStyle = '#aaa38e';
    ctx.fillRect(-L / 2 + 1.15, -0.34, 2.1, 0.68);
    ctx.fillRect(L / 2 - 3.25, -0.34, 2.1, 0.68);

    // Stromabnehmer auf dem Mittelteil
    if (kind === 'mid') {
      ctx.strokeStyle = '#6f6a5c';
      ctx.lineWidth = 0.12;
      ctx.beginPath();
      ctx.moveTo(-1.15, -0.45); ctx.lineTo(1.15, 0.45);
      ctx.moveTo(-1.15, 0.45); ctx.lineTo(1.15, -0.45);
      ctx.moveTo(-0.95, 0); ctx.lineTo(0.95, 0);
      ctx.stroke();
    }

    // Türen als dunkle Schlitze in der gelben Kante
    ctx.fillStyle = '#c9a000';
    for (const sy of [-1, 1]) {
      for (const dx of [-L / 2 + 2.0, L / 2 - 2.0]) {
        ctx.fillRect(dx - 0.5, sy > 0 ? half - 0.22 : -half, 1.0, 0.22);
      }
    }

    // Front- und Heckfenster
    if (kind === 'front') {
      rrect(L / 2 - 1.15, -1.14, 0.95, 2.28, 0.32);
      ctx.fillStyle = '#20272e';
      ctx.fill();
      ctx.fillStyle = '#f7a600';
      ctx.fillRect(L / 2 - 0.44, -0.5, 0.2, 1.0);
    } else if (kind === 'rear') {
      rrect(-L / 2 + 0.2, -1.14, 0.85, 2.28, 0.32);
      ctx.fillStyle = '#20272e';
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-L / 2 + 0.02, -1.0, 0.15, 0.45);
      ctx.fillRect(-L / 2 + 0.02, 0.55, 0.15, 0.45);
    }
    ctx.restore();
  }

  function drawTram() {
    const mods = [[0, 10.4, 'front'], [11.4, 10.4, 'mid'], [22.8, 10.4, 'rear']];
    for (const [off, len, kind] of mods) drawModule(S.s - (off + len / 2), len, kind);
  }

  let view = null;

  function w2s(x, y) {
    if (!view) return null;
    const dx = (x - cam.x) * view.pxPerM, dy = (y - cam.y) * view.pxPerM;
    const c = Math.cos(view.rot), s = Math.sin(view.rot);
    return { x: W / 2 + dx * c - dy * s, y: H / 2 + dx * s + dy * c };
  }

  /* ---------------------------------------------------------- Gleise */
  function offsetPolyline(pts, d) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const L = Math.hypot(dx, dy) || 1;
      out.push([pts[i][0] - (dy / L) * d, pts[i][1] + (dx / L) * d]);
    }
    return out;
  }

  function buildRails() {
    if (LEVEL._bed || !LEVEL.rails) return;
    const mk = (d) => {
      const path = new Path2D();
      for (const p of LEVEL.rails) {
        const q = d === 0 ? p : offsetPolyline(p, d);
        path.moveTo(q[0][0], q[0][1]);
        for (let i = 1; i < q.length; i++) path.lineTo(q[i][0], q[i][1]);
      }
      return path;
    };
    LEVEL._bed = mk(0);
    LEVEL._ra = mk(0.72);
    LEVEL._rb = mk(-0.72);
  }

  function drawRails() {
    buildRails();
    if (!LEVEL._bed) return;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#3d4144';
    ctx.lineWidth = 3.3;
    ctx.stroke(LEVEL._bed);
    ctx.strokeStyle = '#c2c8cb';
    ctx.lineWidth = 0.36;
    ctx.stroke(LEVEL._ra);
    ctx.stroke(LEVEL._rb);

    // Leitlinie: zeigt in der Nahansicht, wo die Linie weiterläuft
    ctx.strokeStyle = 'rgba(247,166,0,.5)';
    ctx.lineWidth = 0.38;
    ctx.setLineDash([2.4, 2.4]);
    ctx.beginPath();
    LEVEL.path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawLabels() {
    if (!view) return;
    ctx.font = '600 11px ui-monospace,Menlo,monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const side = S.view === 'near';
    for (const st of LEVEL.stops) {
      const p = w2s(st.x, st.y);
      if (!p || p.x < -140 || p.x > W + 40 || p.y < -24 || p.y > H + 24) continue;
      const label = st.name;
      const w = ctx.measureText(label).width + 12;
      const bx = side ? p.x + 14 : p.x - w / 2;
      const by = side ? p.y : p.y - 9;
      ctx.fillStyle = 'rgba(10,16,22,.78)';
      rrectScreen(bx, by - 9, w, 18, 6);
      ctx.fill();
      ctx.fillStyle = st.done ? '#56c46a' : '#e8eef3';
      ctx.fillText(label, bx + 6, by + 0.5);
    }
  }

  function rrectScreen(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawMinimap() {
    const w = mini.width, h = mini.height;
    mctx.clearRect(0, 0, w, h);
    const scale = Math.min(w / LEVEL.wm, h / LEVEL.hm);
    const ox = (w - LEVEL.wm * scale) / 2, oy = (h - LEVEL.hm * scale) / 2;
    const X = x => ox + (x + LEVEL.wm / 2) * scale;
    const Y = y => oy + (y + LEVEL.hm / 2) * scale;
    mctx.drawImage(MAP, ox, oy, LEVEL.wm * scale, LEVEL.hm * scale);
    mctx.strokeStyle = 'rgba(247,166,0,.85)';
    mctx.lineWidth = 1.4;
    mctx.beginPath();
    LEVEL.path.forEach(([x, y], i) => i ? mctx.lineTo(X(x), Y(y)) : mctx.moveTo(X(x), Y(y)));
    mctx.stroke();
    for (const st of LEVEL.stops) {
      mctx.beginPath();
      mctx.arc(X(st.x), Y(st.y), st.done ? 2.6 : 2.1, 0, Math.PI * 2);
      mctx.fillStyle = st.done ? '#56c46a' : '#f7a600';
      mctx.fill();
    }
    const p = sample(S.s);
    mctx.beginPath();
    mctx.arc(X(p.x), Y(p.y), 3.2, 0, Math.PI * 2);
    mctx.fillStyle = '#fff';
    mctx.fill();
    mctx.strokeStyle = '#1b2228';
    mctx.lineWidth = 1;
    mctx.stroke();
  }

  function drawMapPatch(pxPerM, rot) {
    // Nur den sichtbaren Ausschnitt der Karte zeichnen (rotiert = Bounding-Box)
    const c = Math.cos(-rot), s = Math.sin(-rot);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [sx, sy] of [[0, 0], [W, 0], [0, H], [W, H]]) {
      const dx = (sx - W / 2) / pxPerM, dy = (sy - H / 2) / pxPerM;
      const wx = cam.x + dx * c - dy * s;
      const wy = cam.y + dx * s + dy * c;
      if (wx < x0) x0 = wx;
      if (wx > x1) x1 = wx;
      if (wy < y0) y0 = wy;
      if (wy > y1) y1 = wy;
    }
    const hw = LEVEL.wm / 2, hh = LEVEL.hm / 2, px = LEVEL.pxm;
    x0 = Math.max(-hw, x0); y0 = Math.max(-hh, y0);
    x1 = Math.min(hw, x1); y1 = Math.min(hh, y1);
    if (x1 <= x0 || y1 <= y0) return;
    ctx.drawImage(MAP,
      (x0 + hw) * px, (y0 + hh) * px, (x1 - x0) * px, (y1 - y0) * px,
      x0, y0, x1 - x0, y1 - y0);
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#0d1216';
    ctx.fillRect(0, 0, W, H);

    let pxPerM, rot;
    if (S.view === 'near') {
      // Bahn von oben bis unten: Höhe geteilt durch Wagenlänge
      pxPerM = Math.min(16, (H * 0.9) / TRAM_LEN) * S.nearZoom;
      rot = -sample(S.s - TRAM_LEN / 2).ang - Math.PI / 2;
    } else {
      pxPerM = LEVEL.pxm * S.zoom;
      rot = 0;
    }
    view = { pxPerM, rot };

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(rot);
    ctx.scale(pxPerM, pxPerM);
    ctx.translate(-cam.x, -cam.y);
    ctx.imageSmoothingEnabled = false;

    drawMapPatch(pxPerM, rot);
    if (S.view === 'near') drawRails();
    else drawRoute();
    drawStopMarks();
    drawTram();
    ctx.restore();

    drawLabels();
    drawMinimap();
  }

  /* ---------------------------------------------------------- Kamera */
  function clampCam() {
    if (S.view !== 'map') return;
    const z = LEVEL.pxm * S.zoom;
    const hw = W / (2 * z), hh = H / (2 * z);
    const mx = Math.max(0, LEVEL.wm / 2 - hw), my = Math.max(0, LEVEL.hm / 2 - hh);
    cam.x = Math.max(-mx, Math.min(mx, cam.x));
    cam.y = Math.max(-my, Math.min(my, cam.y));
  }

  /* ---------------------------------------------------------- Schleife */
  let last = 0;
  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    if (LEVEL) {
      update(dt);
      clampCam();
      draw();
      updateHud();
      if (S.msgT > 0) {
        S.msgT -= dt;
        if (S.msgT <= 0) $('toast').classList.remove('on');
      }
    }
    requestAnimationFrame(frame);
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
  }

  /* ---------------------------------------------------------- Eingabe */
  function setDoors(open) {
    if (S.finished) return;
    if (open) {
      const st = atStop();
      if (!st) { toast('Nur an der Haltestelle öffnen'); return; }
      if (S.v > 0.35) { toast('Erst anhalten'); return; }
      S.doorTarget = 1;
    } else {
      S.doorTarget = 0;
      LEVEL.stops.forEach(st => { st.serving = false; });
    }
  }

  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') { keys.add('gas'); e.preventDefault(); }
    if (k === 's' || e.key === 'ArrowDown') { keys.add('brk'); e.preventDefault(); }
    if (e.key === ' ') { S.deadman = true; e.preventDefault(); }
    if (k === 'd') setDoors(S.doorTarget < 0.5);
    if (k === 'p') togglePause();
    if (k === 'r') reset();
    if (k === '+' || k === '=') zoomBy(1.12);
    if (k === '-') zoomBy(1 / 1.12);
    if (k === '0') { S.zoom = 1.7; S.nearZoom = 1; }
    if (k === 'v') toggleView();
    if (k === 'enter' && !S.running) startGame();
  });
  window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.delete('gas');
    if (k === 's' || e.key === 'ArrowDown') keys.delete('brk');
    if (e.key === ' ') S.deadman = false;
  });
  window.addEventListener('blur', () => { keys.clear(); S.deadman = false; });

  function zoomBy(f) {
    if (S.view === 'near') S.nearZoom = Math.max(0.55, Math.min(1.7, S.nearZoom * f));
    else S.zoom = Math.max(0.75, Math.min(2.4, S.zoom * f));
  }

  function toggleView() {
    S.view = S.view === 'near' ? 'map' : 'near';
    if (LEVEL) clampCam();
    toast(S.view === 'near' ? 'Nahansicht: Bahn von oben bis unten' : 'Kartenansicht');
  }
  window.addEventListener('wheel', e => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, { passive: false });

  function togglePause() {
    if (!S.running || S.finished) return;
    S.paused = !S.paused;
    $('pauseScreen').classList.toggle('hidden', !S.paused);
  }

  function startGame() {
    $('start').classList.add('hidden');
    S.running = true;
    S.paused = false;
    toast('Erst Türen öffnen (D) – dann W / ↑ für Gas');
  }

  $('btnStart').addEventListener('click', startGame);
  $('btnAgain').addEventListener('click', () => { reset(); $('start').classList.remove('hidden'); });
  $('btnResume').addEventListener('click', togglePause);
  $('btnPause').addEventListener('click', togglePause);
  $('btnView').addEventListener('click', toggleView);
  $('btnZoomIn').addEventListener('click', () => zoomBy(1.15));
  $('btnZoomOut').addEventListener('click', () => zoomBy(1 / 1.15));
  window.addEventListener('resize', resize);

  /* ---------------------------------------------------------- Start */
  async function boot() {
    resize();
    const [level, map] = await Promise.all([
      fetch('assets/demo/level.json').then(r => r.json()),
      loadImage('assets/demo/map.png'),
    ]);
    LEVEL = level;
    MAP = map;
    S.zoom = 1.7;
    buildSegs();
    reset();
    window.__demo = { S, LEVEL, stops: LEVEL.stops };
    requestAnimationFrame(frame);
  }

  boot().catch(err => {
    console.error(err);
    document.body.insertAdjacentHTML('beforeend',
      '<div style="position:fixed;inset:0;display:grid;place-items:center;color:#e3574f;font:14px monospace;background:#0b0f13">Level konnte nicht geladen werden: '
      + err.message + '</div>');
  });
})();
