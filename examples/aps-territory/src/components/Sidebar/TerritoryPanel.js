import React, {useState} from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';
import {deleteTerritory, deleteMicroarea} from '../../app-reducer';
import TerritoryModal from '../modals/TerritoryModal';
import MicroareaModal from '../modals/MicroareaModal';

const Panel = styled.div``;
const SectionHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px 10px; border-bottom: 1px solid #f0f0f0;
`;
const SectionTitle = styled.h3`margin: 0; font-size: 13px; font-weight: 600; color: #333;`;
const BtnPrimary = styled.button`
  padding: 6px 12px; background: #1a5e35; color: white;
  border: none; border-radius: 4px; font-size: 12px; cursor: pointer;
  &:hover { background: #155029; }
`;
const BtnSmall = styled.button`padding: 3px 8px; font-size: 11px; border-radius: 3px; cursor: pointer; border: 1px solid;`;
const BtnGhost = styled(BtnSmall)`background: transparent; border-color: #ccc; color: #555; &:hover { background: #f5f5f5; }`;
const BtnDanger = styled(BtnSmall)`background: transparent; border-color: #ffcdd2; color: #c62828; &:hover { background: #ffebee; }`;
const EmptyState = styled.div`padding: 32px 16px; text-align: center; color: #999; font-size: 13px;`;
const TerritoryCard = styled.div`border-bottom: 1px solid #f0f0f0;`;
const TerritoryHeader = styled.div`
  display: flex; align-items: center; padding: 10px 16px; cursor: pointer; gap: 8px;
  &:hover { background: #f9fafb; }
`;
const ColorDot = styled.span`
  width: 12px; height: 12px; border-radius: 50%;
  background: ${p => p.color}; flex-shrink: 0;
`;
const TerritoryName = styled.div`flex: 1; font-size: 13px; font-weight: 500;`;
const TerritoryMeta = styled.div`font-size: 11px; color: #888;`;
const ActionRow = styled.div`display: flex; gap: 6px;`;
const MicroareaList = styled.div`
  background: #fafafa; padding: 0 0 8px 28px;
  border-left: 3px solid ${p => p.color}; margin-left: 16px;
`;
const MicroareaItem = styled.div`display: flex; align-items: center; padding: 6px 8px 6px 0; gap: 8px; font-size: 12px;`;
const MicroareaName = styled.div`flex: 1; color: #444;`;
const Badge = styled.span`
  padding: 2px 6px; border-radius: 10px; font-size: 10px;
  font-weight: 500; background: #e8f5e9; color: #2e7d32;
`;
const Chevron = styled.span`
  font-size: 10px; color: #aaa; transition: transform 0.2s;
  display: inline-block;
  transform: rotate(${p => p.$open ? '90deg' : '0deg'});
`;

function TerritoryPanel() {
  const dispatch = useDispatch();
  const {territories, microareas, teams, families} = useSelector(state => state.app);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);

  const allACS = teams.flatMap(t => t.members.filter(m => m.role === 'ACS'));

  function toggle(id) { setExpanded(prev => ({...prev, [id]: !prev[id]})); }

  function acsName(acsId) {
    const acs = allACS.find(a => a.id === acsId);
    return acs ? acs.name : 'Sem ACS';
  }

  return (
    <Panel>
      <SectionHeader>
        <SectionTitle>Territórios ({territories.length})</SectionTitle>
        <BtnPrimary onClick={() => setModal({type: 'territory', data: null})}>+ Novo</BtnPrimary>
      </SectionHeader>

      {territories.length === 0 && (
        <EmptyState>
          Nenhum território cadastrado.<br />Clique em "+ Novo" para começar.
        </EmptyState>
      )}

      {territories.map(t => {
        const mas = microareas.filter(m => m.territoryId === t.id);
        const isOpen = expanded[t.id];
        return (
          <TerritoryCard key={t.id}>
            <TerritoryHeader onClick={() => toggle(t.id)}>
              <Chevron $open={isOpen}>►</Chevron>
              <ColorDot color={t.color} />
              <TerritoryName>{t.name}</TerritoryName>
              <TerritoryMeta>{mas.length} microáreas</TerritoryMeta>
              <ActionRow onClick={e => e.stopPropagation()}>
                <BtnGhost onClick={() => setModal({type: 'territory', data: t})}>✎</BtnGhost>
                <BtnDanger onClick={() => {
                  if (window.confirm(`Excluir território "${t.name}" e todas as microáreas?`)) {
                    dispatch(deleteTerritory(t.id));
                  }
                }}>✕</BtnDanger>
              </ActionRow>
            </TerritoryHeader>

            {isOpen && (
              <MicroareaList color={t.color}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 8px 4px 0'}}>
                  <span style={{fontSize:'11px', color:'#888', fontWeight:'500'}}>MICROÁREAS</span>
                  <BtnPrimary
                    style={{padding:'3px 8px', fontSize:'11px'}}
                    onClick={() => setModal({type: 'microarea', data: null, territoryId: t.id})}>
                    + Microárea
                  </BtnPrimary>
                </div>
                {mas.length === 0 && (
                  <div style={{fontSize:'12px', color:'#bbb', padding:'4px 0'}}>Nenhuma microárea</div>
                )}
                {mas.map(m => (
                  <MicroareaItem key={m.id}>
                    <MicroareaName>
                      <div style={{fontWeight:'500'}}>{m.name}</div>
                      <div style={{fontSize:'10px', color:'#999'}}>{acsName(m.acsId)}</div>
                    </MicroareaName>
                    <Badge>{families.filter(f => f.microareaId === m.id).length} fam.</Badge>
                    <BtnGhost onClick={() => setModal({type: 'microarea', data: m, territoryId: t.id})}>✎</BtnGhost>
                    <BtnDanger onClick={() => {
                      if (window.confirm(`Excluir microárea "${m.name}"?`)) dispatch(deleteMicroarea(m.id));
                    }}>✕</BtnDanger>
                  </MicroareaItem>
                ))}
              </MicroareaList>
            )}
          </TerritoryCard>
        );
      })}

      {modal?.type === 'territory' && (
        <TerritoryModal territory={modal.data} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'microarea' && (
        <MicroareaModal microarea={modal.data} territoryId={modal.territoryId} onClose={() => setModal(null)} />
      )}
    </Panel>
  );
}

export default TerritoryPanel;
