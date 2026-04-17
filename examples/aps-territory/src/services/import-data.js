export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  if (lines.length < 2) return {headers: [], rows: []};
  const delimiter = (text.split(';').length > text.split(',').length) ? ';' : ',';
  const headers = splitCSVLine(lines[0], delimiter).map(h => h.trim());
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const values = splitCSVLine(line, delimiter);
    return headers.reduce((obj, h, i) => ({...obj, [h]: (values[i] || '').trim()}), {});
  });
  return {headers, rows};
}

function splitCSVLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseXML(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const root = doc.documentElement;
  const records = Array.from(root.children);
  if (records.length === 0) return {headers: [], rows: []};
  const headers = Array.from(records[0].children).map(el => el.tagName);
  const rows = records.map(record =>
    headers.reduce((obj, tag) => {
      const el = record.querySelector(tag);
      return {...obj, [tag]: el ? el.textContent : ''};
    }, {})
  );
  return {headers, rows};
}

export async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {headers: {'Accept-Language': 'pt-BR,pt;q=0.9', 'User-Agent': 'APS-Territory/1.0'}});
    const data = await res.json();
    if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch {
    return null;
  }
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(point, polygon) {
  if (!polygon || !point) return false;
  const [lng, lat] = point;
  if (polygon.type === 'Polygon') return pointInRing([lng, lat], polygon.coordinates[0]);
  if (polygon.type === 'MultiPolygon') return polygon.coordinates.some(poly => pointInRing([lng, lat], poly[0]));
  return false;
}

export function assignFamiliesToTerritories(families, territories, microareas) {
  return families.map(f => {
    if (f.lat == null || f.lng == null) return f;
    const point = [parseFloat(f.lng), parseFloat(f.lat)];
    const microarea = microareas.find(m => m.polygon && pointInPolygon(point, m.polygon));
    if (microarea) return {...f, microareaId: microarea.id};
    return f;
  });
}

export async function geocodeBatch(rows, addressCol, onProgress) {
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const address = rows[i][addressCol];
    const coords = address ? await geocodeAddress(address) : null;
    results.push({...rows[i], _lat: coords ? coords[0] : null, _lng: coords ? coords[1] : null, _geocoded: coords != null});
    if (onProgress) onProgress(i + 1, rows.length);
    if (i < rows.length - 1) await new Promise(r => setTimeout(r, 1100));
  }
  return results;
}
