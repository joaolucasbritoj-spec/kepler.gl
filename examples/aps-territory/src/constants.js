export const CONDITIONS = [
  {id: 'hipertensao',  label: 'Hipertensão',           color: '#E53935', emoji: '🔴'},
  {id: 'diabetes',     label: 'Diabetes',               color: '#FB8C00', emoji: '🟠'},
  {id: 'gestante',     label: 'Gestante',               color: '#E91E63', emoji: '💛'},
  {id: 'crianca',      label: 'Criança (<6 anos)',     color: '#42A5F5', emoji: '🔵'},
  {id: 'idoso',        label: 'Idoso (≥60 anos)',      color: '#7B1FA2', emoji: '🟣'},
  {id: 'saude_mental', label: 'Saúde Mental',          color: '#FDD835', emoji: '🟡'},
  {id: 'tuberculose',  label: 'Tuberculose',            color: '#8D6E63', emoji: '🟤'},
  {id: 'hanseniase',   label: 'Hanseníase',            color: '#607D8B', emoji: '⚪'},
  {id: 'tabagismo',    label: 'Tabagismo',              color: '#546E7A', emoji: '⚫'},
  {id: 'deficiencia',  label: 'Deficiência',           color: '#009688', emoji: '🟢'},
  {id: 'acamado',      label: 'Acamado/Domiciliado',   color: '#795548', emoji: '🟤'},
  {id: 'outro',        label: 'Outro',                  color: '#9E9E9E', emoji: '⚪'}
];

export const CONDITIONS_MAP = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));
