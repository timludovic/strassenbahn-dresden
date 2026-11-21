/* Weltkarten-Viewer: pan, zoom, Haltestellen-Labels, Maßstab. */
(() => {
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const meta = document.getElementById('meta');

  let W = 0, H = 0, DPR = 1;
  let img = null, imgs = {}, data = { stops: [], pxm: 2.14, m: [2800, 2500] };
  let corridor = true, cityMode = false, cityImg = null, imgPxm = 2.14;
  let scale = 1, ox = 0, oy = 0;          // Bild -> Schirm: s = p * scale + o
  let showStops = true, ready = false;

  const MINZ = 0.05, MAXZ = 4;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
  }

  function fit() {
    if (!img) return;
    scale = Math.min(W / img.width, H / img.height) * 0.98;
    center();
  }

  function center() {
    if (!img) return;
    ox = (W - img.width * scale) / 2;
    oy = (H - img.height * scale) / 2;
  }

  function clamp() {
    if (!img) return;
    scale = Math.max(MINZ, Math.min(MAXZ, scale));
    const iw = img.width * scale, ih = img.height * scale;
    if (iw <= W) ox = (W - iw) / 2;
    else ox = Math.max(W - iw, Math.min(0, ox));
    if (ih <= H) oy = (H - ih) / 2;
    else oy = Math.max(H - ih, Math.min(0, oy));
  }

  function zoomAt(f, sx, sy) {
    const ns = Math.max(MINZ, Math.min(MAXZ, scale * f));
    const k = ns / scale;
    ox = sx - (sx - ox) * k;
    oy = sy - (sy - oy) * k;
    scale = ns;
    clamp();
    draw();
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#0a0d10';
    ctx.fillRect(0, 0, W, H);
    if (!img) return;

    const sx = Math.max(0, -ox / scale);
    const sy = Math.max(0, -oy / scale);
    const sw = Math.min(img.width - sx, W / scale);
    const sh = Math.min(img.height - sy, H / scale);
    ctx.imageSmoothingEnabled = scale < 1;
    ctx.drawImage(img, sx, sy, sw, sh,
      ox + sx * scale, oy + sy * scale, sw * scale, sh * scale);

    if (showStops && !cityMode) drawStops();
    drawTram();
    drawScale();
    updateMeta();
  }

  function drawStops() {
    const f = Math.max(9, Math.min(13, 8 + scale * 4));
    ctx.font = `700 ${f}px ui-monospace,Menlo,monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const placed = [];
    for (const st of data.stops) {
      const x = st.x * scale + ox, y = st.y * scale + oy;
      if (x < -180 || x > W + 40 || y < -20 || y > H + 20) continue;
      ctx.beginPath();
      ctx.arc(x, y, f * 0.34, 0, Math.PI * 2);
      ctx.fillStyle = '#f7a600';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#12181e';
      ctx.stroke();
      const tw = ctx.measureText(st.name).width;
      const lx = x + f * 0.75, ly = y - f * 0.55;
      const box = [lx - 2, ly - 2, lx + tw + 2, ly + f + 3];
      // Labels, die sich überlappen würden, weglassen (Punkt bleibt)
      if (placed.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
      placed.push(box);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(8,12,16,.9)';
      ctx.strokeText(st.name, lx, ly + f * 0.5);
      ctx.fillStyle = '#fff';
      ctx.fillText(st.name, lx, ly + f * 0.5);
    }
  }


  /* ---------------------------------------------------------- Straßenbahn (Linie 1) */
  let line = null, cityMeta = null;
  let tramS = 7000, tramOn = true, lastTs = 0;
  const LON0 = 13.7370, LAT0 = 51.0520;
  const K0 = Math.cos(LAT0 * Math.PI / 180), M_LAT = 111320;

  function proj(lat, lon) {
    if (cityMode) {
      const m = cityMeta;
      if (!m) return null;
      return [((lon - m.lon) * M_LAT * K0 + m.ox - m.x0) * m.pxm,
              ((m.lat - lat) * M_LAT + m.oy - m.y0) * m.pxm];
    }
    if (!img) return null;
    return [(lon - LON0) * M_LAT * K0 * imgPxm + img.width / 2,
            (LAT0 - lat) * M_LAT * imgPxm + img.height / 2];
  }

  function atS(s) {
    const c = line.cum;
    let i = 1;
    while (i < c.length - 1 && c[i] < s) i++;
    const a = line.chain[i - 1], b = line.chain[i];
    const f = Math.max(0, Math.min(1, (s - c[i - 1]) / ((c[i] - c[i - 1]) || 1)));
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTram() {
    if (!line || !ready) return;
    const here = atS(tramS), prev = atS(Math.max(0, tramS - 8));
    const P = proj(here[0], here[1]), Q = proj(prev[0], prev[1]);
    if (!P || !Q) return;
    const px = P[0] * scale + ox, py = P[1] * scale + oy;
    if (px < -100 || px > W + 100 || py < -100 || py > H + 100) return;
    const pxm = cityMode ? 0.18 : imgPxm;
    const len = 33.2 * pxm * scale;              // 33 m Fahrzeug, maßstäblich
    if (len < 17) {                              // zu klein: Marke mit Liniennummer
      ctx.beginPath(); ctx.arc(px, py, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f6c40a'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#1a1405'; ctx.stroke();
      ctx.fillStyle = '#1a1405'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 10px ui-monospace,Menlo,monospace';
      ctx.fillText('1', px, py + 0.5);
      return;
    }
    const ang = Math.atan2(py - (Q[1] * scale + oy), px - (Q[0] * scale + ox));
    const k = len / 33.2, wd = Math.max(2.65 * k, 8);   // px je Meter, Wagenbreite (min. lesbar)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    rrect(-33.2 * k, -wd * 0.2, 33.2 * k + wd * 0.3, wd, wd * 0.35); ctx.fill();
    for (const off of [22.8, 11.4, 0]) {         // drei Module, Front bei x = 0
      const mx = -(off + 10.4) * k, mw = 10.0 * k;
      rrect(mx, -wd / 2, mw, wd, wd * 0.26);
      ctx.fillStyle = '#f6c40a'; ctx.fill();
      ctx.lineWidth = Math.max(1, k * 0.08); ctx.strokeStyle = '#2b2206'; ctx.stroke();
      if (wd > 11) {                             // Nahsicht: Dach + Fensterbänder
        ctx.fillStyle = '#e7cf62';
        rrect(mx + mw * 0.1, -wd * 0.2, mw * 0.8, wd * 0.4, wd * 0.14); ctx.fill();
        ctx.fillStyle = '#16202b';
        rrect(mx + mw * 0.08, -wd * 0.42, mw * 0.8, wd * 0.22, wd * 0.07); ctx.fill();
        rrect(mx + mw * 0.08, wd * 0.2, mw * 0.8, wd * 0.22, wd * 0.07); ctx.fill();
      }                                        // klein: voll gelb, sonst Matsch
      if (k * 10.0 > 26) {                       // Frontscheibe + Scheinwerfer
        ctx.fillStyle = '#0e1720';
        rrect(-1.8 * k, -wd * 0.34, 1.4 * k, wd * 0.68, wd * 0.18); ctx.fill();
        ctx.fillStyle = '#fff4c4';
        ctx.beginPath(); ctx.arc(-1.0 * k, -wd * 0.3, wd * 0.09, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(-1.0 * k, wd * 0.3, wd * 0.09, 0, 7); ctx.fill();
      }
    }
    ctx.restore();
  }

  function updateTramInfo() {
    const el = document.getElementById('tramInfo');
    if (!el) return;
    if (!line) { el.textContent = 'Linie 1 · lädt …'; return; }
    if (!tramOn) { el.textContent = 'Linie 1 · angehalten'; return; }
    const nx = line.stops.find(s => s.s > tramS + 10);
    el.textContent = nx
      ? `Linie 1 → ${nx.name} · ${Math.round(nx.s - tramS)} m`
      : `Linie 1 · Endstation ${line.stops[line.stops.length - 1].name}`;
  }

  function centerOnTram() {
    const p = atS(tramS);
    if (!p || !img) return;
    const P = proj(p[0], p[1]);
    if (!P) return;
    const bar = document.getElementById('bar');
    const top = bar ? Math.min(bar.getBoundingClientRect().bottom + 12, H * 0.45) : 0;
    ox = W / 2 - P[0] * scale;
    oy = (top + H) / 2 - P[1] * scale;
    clamp();
    draw();
  }

  function loop(ts) {
    const dt = Math.min(0.2, lastTs ? (ts - lastTs) / 1000 : 0);
    lastTs = ts;
    if (tramOn && line) {
      tramS = (tramS + 14 * dt) % line.length;
      draw();
      updateTramInfo();
    }
    requestAnimationFrame(loop);
  }

  function drawScale() {
    const pxPerM = imgPxm * scale;
    if (!pxPerM) return;
    let m = 100;
    for (const cand of [25, 50, 100, 200, 250, 500, 1000, 2000]) {
      if (cand * pxPerM > 180) break;
      m = cand;
    }
    const len = m * pxPerM;
    const x = 14, y = H - 22;
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
    ctx.strokeStyle = '#f7a600';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
    ctx.font = '600 11px ui-monospace,Menlo,monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#f7a600';
    ctx.fillText(m + ' m', x, y - 5);
  }

  function updateMeta() {
    const pxm = imgPxm * scale;
    const zoom = pxm >= 0.05 ? `${pxm.toFixed(1)} px/m` : `${Math.round(1 / pxm)} m/px`;
    const area = cityMode ? 'ganzes Netz 21 × 19 km' : `${data.m[0]} × ${data.m[1]} m`;
    meta.textContent = `${area} · ${zoom}`;
  }

  /* ---------------------------------------------------------- Eingabe */
  let drag = null;
  const pointers = new Map();
  let pinch = null;

  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    cv.classList.add('drag');
    if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, ox, oy };
    else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: scale };
    }
  });

  cv.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const ns = Math.max(MINZ, Math.min(MAXZ, pinch.s * (d / pinch.d)));
      const k = ns / scale;
      ox = cx - (cx - ox) * k;
      oy = cy - (cy - oy) * k;
      scale = ns;
      clamp(); draw(); updateMeta();
      return;
    }
    if (drag) {
      ox = drag.ox + (e.clientX - drag.x);
      oy = drag.oy + (e.clientY - drag.y);
      clamp(); draw();
    }
  });

  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      drag = { x: p.x, y: p.y, ox, oy };
    } else if (pointers.size === 0) {
      drag = null;
      cv.classList.remove('drag');
    }
  };
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', endPointer);

  cv.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY);
    updateMeta();
  }, { passive: false });

  cv.addEventListener('dblclick', (e) => {
    zoomAt(2, e.clientX, e.clientY);
    updateMeta();
  });

  addEventListener('keydown', (e) => {
    const step = 80;
    if (e.key === 'ArrowLeft') { ox += step; }
    else if (e.key === 'ArrowRight') { ox -= step; }
    else if (e.key === 'ArrowUp') { oy += step; }
    else if (e.key === 'ArrowDown') { oy -= step; }
    else if (e.key === '+' || e.key === '=') { zoomAt(1.25, W / 2, H / 2); updateMeta(); return; }
    else if (e.key === '-') { zoomAt(0.8, W / 2, H / 2); updateMeta(); return; }
    else if (e.key === '0') { fit(); draw(); updateMeta(); return; }
    else return;
    clamp(); draw();
  });

  document.getElementById('btnTram').addEventListener('click', (e) => {
    tramOn = !tramOn;
    e.currentTarget.classList.toggle('on', tramOn);
    if (tramOn) centerOnTram();
    draw();
    updateTramInfo();
  });

  document.getElementById('btnStops').addEventListener('click', (e) => {
    showStops = !showStops;
    e.currentTarget.classList.toggle('on', showStops);
    draw();
  });

  function showCity() {
    cityMode = true;
    img = cityImg;
    imgPxm = 0.18;
    scale = Math.min(W / img.width, H / img.height) * 0.97;
    center();
    draw();
  }

  document.getElementById('btnCity').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (cityImg) { showCity(); return; }
    btn.textContent = 'lädt …';
    loadImg('assets/world/city-overview.jpg?v=' + Date.now()).then((im) => {
      cityImg = im;
      btn.textContent = 'Stadt';
      showCity();
    }).catch(() => { btn.textContent = 'Stadt'; });
  });

  document.getElementById('btnCorr').addEventListener('click', (e) => {
    if (cityMode) {
      cityMode = false;
      img = corridor ? imgs.corr : imgs.full;
      fit();
      draw();
      return;
    }
    corridor = !corridor;
    img = corridor ? imgs.corr : imgs.full;
    e.currentTarget.classList.toggle('on', corridor);
    draw();
  });

  document.getElementById('btnFit').addEventListener('click', () => {
    fit(); draw(); updateMeta();
  });

  document.getElementById('btnOne').addEventListener('click', () => {
    const cx = (W / 2 - ox) / scale, cy = (H / 2 - oy) / scale;
    scale = 1;
    ox = W / 2 - cx;
    oy = H / 2 - cy;
    clamp(); draw(); updateMeta();
  });

  addEventListener('resize', () => { resize(); clamp(); draw(); updateMeta(); });

  /* ---------------------------------------------------------- Start */
  const loadImg = (src) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

  Promise.all([
    fetch('assets/world/stops.json').then(r => r.json()).catch(() => ({ stops: [] })),
    loadImg('assets/world/map-view.jpg'),
    loadImg('assets/world/corridor-view.jpg'),
    fetch('assets/world/line1.json').then(r => r.json()).catch(() => null),
    fetch('assets/world/city-overview.json').then(r => r.json()).catch(() => null),
  ]).then(([d, full, corr, ln, cm]) => {
    line = ln;
    cityMeta = cm;
    if (line && line.start) tramS = line.start;
    data = { stops: d.stops || [], pxm: d.pxm || 2.14, m: d.m || [2800, 2500] };
    imgs = { full, corr };
    img = corridor ? corr : full;
    imgPxm = 2.14;
    ready = true;
    resize();
    // Startansicht: 1:1 auf die Bahn, damit man sie sofort fahren sieht
    scale = 1;
    centerOnTram();
    draw();
    updateMeta();
    updateTramInfo();
    requestAnimationFrame(loop);
  }).catch(() => {
    meta.textContent = 'Karte konnte nicht geladen werden';
  });
})();
