/**
 * 강원특별자치도 18개 시·군 SVG path 데이터 생성 스크립트.
 *
 * 원본: southkorea/southkorea-maps 저장소의 통계청(KOSTAT) 2013년 시·군·구 경계 TopoJSON
 *   https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_topo.json
 * (강원도 시·군 단위 행정구역은 2013년 이후 변경되지 않았습니다.)
 *
 * 처리 과정
 * 1. 행정구역 코드가 32로 시작하는 강원도 시·군만 추출
 * 2. TopoJSON arc 단위로 Douglas-Peucker 단순화 → 이웃 시·군이 같은 경계선을 공유하므로 틈·겹침이 생기지 않음
 * 3. 위도 37.75° 기준 등장방형(경도에 cos 보정) 투영 후 SVG 좌표로 변환
 * 4. 면적이 매우 작은 부속 섬(지도 크기에서 보이지 않는 수준)만 제외
 * 5. 각 시·군 내부에서 경계로부터 가장 먼 지점(이름표 위치)을 계산
 *
 * 사용법: node scripts/build-gangwon-map.mjs <topojson 파일 경로>
 * 결과: src/data/gangwonGeo.ts 를 덮어씁니다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SOURCE_URL =
  'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_topo.json';
const VIEW_WIDTH = 600;
const PADDING = 8;
/** 단순화 허용 오차(도 단위, 약 110m) */
const SIMPLIFY_TOLERANCE = 0.001;
/** 이보다 작은 폴리곤(SVG 좌표 면적)은 제외 */
const MIN_RING_AREA = 6;

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(`사용법: node scripts/build-gangwon-map.mjs <topojson 파일>\n원본: ${SOURCE_URL}`);
  process.exit(1);
}

const topo = JSON.parse(readFileSync(inputPath, 'utf8'));
const object = Object.values(topo.objects)[0];

// --- TopoJSON arc 디코딩 ---
const decodeArc = (arc) => {
  if (!topo.transform) return arc.map(([x, y]) => [x, y]);
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
};

// --- Douglas-Peucker ---
const perpendicularDistance = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const simplify = (points, tolerance) => {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[start], points[end]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (index !== -1 && maxDist > tolerance) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, i) => keep[i]);
};

const gangwon = object.geometries.filter((g) => String(g.properties.code).startsWith('32'));
if (gangwon.length !== 18) throw new Error(`강원도 시·군이 18개가 아닙니다: ${gangwon.length}`);

const arcCache = new Map();
const getArc = (index) => {
  const real = index < 0 ? ~index : index;
  if (!arcCache.has(real)) arcCache.set(real, simplify(decodeArc(topo.arcs[real]), SIMPLIFY_TOLERANCE));
  const arc = arcCache.get(real);
  return index < 0 ? [...arc].reverse() : arc;
};

const ringFromArcs = (arcIndexes) => {
  const ring = [];
  arcIndexes.forEach((index, i) => {
    const arc = getArc(index);
    ring.push(...(i === 0 ? arc : arc.slice(1)));
  });
  return ring;
};

// polygon: [outerRing, ...holes]
const toPolygons = (geometry) =>
  geometry.type === 'Polygon'
    ? [geometry.arcs.map(ringFromArcs)]
    : geometry.arcs.map((polygon) => polygon.map(ringFromArcs));

const regions = gangwon.map((g) => ({ code: String(g.properties.code), name: g.properties.name, polygons: toPolygons(g) }));

// --- 투영 ---
const LAT0 = 37.75;
const cosLat = Math.cos((LAT0 * Math.PI) / 180);
const allPoints = regions.flatMap((r) => r.polygons.flat(2));
const minLon = Math.min(...allPoints.map((p) => p[0]));
const maxLon = Math.max(...allPoints.map((p) => p[0]));
const minLat = Math.min(...allPoints.map((p) => p[1]));
const maxLat = Math.max(...allPoints.map((p) => p[1]));
const scale = (VIEW_WIDTH - PADDING * 2) / ((maxLon - minLon) * cosLat);
const VIEW_HEIGHT = Math.ceil((maxLat - minLat) * scale + PADDING * 2);
const project = ([lon, lat]) => [PADDING + (lon - minLon) * cosLat * scale, PADDING + (maxLat - lat) * scale];

const ringArea = (ring) => {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(area / 2);
};

const fmt = (n) => Number(n.toFixed(1));

// --- 이름표 위치: 내부 격자 탐색으로 경계에서 가장 먼 점 ---
const pointInRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const pointInPolygon = (p, polygon) => pointInRing(p, polygon[0]) && !polygon.slice(1).some((h) => pointInRing(p, h));
const distanceToEdges = (p, polygon) => {
  let min = Infinity;
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      min = Math.min(min, perpendicularDistance(p, ring[j], ring[i]));
    }
  }
  return min;
};
const labelPoint = (polygon) => {
  const xs = polygon[0].map((p) => p[0]);
  const ys = polygon[0].map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let best = null;
  const step = Math.max((x1 - x0) / 60, (y1 - y0) / 60, 0.5);
  for (let x = x0; x <= x1; x += step) {
    for (let y = y0; y <= y1; y += step) {
      if (!pointInPolygon([x, y], polygon)) continue;
      const d = distanceToEdges([x, y], polygon);
      if (!best || d > best.d) best = { x, y, d };
    }
  }
  return best;
};

const output = regions.map((region) => {
  const projected = region.polygons
    .map((polygon) => polygon.map((ring) => ring.map(project)))
    .filter((polygon) => ringArea(polygon[0]) >= MIN_RING_AREA);
  const d = projected
    .flatMap((polygon) =>
      polygon.map((ring) => `M${ring.slice(0, -1).map(([x, y]) => `${fmt(x)},${fmt(y)}`).join('L')}Z`),
    )
    .join('');
  const main = projected.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
  const label = labelPoint(main);
  return { code: region.code, name: region.name, d, label: [fmt(label.x), fmt(label.y)] };
});

output.sort((a, b) => a.code.localeCompare(b.code));

const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/gangwonGeo.ts');
const body = `/**
 * 강원특별자치도 18개 시·군 경계 SVG path 데이터 (자동 생성 파일 — 직접 수정하지 마세요).
 *
 * 원본: 통계청(KOSTAT) 2013년 시·군·구 경계 (southkorea/southkorea-maps 저장소 TopoJSON)
 *   ${SOURCE_URL}
 * 생성: node scripts/build-gangwon-map.mjs <topojson 파일>
 *
 * 공유 경계선(arc) 단위로 단순화했기 때문에 이웃 시·군 사이에 틈이 없으며,
 * 지도 크기에서 보이지 않는 아주 작은 부속 섬만 제외했습니다.
 * label은 각 시·군 내부에서 경계로부터 가장 먼 지점(이름표 기본 위치)입니다.
 */

export interface GangwonGeoFeature {
  /** 통계청 행정구역 코드(2013) */
  code: string;
  /** 시·군 이름 */
  name: string;
  /** SVG path d 속성 */
  d: string;
  /** 이름표 기본 위치 [x, y] (viewBox 좌표) */
  label: [number, number];
}

export const GANGWON_VIEWBOX = { width: ${VIEW_WIDTH}, height: ${VIEW_HEIGHT} } as const;

export const GANGWON_GEO: GangwonGeoFeature[] = ${JSON.stringify(output, null, 2).replace(/"(code|name|d|label)":/g, '$1:').replace(/\[\n\s+([\d.]+),\n\s+([\d.]+)\n\s+\]/g, '[$1, $2]')};
`;
writeFileSync(outPath, body.replace(/"/g, "'"));
console.log(`viewBox ${VIEW_WIDTH}x${VIEW_HEIGHT}, ${output.length}개 시·군, ${(body.length / 1024).toFixed(1)}KB → ${outPath}`);
for (const r of output) console.log(r.code, r.name, r.d.length, r.label);
