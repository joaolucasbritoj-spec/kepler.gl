export function buildKeplerDatasets(territories, microareas, families) {
  const datasets = [];

  const territoryFeatures = territories
    .filter(t => t.polygon)
    .map(t => ({
      type: 'Feature',
      geometry: t.polygon,
      properties: {id: t.id, nome: t.name, codigo: t.code, ubs: t.ubsName || '', cnes: t.cnes || ''}
    }));

  if (territoryFeatures.length > 0) {
    datasets.push({
      info: {id: 'territories', label: 'Territórios'},
      data: {type: 'FeatureCollection', features: territoryFeatures}
    });
  }

  const microareaFeatures = microareas
    .filter(m => m.polygon)
    .map(m => {
      const territory = territories.find(t => t.id === m.territoryId);
      return {
        type: 'Feature',
        geometry: m.polygon,
        properties: {id: m.id, nome: m.name, codigo: m.code, territorio: territory ? territory.name : ''}
      };
    });

  if (microareaFeatures.length > 0) {
    datasets.push({
      info: {id: 'microareas', label: 'Microáreas'},
      data: {type: 'FeatureCollection', features: microareaFeatures}
    });
  }

  const familyFeatures = families
    .filter(f => f.lat != null && f.lng != null)
    .map(f => ({
      type: 'Feature',
      geometry: {type: 'Point', coordinates: [parseFloat(f.lng), parseFloat(f.lat)]},
      properties: {
        id: f.id,
        responsavel: f.responsibleName || '',
        endereco: f.address || '',
        membros: f.memberCount || 1,
        vulnerabilidade: f.socialVulnerability || 'baixa',
        ultima_visita: f.lastVisit || ''
      }
    }));

  if (familyFeatures.length > 0) {
    datasets.push({
      info: {id: 'families', label: 'Famílias'},
      data: {type: 'FeatureCollection', features: familyFeatures}
    });
  }

  return datasets;
}
