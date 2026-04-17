import React, {useState} from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';
import {deletePatient} from '../../app-reducer';
import {CONDITIONS, CONDITIONS_MAP} from '../../constants';
import PatientModal from '../modals/PatientModal';

const Panel = styled.div``;
const Header = styled.div`padding: 12px 16px; border-bottom: 1px solid #f0f0f0;`;
const TitleRow = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;`;
const SectionTitle = styled.h3`margin: 0; font-size: 13px; font-weight: 600; color: #333;`;
const BtnPrimary = styled.button`padding: 6px 12px; background: #1a5e35; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; &:hover { background: #155029; }`;
const FilterRow = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const Select = styled.select`flex: 1; min-width: 90px; padding: 5px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; background: white;`;
const EmptyState = styled.div`padding: 32px 16px; text-align: center; color: #999; font-size: 13px;`;
const PatientItem = styled.div`display: flex; align-items: flex-start; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; gap: 8px; &:hover { background: #fafafa; }`;
const CondIcon = styled.span`font-size: 18px; flex-shrink: 0; line-height: 1;`;
const Info = styled.div`flex: 1;`;
const PatientName = styled.div`font-size: 13px; font-weight: 500; color: #333;`;
const PatientMeta = styled.div`font-size: 11px; color: #888; margin-top: 2px;`;
const CondTags = styled.div`display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;`;
const CondTag = styled.span`
  padding: 1px 7px; border-radius: 10px; font-size: 10px; font-weight: 500;
  background: ${p => p.color}22; color: ${p => p.color}; border: 1px solid ${p => p.color}44;
`;
const BtnSmall = styled.button`padding: 3px 8px; font-size: 11px; border-radius: 3px; cursor: pointer; border: 1px solid;`;
const BtnGhost = styled(BtnSmall)`background: transparent; border-color: #ccc; color: #555; &:hover { background: #f5f5f5; }`;
const BtnDanger = styled(BtnSmall)`background: transparent; border-color: #ffcdd2; color: #c62828; &:hover { background: #ffebee; }`;

const Legend = styled.div`
  padding: 10px 16px; border-bottom: 1px solid #f0f0f0;
  display: flex; flex-wrap: wrap; gap: 6px;
`;
const LegendItem = styled.div`display: flex; align-items: center; gap: 4px; font-size: 10px; color: #555;`;
const LegendDot = styled.span`width: 8px; height: 8px; border-radius: 50%; background: ${p => p.color}; flex-shrink: 0;`;

function PatientPanel() {
  const dispatch = useDispatch();
  const {patients, families, microareas} = useSelector(state => state.app);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState({condition: '', microareaId: ''});

  const filtered = patients.filter(p => {
    if (filter.condition && !p.conditions.includes(filter.condition)) return false;
    const fam = families.find(f => f.id === p.familyId);
    const maId = p.microareaId || fam?.microareaId;
    if (filter.microareaId && maId !== filter.microareaId) return false;
    return true;
  });

  function familyName(fid) {
    const f = families.find(f => f.id === fid);
    return f ? f.responsibleName : '—';
  }

  function microareaName(p) {
    const fam = families.find(f => f.id === p.familyId);
    const maId = p.microareaId || fam?.microareaId;
    const ma = microareas.find(m => m.id === maId);
    return ma ? ma.name : '—';
  }

  const primaryCond = p => CONDITIONS_MAP[p.conditions?.[0]] || CONDITIONS_MAP['outro'];

  return (
    <Panel>
      <Header>
        <TitleRow>
          <SectionTitle>Pacientes ({filtered.length}/{patients.length})</SectionTitle>
          <BtnPrimary onClick={() => setModal({patient: null})}>+ Novo</BtnPrimary>
        </TitleRow>
        <FilterRow>
          <Select value={filter.condition} onChange={e => setFilter(p => ({...p, condition: e.target.value}))}>
            <option value="">Todas condições</option>
            {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </Select>
          <Select value={filter.microareaId} onChange={e => setFilter(p => ({...p, microareaId: e.target.value}))}>
            <option value="">Todas microáreas</option>
            {microareas.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </FilterRow>
      </Header>

      <Legend>
        {CONDITIONS.slice(0, 8).map(c => (
          <LegendItem key={c.id}>
            <LegendDot color={c.color} />
            <span>{c.label}</span>
          </LegendItem>
        ))}
      </Legend>

      {filtered.length === 0 && <EmptyState>Nenhum paciente cadastrado.</EmptyState>}

      {filtered.map(p => {
        const cond = primaryCond(p);
        return (
          <PatientItem key={p.id}>
            <CondIcon title={cond.label}>{cond.emoji}</CondIcon>
            <Info>
              <PatientName>{p.name}</PatientName>
              <PatientMeta>Família: {familyName(p.familyId)} • {microareaName(p)}</PatientMeta>
              {p.birthdate && <PatientMeta>Nasc.: {p.birthdate}</PatientMeta>}
              <CondTags>
                {(p.conditions || []).map(cid => {
                  const c = CONDITIONS_MAP[cid];
                  return c ? <CondTag key={cid} color={c.color}>{c.emoji} {c.label}</CondTag> : null;
                })}
              </CondTags>
            </Info>
            <div style={{display:'flex', gap:'4px', flexShrink:0}}>
              <BtnGhost onClick={() => setModal({patient: p})}>✎</BtnGhost>
              <BtnDanger onClick={() => {
                if (window.confirm(`Excluir paciente "${p.name}"?`)) dispatch(deletePatient(p.id));
              }}>✕</BtnDanger>
            </div>
          </PatientItem>
        );
      })}

      {modal && <PatientModal patient={modal.patient} onClose={() => setModal(null)} />}
    </Panel>
  );
}

export default PatientPanel;
