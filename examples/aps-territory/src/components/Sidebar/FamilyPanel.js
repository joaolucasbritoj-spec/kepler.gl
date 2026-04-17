import React, {useState} from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';
import {deleteFamily} from '../../app-reducer';
import FamilyModal from '../modals/FamilyModal';
import ImportModal from '../modals/ImportModal';
import {exportCSV} from '../../services/storage';

const Panel = styled.div``;
const Header = styled.div`padding: 12px 16px; border-bottom: 1px solid #f0f0f0;`;
const TitleRow = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;`;
const SectionTitle = styled.h3`margin: 0; font-size: 13px; font-weight: 600; color: #333;`;
const ButtonGroup = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const BtnPrimary = styled.button`padding: 6px 10px; background: #1a5e35; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; &:hover { background: #155029; }`;
const BtnSecondary = styled.button`padding: 6px 10px; background: transparent; color: #1a5e35; border: 1px solid #1a5e35; border-radius: 4px; font-size: 12px; cursor: pointer; &:hover { background: #f0f7f3; }`;
const FilterRow = styled.div`display: flex; gap: 8px;`;
const Select = styled.select`flex: 1; padding: 5px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; background: white;`;
const EmptyState = styled.div`padding: 32px 16px; text-align: center; color: #999; font-size: 13px;`;
const FamilyItem = styled.div`display: flex; align-items: flex-start; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; gap: 8px; &:hover { background: #fafafa; }`;
const FamilyInfo = styled.div`flex: 1;`;
const FamilyName = styled.div`font-size: 13px; font-weight: 500; color: #333;`;
const FamilyMeta = styled.div`font-size: 11px; color: #888; margin-top: 2px;`;
const VulnBadge = styled.span`
  padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 500;
  background: ${p => p.$v === 'alta' ? '#ffebee' : p.$v === 'media' ? '#fff3e0' : '#e8f5e9'};
  color: ${p => p.$v === 'alta' ? '#c62828' : p.$v === 'media' ? '#e65100' : '#2e7d32'};
`;
const BtnSmall = styled.button`padding: 3px 8px; font-size: 11px; border-radius: 3px; cursor: pointer; border: 1px solid;`;
const BtnGhost = styled(BtnSmall)`background: transparent; border-color: #ccc; color: #555; &:hover { background: #f5f5f5; }`;
const BtnDanger = styled(BtnSmall)`background: transparent; border-color: #ffcdd2; color: #c62828; &:hover { background: #ffebee; }`;

const VULN_LABELS = {baixa: 'Baixa', media: 'Média', alta: 'Alta'};

function FamilyPanel() {
  const dispatch = useDispatch();
  const {families, microareas, territories} = useSelector(state => state.app);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState({microareaId: '', vulnerability: ''});

  const filtered = families.filter(f => {
    if (filter.microareaId && f.microareaId !== filter.microareaId) return false;
    if (filter.vulnerability && f.socialVulnerability !== filter.vulnerability) return false;
    return true;
  });

  function microareaLabel(maId) {
    const ma = microareas.find(m => m.id === maId);
    if (!ma) return '—';
    const t = territories.find(t => t.id === ma.territoryId);
    return t ? `${t.name} / ${ma.name}` : ma.name;
  }

  function handleExport() {
    const csv = exportCSV(families);
    const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'familias-aps.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel>
      <Header>
        <TitleRow>
          <SectionTitle>Famílias ({filtered.length}/{families.length})</SectionTitle>
          <ButtonGroup>
            <BtnSecondary onClick={() => setModal({type: 'import'})}>↑ Importar</BtnSecondary>
            <BtnSecondary onClick={handleExport}>↓ CSV</BtnSecondary>
            <BtnPrimary onClick={() => setModal({type: 'family', family: null})}>+ Nova</BtnPrimary>
          </ButtonGroup>
        </TitleRow>
        <FilterRow>
          <Select value={filter.microareaId} onChange={e => setFilter(p => ({...p, microareaId: e.target.value}))}>
            <option value="">Todas microáreas</option>
            {microareas.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <Select value={filter.vulnerability} onChange={e => setFilter(p => ({...p, vulnerability: e.target.value}))}>
            <option value="">Todas vulnerab.</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </Select>
        </FilterRow>
      </Header>

      {filtered.length === 0 && <EmptyState>Nenhuma família encontrada.</EmptyState>}

      {filtered.map(f => (
        <FamilyItem key={f.id}>
          <FamilyInfo>
            <FamilyName>{f.responsibleName}</FamilyName>
            <FamilyMeta>{f.address || '—'}</FamilyMeta>
            <FamilyMeta>{microareaLabel(f.microareaId)} • {f.memberCount} membro(s)</FamilyMeta>
            {f.lastVisit && <FamilyMeta>Última visita: {f.lastVisit}</FamilyMeta>}
          </FamilyInfo>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
            <VulnBadge $v={f.socialVulnerability}>{VULN_LABELS[f.socialVulnerability]}</VulnBadge>
            <div style={{display:'flex', gap:'4px'}}>
              <BtnGhost onClick={() => setModal({type: 'family', family: f})}>✎</BtnGhost>
              <BtnDanger onClick={() => {
                if (window.confirm(`Excluir família "${f.responsibleName}"?`)) dispatch(deleteFamily(f.id));
              }}>✕</BtnDanger>
            </div>
          </div>
        </FamilyItem>
      ))}

      {modal?.type === 'family' && <FamilyModal family={modal.family} onClose={() => setModal(null)} />}
      {modal?.type === 'import' && <ImportModal onClose={() => setModal(null)} />}
    </Panel>
  );
}

export default FamilyPanel;
