// Pixelart-Rendering der Dresden-Karte, Fahrzeuge, Signale und Weichen.
import { NODES, RIVER, RIVER_WIDTH, PARKS, LANDMARKS, DISTRICT_LABELS, VEHICLES } from './data.js';
import { edgePoint, riverDistance } from './net.js';

// Satelliten-/Luftbild-Optik: Vegetation, Dächer, Schatten, Asphalt
const COL = {
  grass: '#66765a',
  grassDark: '#5b6a50',
  water: '#3f6672',
  waterLight: '#517b86',
  waterDark: '#2f5058',
  sand: '#8a7f63',
  road: '#55585b',
  roadEdge: '#3f4245',
  roadLine: '#c9c5b6',
  rail: '#b2b6b8',
  railDark: '#3f4347',
  bridge: '#8f8d88',
  bridgeEdge: '#5c5b57',
  platform: '#a9a49a',
  platformEdge: '#75716a',
  green: '#48c06d',
  yellow: '#ffd200',
  red: '#ff4d4d',
};
const ACCENT = '#ffc82e';
const ACCENT_BAD = '#ff5a4a';

const ROOF_COLORS = ['#8d5645', '#7e5242', '#6d5e52', '#867866', '#6b7066', '#94705b', '#9b8a75', '#5e6259', '#7a6a5a', '#a06a4e', '#736c60', '#8a7d6a', '#565a54', '#7d7264', '#6a6a62', '#8f8372', '#5f5c55', '#837a6b'];
const WALL_COLORS = ['#c9b18c', '#bfa27a', '#d3c3a3', '#b99a78', '#a89078'];

function hash(a, b, c = 0) {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function offsetPts(pts, d) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const ang = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
    out.push([pts[i][0] - Math.sin(ang) * d, pts[i][1] + Math.cos(ang) * d]);
  }
  return out;
}

let decor = null;

export function initDecor(net) {
  const buildings = [];
  const trees = [];
  const fields = [];
  const sideStreets = [];
  const mapPoints = [];

  for (const edge of net.edges) {
    for (let d = 36; d < edge.len - 36; d += 21) {
      const p = edgePoint(edge, edge.a, d);
      for (const side of [-1, 1]) {
        const rowDefs = [
          { off: 19, prob: 0.94 },
          { off: 41, prob: 0.68 },
          { off: 63, prob: 0.42 },
        ];
        for (let row = 0; row < rowDefs.length; row++) {
          const def = rowDefs[row];
          const r = hash(edge.index, Math.round(d), side + row * 7);
          if (r > def.prob) continue;
          const off = def.off + r * 9;
          const nx = -Math.sin(p.ang) * side;
          const ny = Math.cos(p.ang) * side;
          const bx = p.x + nx * off;
          const by = p.y + ny * off;
          if (riverDistance(bx, by) < 6) continue;
          let inPark = false;
          for (const park of PARKS) if (pointInPoly(bx, by, park.pts)) { inPark = true; break; }
          if (inPark) continue;
          let nearNode = false;
          for (const id of [edge.a, edge.b]) {
            const n = NODES[id];
            if (Math.hypot(n.x - bx, n.y - by) < 32) { nearNode = true; break; }
          }
          if (nearNode) continue;
          const w = 15 + r * 20;
          const h = 13 + hash(edge.index, Math.round(d), side + 9 + row) * 13;
          buildings.push({
            x: bx, y: by,
            ang: p.ang + (r - 0.5) * 0.16,
            w, h,
            roof: ROOF_COLORS[Math.floor(hash(edge.index, d, side + 3 + row) * ROOF_COLORS.length)],
            wall: WALL_COLORS[Math.floor(hash(edge.index, d, side + 5 + row) * WALL_COLORS.length)],
            shade: 0.55 + r * 0.45,
          });
        }
      }
    }
  }

  // Felder und Wiesen als Grundstruktur außerhalb der Straßenzüge
  const FIELD_COLORS = ['#66765a', '#5d6d51', '#6f7c5e', '#5a6a50', '#75805f', '#6b6f55', '#7a8266', '#58684c', '#7d7a64'];
  for (let i = 0; i < 1100; i++) {
    const x = -5200 + hash(i, 1, 7) * 10400;
    const y = -3400 + hash(i, 2, 8) * 7800;
    if (riverDistance(x, y) < 30) continue;
    fields.push({
      x, y,
      w: 50 + hash(i, 3, 9) * 220,
      h: 40 + hash(i, 4, 10) * 170,
      ang: (hash(i, 5, 11) - 0.5) * 0.8,
      c: FIELD_COLORS[Math.floor(hash(i, 6, 12) * FIELD_COLORS.length)],
    });
  }

  // Querstraßen, damit die Stadt nicht nur aus einer Gleisachse besteht
  for (const edge of net.edges) {
    for (let d = 95; d < edge.len - 95; d += 155) {
      const p = edgePoint(edge, edge.a, d);
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      for (const side of [-1, 1]) {
        const a = [p.x + nx * side * 12, p.y + ny * side * 12];
        const b = [p.x + nx * side * 125, p.y + ny * side * 125];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (riverDistance(mx, my) < 22) continue;
        let inPark = false;
        for (const park of PARKS) if (pointInPoly(mx, my, park.pts)) { inPark = true; break; }
        if (inPark) continue;
        sideStreets.push([a, b]);
        for (let k = 0; k < 5; k++) {
          const t = 0.16 + k * 0.18;
          const lateral = k % 2 === 0 ? 17 : -17;
          const bx = a[0] + (b[0] - a[0]) * t + Math.cos(p.ang) * lateral;
          const by = a[1] + (b[1] - a[1]) * t + Math.sin(p.ang) * lateral;
          if (riverDistance(bx, by) < 6) continue;
          const rr = hash(edge.index, Math.round(d) + k, side + 41);
          buildings.push({
            x: bx, y: by, ang: p.ang + Math.PI / 2,
            w: 14 + rr * 12, h: 12 + rr * 10,
            roof: ROOF_COLORS[Math.floor(hash(edge.index, Math.round(d) + k, side + 43) * ROOF_COLORS.length)],
            wall: WALL_COLORS[Math.floor(hash(edge.index, Math.round(d) + k, side + 45) * WALL_COLORS.length)],
            shade: 0.6,
          });
        }
      }
    }
  }

  // Ferne Blockstruktur: kleine Grundrisse für die Stadtdichte der Karte
  const trackPts = [];
  for (const e of net.edges) {
    for (let d = 0; d <= e.len; d += 34) {
      const p = edgePoint(e, e.a, d);
      trackPts.push([p.x, p.y]);
    }
  }
  // grobes Gitternetz, damit die Dichte-Prüfung schnell bleibt
  const CELL = 50;
  const trackGrid = new Map();
  for (const p of trackPts) {
    const k = Math.floor(p[0] / CELL) + ',' + Math.floor(p[1] / CELL);
    if (!trackGrid.has(k)) trackGrid.set(k, []);
    trackGrid.get(k).push(p);
  }
  const nearTrack = (x, y) => {
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        const cell = trackGrid.get(cx + ix + ',' + (cy + iy));
        if (!cell) continue;
        for (const [px, py] of cell) {
          if (Math.abs(px - x) < 38 && Math.abs(py - y) < 38) return true;
        }
      }
    }
    return false;
  };
  for (let gx = -4600; gx < 4600; gx += 36) {
    for (let gy = -3000; gy < 3000; gy += 32) {
      if (hash(gx, gy, 71) > 0.66) continue;
      const x = gx + (hash(gx, gy, 72) - 0.5) * 22;
      const y = gy + (hash(gx, gy, 73) - 0.5) * 22;
      if (riverDistance(x, y) < 34) continue;
      let inPark = false;
      for (const park of PARKS) if (pointInPoly(x, y, park.pts)) { inPark = true; break; }
      if (inPark) continue;
      if (nearTrack(x, y)) continue;
      buildings.push({
        x, y,
        ang: (hash(gx, gy, 74) - 0.5) * 0.5,
        w: 14 + hash(gx, gy, 75) * 22,
        h: 12 + hash(gx, gy, 76) * 18,
        roof: ROOF_COLORS[Math.floor(hash(gx, gy, 77) * ROOF_COLORS.length)],
        shade: 0.9,
      });
    }
  }

  // Geparkte und fahrende Autos am Straßenrand
  const cars = [];
  const CAR_COLORS = ['#d9d9d5', '#2f3134', '#9aa0a4', '#8d3a33', '#3c5a7a', '#c9c1a8', '#5c6a55', '#b0a58c'];
  for (const edge of net.edges) {
    for (let d = 40; d < edge.len - 40; d += 42) {
      const r = hash(edge.index, Math.round(d), 91);
      if (r > 0.34) continue;
      const p = edgePoint(edge, edge.a, d);
      const side = r < 0.17 ? 1 : -1;
      const off = 8.2 + r * 3.5;
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      cars.push({
        x: p.x + nx * off * side,
        y: p.y + ny * off * side,
        ang: p.ang + (hash(edge.index, d, 93) - 0.5) * 0.1,
        c: CAR_COLORS[Math.floor(hash(edge.index, d, 92) * CAR_COLORS.length)],
      });
    }
  }

  // Baumgruppen am Stadtrand
  for (let i = 0; i < 340; i++) {
    const x = -5200 + hash(i, 2, 31) * 10400;
    const y = -3400 + hash(i, 3, 32) * 7800;
    if (riverDistance(x, y) < 22) continue;
    if (Math.hypot(x, y) < 1400) continue;
    trees.push({ x, y, r: 3 + hash(i, 4, 33) * 5, c: hash(i, 5, 34) > 0.5 ? '#3f5a38' : '#49663f' });
  }

  // Bäume in Parks und an den Elbwiesen
  for (const park of PARKS) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of park.pts) {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    for (let i = 0; i < 160; i++) {
      const x = minX + hash(i, 3, 1) * (maxX - minX);
      const y = minY + hash(i, 7, 2) * (maxY - minY);
      if (!pointInPoly(x, y, park.pts)) continue;
      trees.push({ x, y, r: 3 + hash(i, 11, 3) * 4, c: hash(i, 5, 4) > 0.5 ? '#3b5737' : '#45613c' });
    }
  }
  for (let i = 0; i < 220; i++) {
    const t = i / 220;
    const idx = Math.min(RIVER.length - 2, Math.floor(t * (RIVER.length - 1)));
    const [x0, y0] = RIVER[idx];
    const [x1, y1] = RIVER[idx + 1];
    const k = (t * (RIVER.length - 1)) % 1;
    const x = x0 + (x1 - x0) * k;
    const y = y0 + (y1 - y0) * k;
    const side = i % 2 ? 1 : -1;
    const off = (RIVER_WIDTH / 2 + 26 + hash(i, 2, 5) * 60) * side;
    const nx = -Math.sin(Math.atan2(y1 - y0, x1 - x0)) * off;
    const ny = Math.cos(Math.atan2(y1 - y0, x1 - x0)) * off;
    trees.push({ x: x + nx, y: y + ny, r: 3 + hash(i, 4, 6) * 5, c: '#405c39' });
  }

  // Fluss-Polygon
  const left = [], right = [];
  for (let i = 0; i < RIVER.length; i++) {
    const prev = RIVER[Math.max(0, i - 1)];
    const next = RIVER[Math.min(RIVER.length - 1, i + 1)];
    const ang = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    left.push([RIVER[i][0] + nx * RIVER_WIDTH / 2, RIVER[i][1] + ny * RIVER_WIDTH / 2]);
    right.push([RIVER[i][0] - nx * RIVER_WIDTH / 2, RIVER[i][1] - ny * RIVER_WIDTH / 2]);
  }
  const riverPoly = [...left, ...right.reverse()];

  // Kennzahlen für die Minimap
  for (const n of Object.values(NODES)) mapPoints.push([n.x, n.y]);
  const bounds = {
    minX: Math.min(...mapPoints.map(p => p[0])) - 300,
    maxX: Math.max(...mapPoints.map(p => p[0])) + 300,
    minY: Math.min(...mapPoints.map(p => p[1])) - 300,
    maxY: Math.max(...mapPoints.map(p => p[1])) + 300,
  };

  decor = { buildings, trees, fields, sideStreets, cars, riverPoly, bounds };
  return decor;
}

export function getDecor() { return decor; }

export function worldToScreen(view, x, y) {
  return {
    x: (x - view.camX) * view.zoom + view.w / 2,
    y: (view.camY - y) * view.zoom + view.h / 2,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function strokePolyline(ctx, pts, width, color) {
  if (!pts.length) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

export function renderFrame(ctx, G, net, view, now) {
  const { w, h, zoom } = view;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = COL.grass;
  ctx.fillRect(0, 0, w, h);

  const viewHalfW = w / (2 * zoom);
  const viewHalfH = h / (2 * zoom);
  const bbox = {
    x0: view.camX - viewHalfW - 100, x1: view.camX + viewHalfW + 100,
    y0: view.camY - viewHalfH - 100, y1: view.camY + viewHalfH + 100,
  };
  const visible = (x, y, pad = 0) => x > bbox.x0 - pad && x < bbox.x1 + pad && y > bbox.y0 - pad && y < bbox.y1 + pad;

  ctx.setTransform(zoom, 0, 0, -zoom, w / 2 - view.camX * zoom, h / 2 + view.camY * zoom);

  // Querstraßen
  if (decor) {
    ctx.strokeStyle = '#55584f';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [a, b] of decor.sideStreets) {
      if (!visible((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 70)) continue;
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    ctx.strokeStyle = '#6b6e66';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // Felder und Wiesen
  if (decor) {
    for (const f of decor.fields) {
      if (!visible(f.x, f.y, 120)) continue;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.ang);
      ctx.fillStyle = f.c;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(150,145,132,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-f.w / 2, -f.h / 2, f.w, f.h);
      ctx.restore();
    }
  }

  // Grünflächen
  for (const park of PARKS) {
    ctx.fillStyle = park.name === 'Elbwiesen' ? '#617a4f' : '#526a45';
    ctx.beginPath();
    park.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,45,25,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawRiver(ctx, now);

  // Straßen und Gleise
  for (const edge of net.edges) {
    const mid = edgePoint(edge, edge.a, edge.len / 2);
    if (!visible(mid.x, mid.y, 120)) continue;
    drawStreet(ctx, edge);
  }

  // Autos
  if (decor) {
    for (const c of decor.cars || []) {
      if (!visible(c.x, c.y, 16)) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.ang);
      ctx.fillStyle = 'rgba(18,22,16,0.35)';
      ctx.fillRect(-1.3, -2.0, 4.6, 2.2);
      ctx.fillStyle = c.c;
      ctx.fillRect(-2.2, -1.1, 4.6, 2.2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(-1.4, -0.75, 1.5, 1.5);
      ctx.restore();
    }
  }

  // Gebäude
  if (decor) {
    for (const b of decor.buildings) {
      if (!visible(b.x, b.y, 60)) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.ang);
      // Schlagschatten (Sonne von Nordwest)
      ctx.fillStyle = 'rgba(18,22,16,0.28)';
      roundRect(ctx, -b.w / 2 + 2.2, -b.h / 2 - 2.2, b.w, b.h, 1);
      ctx.fill();
      // Dachfläche
      const roof = b.roof || '#6f6156';
      ctx.fillStyle = roof;
      roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 1);
      ctx.fill();
      // Giebeldach mit zwei Dachflächen
      if (b.w > 18 && b.h > 13) {
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.moveTo(-b.w / 2, b.h / 2);
        ctx.lineTo(b.w / 2, b.h / 2);
        ctx.lineTo(b.w / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.beginPath();
        ctx.moveTo(-b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2, -b.h / 2);
        ctx.lineTo(b.w / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(30,28,24,0.45)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-b.w / 2, 0);
        ctx.lineTo(b.w / 2, 0);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(30,28,22,0.55)';
      ctx.lineWidth = 0.7;
      roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 1);
      ctx.stroke();
      ctx.restore();
    }
    for (const t of decor.trees) {
      if (!visible(t.x, t.y, 30)) continue;
      ctx.fillStyle = 'rgba(15,20,12,0.32)';
      ctx.beginPath();
      ctx.arc(t.x + 2.4, t.y - 2.4, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.c;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(190,220,160,0.18)';
      ctx.beginPath();
      ctx.arc(t.x - t.r * 0.25, t.y + t.r * 0.25, t.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLandmarks(ctx, visible);
  drawRouteHighlight(ctx, G);

  // Haltestellen
  drawStopPlatforms(ctx, G, net, visible);

  // Signale & Weichen
  drawSignals(ctx, G, net, visible);
  drawSwitch(ctx, G, net);

  // Sperren / Hindernisse
  drawBlocked(ctx, G, net, visible);
  drawObstacles(ctx, G);

  // Fahrgäste an der Haltestelle
  drawWaitingPeople(ctx, G, net, visible);

  // Zielhalt-Markierung
  drawStopTarget(ctx, G, view);

  // Straßenbahn
  if (G.tram) drawTram(ctx, G, now);
  drawAiTrams(ctx, G, now);

  // Sprechblasen-Anker werden im DOM gezeichnet
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  drawWorldLabels(ctx, G, net, view);

  if (G.bellUntil && now < G.bellUntil) {
    ctx.fillStyle = 'rgba(255,210,0,0.9)';
    ctx.font = 'bold 11px "Lucida Console", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('KLINGEL!', 10, h - 12);
  }
}

function drawRiver(ctx, now) {
  if (!decor) return;
  const poly = decor.riverPoly;
  ctx.fillStyle = COL.sand;
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  // Sandufer etwas breiter andeuten
  ctx.strokeStyle = COL.sand;
  ctx.lineWidth = 34;
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = COL.water;
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
      ctx.strokeStyle = '#7fb0d2';
    ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = COL.waterLight;
  ctx.lineWidth = 9;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 9; i++) {
    const off = 60 + i * 26;
    const pts = RIVER.map(([x, y], k) => {
      const prev = RIVER[Math.max(0, k - 1)];
      const next = RIVER[Math.min(RIVER.length - 1, k + 1)];
      const ang = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
      return [x - Math.sin(ang) * (off + Math.sin(now * 0.5 + i) * 6), y + Math.cos(ang) * (off + Math.sin(now * 0.5 + i) * 6)];
    });
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.restore();

  // Elbe-Beschriftung in Weltkoordinaten
  ctx.save();
  ctx.translate(1700, 760);
  ctx.rotate(-0.22);
  ctx.fillStyle = 'rgba(200,226,235,0.42)';
  ctx.font = 'bold 18px "Lucida Console", monospace';
  ctx.fillText('ELBE', 0, 0);
  ctx.restore();
}

function drawStreet(ctx, edge) {
  const pts = edge.pts;
  if (edge.kind !== 'bridge') {
    // dichte Bebauung unter der Straße (Luftbild-Fläche)
    strokePolyline(ctx, pts, 88, '#4c4f47');
  }
  if (edge.kind === 'bridge') {
    strokePolyline(ctx, pts, 22, COL.bridgeEdge);
    strokePolyline(ctx, pts, 17, COL.bridge);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  } else {
    strokePolyline(ctx, pts, 27, '#3f4245');
    strokePolyline(ctx, pts, 21, COL.road);
    // Gehwegkanten
    for (const side of [-1, 1]) strokePolyline(ctx, offsetPts(pts, side * 10.6), 1.2, '#8b8c85');
    ctx.strokeStyle = 'rgba(205,200,180,0.35)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const gauge = 3.3;
  for (const side of [-1, 1]) {
    const rail = offsetPts(pts, side * gauge);
    strokePolyline(ctx, rail, 2.2, '#3f4347');
    strokePolyline(ctx, rail, 0.9, COL.rail);
  }
  // Schwellenandeutung nur außerhalb der Straßenmitte
  ctx.strokeStyle = 'rgba(20,20,18,0.32)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let d = 2; d < edge.len; d += 3.4) {
    const p = edgePoint(edge, edge.a, d);
    const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
    ctx.moveTo(p.x + nx * 4.6, p.y + ny * 4.6);
    ctx.lineTo(p.x - nx * 4.6, p.y - ny * 4.6);
  }
  ctx.stroke();
}

function drawLandmarks(ctx, visible) {
  for (const lm of LANDMARKS) {
    if (!visible(lm.x, lm.y, 40)) continue;
    ctx.save();
    ctx.translate(lm.x, lm.y);
    if (lm.type === 'church') {
      ctx.fillStyle = '#d9cdb0';
      ctx.fillRect(-9, -9, 18, 18);
      ctx.fillStyle = '#7d8f7a';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9cdb0';
      ctx.beginPath();
      ctx.arc(-2, 2, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (lm.type === 'bridge') {
      ctx.strokeStyle = '#4f86c6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-26, -8);
      ctx.quadraticCurveTo(0, -26, 26, -8);
      ctx.stroke();
      ctx.strokeStyle = '#7fb2ea';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-26, -8);
      ctx.lineTo(26, -8);
      ctx.stroke();
      ctx.fillStyle = '#7fb2ea';
      ctx.fillRect(-26, -9, 2, 12);
      ctx.fillRect(24, -9, 2, 12);
    } else if (lm.type === 'opera' || lm.type === 'palace' || lm.type === 'hall') {
      ctx.fillStyle = lm.type === 'hall' ? '#cfc9ba' : '#d9cdb0';
      ctx.fillRect(-11, -8, 22, 16);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-11, 3, 22, 5);
      if (lm.type === 'palace') {
        ctx.fillStyle = '#c4b391';
        ctx.fillRect(-15, -4, 6, 8);
        ctx.fillRect(9, -4, 6, 8);
      }
    } else if (lm.type === 'tower') {
      ctx.fillStyle = '#9aa1a5';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (lm.type === 'factory') {
      ctx.fillStyle = '#a8896b';
      ctx.fillRect(-10, -8, 20, 16);
      ctx.fillStyle = '#8a6d52';
      ctx.fillRect(4, -4, 6, 6);
    }
    ctx.restore();
  }
}

function drawRouteHighlight(ctx, G) {
  const line = G.fullPath || G.path;
  if (!line || !G.line) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Streckenverlauf als Einblendung – die ganze Linie von Anfang an
  ctx.setLineDash([10, 9]);
  for (const pass of [{ c: '#ffffff', w: 6.4, a: 0.5 }, { c: G.line.color, w: 3.2, a: 0.9 }]) {
    ctx.strokeStyle = pass.c;
    ctx.globalAlpha = pass.a;
    ctx.lineWidth = pass.w;
    for (const edge of line.edges) {
      ctx.beginPath();
      edge.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawStopPlatforms(ctx, G, net, visible) {
  const seen = new Set();
  for (const edge of net.edges) {
    for (const end of [edge.b, edge.a]) {
      const node = NODES[end];
      if (!visible(node.x, node.y, 80)) continue;
      const key = edge.id + end;
      if (seen.has(key)) continue;
      seen.add(key);
      const from = end === edge.b ? edge.a : edge.b;
      if (edge.len < 45) continue;
      const s = edge.len - 17;
      const p = edgePoint(edge, from, s);
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      const side = 6.4;
      ctx.save();
      ctx.translate(p.x + nx * side, p.y + ny * side);
      ctx.rotate(p.ang);
      ctx.fillStyle = COL.platformEdge;
      roundRect(ctx, -14, -2.6, 30, 5.2, 0.8);
      ctx.fill();
      ctx.fillStyle = COL.platform;
      roundRect(ctx, -13.4, -2.1, 28.8, 4.2, 0.6);
      ctx.fill();
      ctx.fillStyle = G.route[G.stopIndex + 1] === end ? '#ffd200' : '#6d6a61';
      ctx.fillRect(-13, -0.5, 26, 1.1);
      ctx.restore();
    }
  }
}

function drawWaitingPeople(ctx, G, net, visible) {
  for (const [nodeId, count] of Object.entries(G.waiting || {})) {
    if (count <= 0) continue;
    const node = NODES[nodeId];
    if (!node || !visible(node.x, node.y, 50)) continue;
    const n = Math.min(count, 9);
    for (let i = 0; i < n; i++) {
      const ox = -12 + (i % 5) * 6;
      const oy = -8 - Math.floor(i / 5) * 6;
      const bob = Math.sin((G.animT || 0) * 2.2 + i * 1.7) * 0.5;
      drawPerson(ctx, node.x + ox, node.y + oy + bob, i % 3);
    }
  }
}

function drawPerson(ctx, x, y, variant) {
  const coats = ['#cf5a5a', '#4f6fb5', '#d8b45c', '#6fa06f', '#b06fa6', '#e0e0dc'];
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 1, y - 1, 2.2, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = coats[variant % coats.length];
  ctx.fillRect(x - 1.3, y - 2.4, 2.6, 3.4);
  ctx.fillStyle = '#e8c9a0';
  ctx.beginPath();
  ctx.arc(x, y + 1.6, 1.15, 0, Math.PI * 2);
  ctx.fill();
}

function drawSignals(ctx, G, net, visible) {
  const junctions = new Set();
  for (const [id, deg] of net.degree) if (deg >= 3) junctions.add(id);

  for (const nodeId of junctions) {
    const node = NODES[nodeId];
    if (!visible(node.x, node.y, 70)) continue;
    for (const link of net.adj.get(nodeId)) {
      if (link.edge.len < 70) continue;
      const dist = link.edge.len - 42;
      if (dist < 20) continue;
      const p = edgePoint(link.edge, nodeId, link.edge.len - dist);
      // Signal steht rechts der Fahrtrichtung 42 m vor dem Knoten
      const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      const sx = p.x - nx * 6.5;
      const sy = p.y - ny * 6.5;
      const key = `${nodeId}|${link.edge.id}`;
      const sig = G.signals[key];
      const aspect = sig ? sig.aspect : 'off';
      const isNext = G.nextJunction && G.nextJunction.node === nodeId && G.nextJunction.fromEdge === link.edge.id;
      // Für Hp2: zeigt die Schräge nach links oder rechts?
      let diagonal = 'slash';
      const chosenId = G.switches ? G.switches[nodeId] : null;
      if (chosenId) {
        const ce = net.edges.find(e => e.id === chosenId);
        if (ce) {
          const from = ce.a === nodeId ? ce.a : ce.b;
          const q = edgePoint(ce, from, 12);
          let diff = q.ang - p.ang;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          diagonal = diff > 0 ? 'backslash' : 'slash';
        }
      }
      drawSignalMast(ctx, sx, sy, aspect, isNext, G.animT || 0, diagonal);
    }
  }
}

// Dresdner Fs-Signal: schwarzes Gehäuse mit weißem Balken
// Hp0 waagerecht (—), Hp1 senkrecht (|), Hp2 schräg (/ oder \)
function drawSignalMast(ctx, x, y, aspect, isNext, t, diagonal) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  roundRect(ctx, -2.4, -2.6, 7.2, 7.8, 0.8);
  ctx.fill();
  // Gehäuse
  ctx.fillStyle = '#15171a';
  roundRect(ctx, -3.4, -4.2, 6.8, 7.6, 0.7);
  ctx.fill();
  ctx.strokeStyle = '#767c84';
  ctx.lineWidth = 0.45;
  ctx.stroke();
  // Schirm über dem Signal
  ctx.fillStyle = '#24282d';
  ctx.fillRect(-3.8, -4.9, 7.6, 1.1);
  const lit = aspect === 'red' || aspect === 'hp1' || aspect === 'hp2';
  const rot = aspect === 'hp2' ? (diagonal === 'backslash' ? -0.7 : 0.7) : aspect === 'hp1' ? Math.PI / 2 : 0;
  ctx.save();
  ctx.translate(0, -0.4);
  ctx.rotate(rot);
  if (lit) {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    roundRect(ctx, -2.7, -1.0, 5.4, 2.0, 0.6);
    ctx.fill();
  }
  ctx.fillStyle = lit ? '#f4f7f1' : '#454a51';
  roundRect(ctx, -2.1, -0.55, 4.2, 1.1, 0.35);
  ctx.fill();
  ctx.restore();
  if (isNext) {
    ctx.strokeStyle = 'rgba(255,210,0,0.65)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, -0.4, 6.2 + Math.sin(t * 5) * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSwitch(ctx, G, net) {
  if (!G.nextJunction) return;
  const { node, fromEdge, selectedEdgeId } = G.nextJunction;
  const link = net.adj.get(node).find(l => l.edge.id === selectedEdgeId);
  if (!link) return;
  const n = NODES[node];
  const inEdge = net.edges.find(e => e.id === fromEdge);
  let pIn = { x: n.x, y: n.y };
  if (inEdge) {
    const fromNode = inEdge.a === node ? inEdge.b : inEdge.a;
    pIn = edgePoint(inEdge, fromNode, Math.max(1, inEdge.len - 22));
  }
  const pOut = edgePoint(link.edge, node, Math.min(26, link.edge.len));
  const color = G.switchWrong ? ACCENT_BAD : ACCENT;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  // Gebogener Weichenverlauf: die Bahn biegt sichtbar in die gewählte Richtung ab
  ctx.beginPath();
  ctx.moveTo(pIn.x, pIn.y);
  ctx.quadraticCurveTo(n.x, n.y, pOut.x, pOut.y);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(pOut.x, pOut.y);
  ctx.rotate(Math.atan2(pOut.y - n.y, pOut.x - n.x));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-5, -3);
  ctx.lineTo(-5, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawBlocked(ctx, G, net, visible) {
  for (const [edgeId, info] of Object.entries(G.blocked || {})) {
    const edge = net.edges.find(e => e.id === edgeId);
    if (!edge) continue;
    const p = edgePoint(edge, edge.a, edge.len * 0.5);
    if (!visible(p.x, p.y, 80)) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.ang);
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#d0d0cc';
      ctx.fillRect(-9, side * 6 - 1, 18, 3);
      ctx.fillStyle = '#d33b3b';
      for (let i = 0; i < 4; i++) ctx.fillRect(-9 + i * 4.5, side * 6 - 1, 2.2, 3);
    }
    ctx.fillStyle = '#ffcf3d';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(7, 2);
    ctx.lineTo(-7, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a2410';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, 0);
    ctx.restore();
  }
}

function drawObstacles(ctx, G) {
  for (const ob of G.obstacles || []) {
    if (ob.gone) continue;
    ctx.save();
    ctx.translate(ob.x, ob.y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(1, -1, 4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // kleiner Hund / Person auf dem Gleis
    ctx.fillStyle = '#8a5a3b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d452c';
    ctx.beginPath();
    ctx.arc(2.8, 1.4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawStopTarget(ctx, G, view) {
  if (!G.tram || !G.stopTarget) return;
  const { x, y, ang } = G.stopTarget;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const warn = G.stopDistance < 60 && G.tram.speed > 2;
  ctx.fillStyle = warn ? 'rgba(217,48,37,0.9)' : 'rgba(232,113,10,0.9)';
  ctx.fillRect(-1.3, -8, 2.6, 16);
  ctx.fillStyle = 'rgba(232,113,10,0.15)';
  ctx.fillRect(-4, -8, 8, 16);
  ctx.restore();
}

function drawTram(ctx, G, now) {
  const t = G.tram;
  const p = edgePoint(t.edge, t.from, t.s);
  const veh = VEHICLES[G.line ? G.line.vehicle : 'NGT D8DD'] || VEHICLES['NGT D8DD'];
  const len = Math.min(46, Math.max(30, veh.length * 1.25));
  const half = len / 2;
  const wid = 11.4;

  const ang = t.hdgSmooth != null ? t.hdgSmooth : p.ang;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);

  // Schatten
  ctx.fillStyle = 'rgba(40,40,34,0.32)';
  roundRect(ctx, -half + 1.2, -wid / 2 - 1.2, len, wid, 2.2);
  ctx.fill();

  // Wagenkasten
  const body = '#ffd21a';
  ctx.fillStyle = body;
  roundRect(ctx, -half, -wid / 2, len, wid, 2);
  ctx.fill();
  ctx.strokeStyle = '#5c4a06';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (G.line) {
    ctx.fillStyle = G.line.color;
    ctx.fillRect(-half + 3, -wid / 2, len - 6, 1.1);
    ctx.fillRect(-half + 3, wid / 2 - 1.1, len - 6, 1.1);
  }

  // Dach
  ctx.fillStyle = '#ded9ca';
  roundRect(ctx, -half + 3.4, -wid / 2 + 3.4, len - 6.8, wid - 6.8, 1.2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-half + 4, -wid / 2 + 1.9, len - 8, 0.7);

  // Gelenke und Fenster
  ctx.fillStyle = 'rgba(52,58,64,0.9)';
  const sections = len > 33 ? 3 : 2;
  for (let i = 1; i < sections; i++) {
    ctx.fillRect(-half + (len / sections) * i - 0.9, -wid / 2 + 0.6, 1.8, wid - 1.2);
  }
  ctx.fillStyle = '#3c4752';
  const winW = 2.6;
  for (let i = 0; i < Math.floor((len - 6) / 4.4); i++) {
    ctx.fillRect(-half + 4 + i * 4.4, -wid / 2 + 1.9, winW, 1.4);
    ctx.fillRect(-half + 4 + i * 4.4, wid / 2 - 3.3, winW, 1.4);
  }

  // Türen
  ctx.fillStyle = '#c9c4b4';
  ctx.fillRect(-half + len * 0.28, -wid / 2, 2.2, wid);
  ctx.fillRect(-half + len * 0.62, -wid / 2, 2.2, wid);
  if (G.doors === 'open' || G.doors === 'opening') {
    ctx.fillStyle = 'rgba(255,210,0,0.8)';
    ctx.fillRect(-half + len * 0.28 - 0.4, -wid / 2, 3, wid);
    ctx.fillRect(-half + len * 0.62 - 0.4, -wid / 2, 3, wid);
  }

  // Rollstuhlrampe an der ersten Tür
  if (G.ramp && G.ramp !== 'in') {
    let k = 1;
    if (G.ramp === 'moving') k = Math.min(1, (G.rampT || 0) / 1.1);
    else if (G.ramp === 'retracting') k = Math.max(0, 1 - (G.rampT || 0) / 1.1);
    const dx = -half + len * 0.28 + 0.9;
    ctx.fillStyle = '#d9caa6';
    ctx.fillRect(dx, wid / 2 - 0.3, 5.4, 8.5 * k);
    ctx.fillStyle = '#a89773';
    ctx.fillRect(dx, wid / 2 - 0.3, 5.4, 0.9);
  }

  // Frontscheibe
  ctx.fillStyle = '#2c3a44';
  roundRect(ctx, half - 3.4, -wid / 2 + 1.6, 2.6, wid - 3.2, 0.6);
  ctx.fill();
  // Zielanzeige
  ctx.fillStyle = '#161a1e';
  ctx.fillRect(half - 1.2, -2.2, 1.1, 4.4);

  // Scheinwerfer
  const front = t.speed > 0.2 || G.doors === 'open';
  ctx.fillStyle = front ? '#fff4b0' : '#8c8146';
  ctx.fillRect(half - 0.6, -wid / 2 + 0.9, 0.7, 1.6);
  ctx.fillRect(half - 0.6, wid / 2 - 2.5, 0.7, 1.6);
  ctx.fillStyle = '#e04a4a';
  ctx.fillRect(-half + 0.1, -wid / 2 + 0.9, 0.6, 1.5);
  ctx.fillRect(-half + 0.1, wid / 2 - 2.4, 0.6, 1.5);

  // Stromabnehmer
  const mid = -half + len * 0.22;
  ctx.strokeStyle = '#4a4f57';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(mid - 4, -wid / 4);
  ctx.lineTo(mid, wid / 4);
  ctx.moveTo(mid + 4, -wid / 4);
  ctx.lineTo(mid, wid / 4);
  ctx.moveTo(mid - 3, -wid / 4);
  ctx.lineTo(mid + 3, -wid / 4);
  ctx.stroke();

  // Blinker/Warnblinker beim Türenschließen
  if (G.doors === 'closing') {
    const on = Math.sin(now * 18) > 0;
    if (on) {
      ctx.fillStyle = '#ffd200';
      ctx.fillRect(-half + len * 0.28 - 1.4, -wid / 2 - 0.9, 1.4, 1.4);
      ctx.fillRect(-half + len * 0.62 - 1.4, -wid / 2 - 0.9, 1.4, 1.4);
    }
  }

  ctx.restore();

  // Sprechblasen laufen über DOM.

  if (G.runner) {
    drawPerson(ctx, G.runner.x, G.runner.y, 2);
  }
  if (G.wheelchair) {
    // Rollstuhlfahrer an der ersten Tür
    const doorX = p.x + Math.cos(ang) * (-half + len * 0.3) + Math.sin(ang) * (wid / 2 + 4.5);
    const doorY = p.y + Math.sin(ang) * (-half + len * 0.3) - Math.cos(ang) * (wid / 2 + 4.5);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(doorX + 0.8, doorY - 0.8, 3.4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f74b8';
    ctx.beginPath();
    ctx.arc(doorX, doorY, 2.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#eef5fb';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(doorX, doorY + 0.6, 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(doorX, doorY - 1.6);
    ctx.lineTo(doorX, doorY + 0.6);
    ctx.stroke();
  }
  if (G.bellUntil && now < G.bellUntil) {
    ctx.fillStyle = 'rgba(255,210,0,0.10)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 36, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAiTrams(ctx, G, now) {
  const list = G.aiTrams || [];
  for (const ai of list) {
    if (!ai.pos) continue;
    const ang = ai.ang != null ? ai.ang : 0;
    // Auf dem Gegengleis: leichter Versatz rechts der Fahrtrichtung
    const x = ai.pos.x + Math.sin(ang) * 6.2;
    const y = ai.pos.y - Math.cos(ang) * 6.2;
    const len = 30;
    const wid = 10.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(10,14,12,0.28)';
    roundRect(ctx, -len / 2 + 1, -wid / 2 - 1, len, wid, 2);
    ctx.fill();
    ctx.fillStyle = '#ffd21a';
    roundRect(ctx, -len / 2, -wid / 2, len, wid, 1.8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,48,8,0.9)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    if (ai.color) {
      ctx.fillStyle = ai.color;
      ctx.fillRect(-len / 2 + 2, -wid / 2, len - 4, 1.1);
      ctx.fillRect(-len / 2 + 2, wid / 2 - 1.1, len - 4, 1.1);
    }
    ctx.fillStyle = '#d9d4c6';
    roundRect(ctx, -len / 2 + 3, -wid / 2 + 3, len - 6, wid - 6, 1);
    ctx.fill();
    ctx.fillStyle = '#39434d';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-len / 2 + 4 + i * 4.6, -wid / 2 + 1.7, 2.8, 1.3);
      ctx.fillRect(-len / 2 + 4 + i * 4.6, wid / 2 - 3, 2.8, 1.3);
    }
    ctx.fillStyle = '#2b3943';
    ctx.fillRect(len / 2 - 3.2, -wid / 2 + 1.3, 2.4, wid - 2.6);
    ctx.fillStyle = '#fff3a8';
    ctx.fillRect(len / 2 - 0.9, -wid / 2 + 1, 0.7, 1.4);
    ctx.fillRect(len / 2 - 0.9, wid / 2 - 2.4, 0.7, 1.4);
    ctx.restore();
  }
  // Grüß-Markierung über der nächsten Bahn
  const near = G.nearestTram && G.nearestTram.ai;
  if (near && near.pos) {
    const ang = near.ang != null ? near.ang : 0;
    const x = near.pos.x + Math.sin(ang) * 6.2;
    const y = near.pos.y - Math.cos(ang) * 6.2;
    ctx.save();
    ctx.strokeStyle = 'rgba(92,255,151,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 13 + Math.sin((now || 0) * 4) * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawWorldLabels(ctx, G, net, view) {
  const { w, h } = view;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const k = Math.max(0.66, view.zoom / 1.15);
  const fs = base => Math.max(4, Math.round(base * k));

  // Stadtteile
  ctx.font = `bold ${fs(11)}px "Lucida Console", monospace`;
  ctx.fillStyle = 'rgba(232,238,228,0.30)';
  for (const d of DISTRICT_LABELS) {
    const s = worldToScreen(view, d.x, d.y);
    if (s.x < -60 || s.x > w + 60 || s.y < -20 || s.y > h + 20) continue;
    ctx.fillText(d.text, s.x, s.y);
  }

  // Haltestellennamen
  const nextStopId = G.stopIndex + 1 < G.route.length ? G.route[G.stopIndex + 1] : null;
  for (const id of Object.keys(NODES)) {
    const n = NODES[id];
    const s = worldToScreen(view, n.x, n.y);
    if (s.x < -80 || s.x > w + 80 || s.y < -30 || s.y > h + 30) continue;
    const isNext = id === nextStopId;
    const isMajor = n.major;
    if (!isNext && !isMajor) continue;
    if (!isNext && view.zoom < view.zoomBase * 0.9) continue;
    const size = fs(isNext ? 7 : 6);
    ctx.font = isNext ? `bold ${size}px "Lucida Console", monospace` : `${size}px "Lucida Console", monospace`;
    const label = n.name;
    // weiße Schrift mit dunkler Kontur – wie eine Einblendung im Luftbild
    const ty = s.y - Math.max(7, size + 3);
    ctx.lineWidth = Math.max(1.8, size * 0.5);
    ctx.strokeStyle = 'rgba(12,16,12,0.85)';
    ctx.strokeText(label, s.x, ty);
    ctx.fillStyle = isNext ? '#ffd200' : '#f2f4ef';
    ctx.fillText(label, s.x, ty);
  }

  // Landmarken
  for (const lm of LANDMARKS) {
    const s = worldToScreen(view, lm.x, lm.y);
    if (s.x < 10 || s.x > w - 10 || s.y < 10 || s.y > h - 10) continue;
    const size = fs(6);
    ctx.font = `${size}px "Lucida Console", monospace`;
    ctx.fillStyle = 'rgba(240,244,236,0.85)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = Math.max(1.6, size * 0.45);
    ctx.strokeStyle = 'rgba(12,16,12,0.8)';
    ctx.strokeText(lm.label, s.x, s.y - 6);
    ctx.fillStyle = 'rgba(240,244,236,0.9)';
    ctx.fillText(lm.label, s.x, s.y - 6);
  }

  // Weichenname am Zielknoten
  if (G.nextJunction && G.nextJunction.dist < 170) {
    const n = NODES[G.nextJunction.node];
    const s = worldToScreen(view, n.x, n.y);
    ctx.font = `bold ${fs(7)}px "Lucida Console", monospace`;
    const txt = G.switchWrong ? 'WEICHE FALSCH!' : 'WEICHE';
    const ty = s.y + Math.max(14, Math.round(14 * k));
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(10,12,10,0.85)';
    ctx.strokeText(txt, s.x, ty);
    ctx.fillStyle = G.switchWrong ? ACCENT_BAD : ACCENT;
    ctx.fillText(txt, s.x, ty);
  }
}

export function drawMinimap(ctx, G, net, w, h) {
  const d = getDecor();
  if (!d) return;
  const b = d.bounds;
  const pad = 8;
  const scale = Math.min((w - pad * 2) / (b.maxX - b.minX), (h - pad * 2) / (b.maxY - b.minY));
  const ox = (w - (b.maxX - b.minX) * scale) / 2;
  const oy = (h - (b.maxY - b.minY) * scale) / 2;
  const px = x => ox + (x - b.minX) * scale;
  const py = y => h - oy - (y - b.minY) * scale;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#1a2118';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#5e6d59';
  ctx.lineWidth = 1;
  for (const e of net.edges) {
    ctx.beginPath();
    e.pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
    ctx.stroke();
  }
  if (G.path) {
    ctx.strokeStyle = G.line ? G.line.color : '#ffd200';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const e of G.path.edges) {
      e.pts.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
    }
    ctx.stroke();
  }
  for (const [id, info] of Object.entries(G.blocked || {})) {
    const e = net.edges.find(x => x.id === id);
    if (!e) continue;
    const p = edgePoint(e, e.a, e.len / 2);
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(px(p.x) - 2, py(p.y) - 2, 4, 4);
  }
  for (const id of G.route || []) {
    const n = NODES[id];
    ctx.fillStyle = n.terminal ? '#ffd200' : '#9aa0a6';
    ctx.beginPath();
    ctx.arc(px(n.x), py(n.y), n.terminal ? 2.2 : 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const ai of G.aiTrams || []) {
    if (!ai.pos) continue;
    ctx.fillStyle = ai.color || '#c9d3dc';
    ctx.fillRect(px(ai.pos.x) - 1, py(ai.pos.y) - 1, 2, 2);
  }
  if (G.tram) {
    const p = edgePoint(G.tram.edge, G.tram.from, G.tram.s);
    ctx.fillStyle = '#ffd21a';
    ctx.beginPath();
    ctx.arc(px(p.x), py(p.y), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f1215';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.strokeStyle = '#3a444e';
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}
