import { NODES, EDGES, RIVER, RIVER_WIDTH } from './data.js';

export function buildNetwork() {
  const adj = new Map();
  for (const id of Object.keys(NODES)) adj.set(id, []);
  const edges = [];

  EDGES.forEach((def, index) => {
    const a = NODES[def.a], b = NODES[def.b];
    const pts = [[a.x, a.y], ...(def.pts || []), [b.x, b.y]];
    const segs = [];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const l = Math.hypot(x1 - x0, y1 - y0);
      segs.push({ x0, y0, x1, y1, len: l, ang: Math.atan2(y1 - y0, x1 - x0) });
      len += l;
    }
    const edge = {
      id: `${def.a}~${def.b}~${index}`,
      index,
      a: def.a,
      b: def.b,
      pts,
      segs,
      len,
      vmax: def.vmax || (def.kind === 'bridge' ? 40 : 50),
      kind: def.kind || 'street',
    };
    edges.push(edge);
    adj.get(def.a).push({ edge, to: def.b, from: def.a });
    adj.get(def.b).push({ edge, to: def.a, from: def.b });
  });

  const degree = new Map();
  for (const [id, list] of adj) degree.set(id, new Set(list.map(e => e.edge.id)).size);

  return { edges, adj, degree };
}

export function edgePoint(edge, fromId, s) {
  let pts = edge.pts;
  if (fromId === edge.b) pts = [...edge.pts].reverse();
  let rest = Math.max(0, Math.min(edge.len, s));
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const l = Math.hypot(x1 - x0, y1 - y0);
    if (rest <= l || i === pts.length - 1) {
      const t = l > 0 ? Math.max(0, Math.min(1, rest / l)) : 0;
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, ang: Math.atan2(y1 - y0, x1 - x0) };
    }
    rest -= l;
  }
  return { x: pts[0][0], y: pts[0][1], ang: 0 };
}

export function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function findPath(net, start, goal, opts = {}) {
  const blocked = opts.blocked || new Set();
  const prefer = opts.prefer || new Set();
  if (start === goal) return { nodes: [start], edges: [], dist: 0 };
  const dist = new Map([[start, 0]]);
  const prev = new Map();
  const done = new Set();
  const queue = [[0, start]];

  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u] = queue.shift();
    if (done.has(u)) continue;
    done.add(u);
    if (u === goal) break;
    for (const link of net.adj.get(u) || []) {
      if (blocked.has(link.edge.id) || done.has(link.to)) continue;
      const weight = link.edge.len * (prefer.has(link.edge.id) ? 1 : 2.6) + 1;
      const nd = d + weight;
      if (!dist.has(link.to) || nd < dist.get(link.to)) {
        dist.set(link.to, nd);
        prev.set(link.to, { u, edge: link.edge });
        queue.push([nd, link.to]);
      }
    }
  }
  if (!dist.has(goal)) return null;
  const nodes = [goal];
  const edges = [];
  let cur = goal;
  let guard = 0;
  while (cur !== start && guard++ < 500) {
    const p = prev.get(cur);
    if (!p) return null;
    edges.unshift(p.edge);
    nodes.unshift(p.u);
    cur = p.u;
  }
  return { nodes, edges, dist: dist.get(goal) };
}

export function edgeBetween(net, a, b) {
  return (net.adj.get(a) || []).find(l => l.to === b) || null;
}

export function riverDistance(x, y) {
  let best = Infinity;
  for (let i = 1; i < RIVER.length; i++) {
    const [x0, y0] = RIVER[i - 1];
    const [x1, y1] = RIVER[i];
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((x - x0) * dx + (y - y0) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const px = x0 + dx * t, py = y0 + dy * t;
    best = Math.min(best, Math.hypot(x - px, y - py));
  }
  return best - RIVER_WIDTH / 2;
}

