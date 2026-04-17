const STORAGE_KEY = 'aps-territory-v1';

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Falha ao salvar estado:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function exportGeoJSON(territories, microareas) {
  const features = [];
  territories.forEach(t => {
    if (t.polygon) {
      features.push({
        type: 'Feature',
        geometry: t.polygon,
        properties: {id: t.id, nome: t.name, codigo: t.code, tipo: 'territorio', cor: t.color, ubs: t.ubsName, cnes: t.cnes}
      });
    }
  });
  microareas.forEach(m => {
    if (m.polygon) {
      features.push({
        type: 'Feature',
        geometry: m.polygon,
        properties: {id: m.id, nome: m.name, codigo: m.code, tipo: 'microarea', territorioId: m.territoryId}
      });
    }
  });
  return JSON.stringify({type: 'FeatureCollection', features}, null, 2);
}

export function exportCSV(families) {
  const headers = ['prontuario', 'responsibleName', 'address', 'memberCount', 'socialVulnerability', 'lastVisit', 'lat', 'lng'];
  const escape = v => `"${(v || '').toString().replace(/"/g, '""')}"`;
  const rows = families.map(f => headers.map(h => escape(f[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}
