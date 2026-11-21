import fs from 'node:fs';
import { NODES } from '../../js/data.js';

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const raw = JSON.parse(fs.readFileSync(new URL('./stops_raw.json', import.meta.url)));
const groups = new Map();
for (const el of raw.elements) {
  const name = el.tags && el.tags.name;
  if (!name) continue;
  const key = norm(name);
  if (!groups.has(key)) groups.set(key, { name, lat: 0, lon: 0, n: 0, names: new Set() });
  const g = groups.get(key);
  g.lat += el.lat; g.lon += el.lon; g.n++;
  g.names.add(name);
}
for (const g of groups.values()) { g.lat /= g.n; g.lon /= g.n; }

const keys = [...groups.keys()];
const used = new Set();
const out = [];
const missing = [];

for (const [id, n] of Object.entries(NODES)) {
  const q = norm(n.name);
  let hit = null;
  // 1) exakt
  if (groups.has(q)) hit = groups.get(q);
  // 2) OSM-Name beginnt mit unserem Namen oder umgekehrt
  if (!hit) {
    const cand = keys.filter((k) => !used.has(k) && (k.startsWith(q + ' ') || q.startsWith(k + ' ')));
    if (cand.length) hit = groups.get(cand[0]);
  }
  // 3) Teilstring
  if (!hit) {
    const cand = keys.filter((k) => !used.has(k) && (q.length > 5 && k.includes(q)));
    if (cand.length) hit = groups.get(cand[0]);
  }
  if (hit) {
    used.add([...groups.entries()].find(([, g]) => g === hit)[0]);
    out.push({ id, name: n.name, osm: [...hit.names][0], lat: hit.lat, lon: hit.lon, n: hit.n });
  } else {
    missing.push({ id, name: n.name, x: n.x, y: n.y });
  }
}

console.log(`matched ${out.length} / ${Object.keys(NODES).length}`);
for (const m of out) console.log(`  ok  ${m.id.padEnd(18)} ${m.name.padEnd(28)} -> ${m.osm}`);
console.log('\nNICHT GEFUNDEN:');
for (const m of missing) console.log(`  ??  ${m.id.padEnd(18)} ${m.name}`);

fs.writeFileSync(new URL('./stops_matched.json', import.meta.url), JSON.stringify({ matched: out, missing }, null, 2));
