export function buildKeplerDatasets(territories, microareas, families, patients = []) {
  const datasets = [];

  const territoryFeatures = territories.filter(t => t.polygon).map(t => ({
    type: 'Feature', geometry: t.polygon,
    properties: {id: t.id, nome: t.name, codigo: t.code, ubs: t.ubsName || '', cnes: t.cnes || ''}
  }));
  if (territoryFeatures.length > 0) {
    datasets.push({info: {id: 'territories', label: 'Territórios'}, data: {type: 'FeatureCollection', features: territoryFeatures}});
  }

  const microareaFeatures = microareas.filter(m => m.polygon).map(m => {
    const territory = territories.find(t => t.id === m.territoryId);
    return {type: 'Feature', geometry: m.polygon, properties: {id: m.id, nome: m.name, codigo: m.code, territorio: territory ? territory.name : ''}};
  });
  if (microareaFeatures.length > 0) {
    datasets.push({info: {id: 'microareas', label: 'Microáreas'}, data: {type: 'FeatureCollection', features: microareaFeatures}});
  }

  const familyFeatures = families.filter(f => f.lat != null && f.lng != null).map(f => ({
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [parseFloat(f.lng), parseFloat(f.lat)]},
    properties: {id: f.id, responsavel: f.responsibleName || '', endereco: f.address || '', membros: f.memberCount || 1, vulnerabilidade: f.socialVulnerability || 'baixa', ultima_visita: f.lastVisit || ''}
  }));
  if (familyFeatures.length > 0) {
    datasets.push({info: {id: 'families', label: 'Famílias'}, data: {type: 'FeatureCollection', features: familyFeatures}});
  }

  // Patients dataset: one row per patient with lat/lng for kepler.gl point layer
  const patientRows = [];
  patients.forEach(p => {
    const family = families.find(f => f.id === p.familyId);
    const rawLat = p.lat ?? family?.lat;
    const rawLng = p.lng ?? family?.lng;
    if (rawLat == null || rawLng == null) return;
    // small random offset so family members don't stack exactly
    const jitter = () => (Math.random() - 0.5) * 0.0003;
    const lat = parseFloat(rawLat) + (p.lat == null ? jitter() : 0);
    const lng = parseFloat(rawLng) + (p.lng == null ? jitter() : 0);
    const microarea = microareas.find(m => m.id === (p.microareaId || family?.microareaId));
    patientRows.push([
      lat, lng,
      p.name || '',
      p.conditions && p.conditions.length > 0 ? p.conditions[0] : 'outro',
      p.conditions ? p.conditions.join(', ') : '',
      p.gender || '',
      p.birthdate || '',
      microarea ? microarea.name : '',
      family ? (family.responsibleName || '') : ''
    ]);
  });

  if (patientRows.length > 0) {
    datasets.push({
      info: {id: 'patients', label: 'Pacientes'},
      data: {
        fields: [
          {name: 'lat', type: 'real'},
          {name: 'lng', type: 'real'},
          {name: 'nome', type: 'string'},
          {name: 'condicao_principal', type: 'string'},
          {name: 'todas_condicoes', type: 'string'},
          {name: 'sexo', type: 'string'},
          {name: 'nascimento', type: 'timestamp'},
          {name: 'microarea', type: 'string'},
          {name: 'familia', type: 'string'}
        ],
        rows: patientRows
      }
    });
  }

  return datasets;
}
