import React, {useState} from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';
import {deleteTeam, deleteMember} from '../../app-reducer';
import TeamModal from '../modals/TeamModal';

const Panel = styled.div``;
const SectionHeader = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 10px; border-bottom: 1px solid #f0f0f0;`;
const SectionTitle = styled.h3`margin: 0; font-size: 13px; font-weight: 600; color: #333;`;
const BtnPrimary = styled.button`padding: 6px 12px; background: #1a5e35; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; &:hover { background: #155029; }`;
const BtnSmall = styled.button`padding: 3px 8px; font-size: 11px; border-radius: 3px; cursor: pointer; border: 1px solid;`;
const BtnGhost = styled(BtnSmall)`background: transparent; border-color: #ccc; color: #555; &:hover { background: #f5f5f5; }`;
const BtnDanger = styled(BtnSmall)`background: transparent; border-color: #ffcdd2; color: #c62828; &:hover { background: #ffebee; }`;
const EmptyState = styled.div`padding: 32px 16px; text-align: center; color: #999; font-size: 13px;`;
const TeamCard = styled.div`border-bottom: 1px solid #f0f0f0; padding: 12px 16px;`;
const TeamHeader = styled.div`display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;`;
const TeamInfo = styled.div`flex: 1;`;
const TeamName = styled.div`font-size: 13px; font-weight: 600; color: #333;`;
const TeamMeta = styled.div`font-size: 11px; color: #888; margin-top: 2px;`;
const TypeBadge = styled.span`padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; background: #e3f2fd; color: #1565c0;`;
const MemberList = styled.div`margin-top: 8px; padding-left: 8px; border-left: 2px solid #e0e0e0;`;
const MemberItem = styled.div`display: flex; align-items: center; padding: 4px 0; font-size: 12px; gap: 6px; color: #444;`;
const RoleBadge = styled.span`padding: 1px 6px; border-radius: 3px; font-size: 10px; background: #f3e5f5; color: #6a1b9a;`;

const ROLE_LABELS = {
  ACS: 'ACS', medico: 'Médico', enfermeiro: 'Enfermeiro',
  tecnico_enfermagem: 'Téc. Enf.', dentista: 'Dentista', outro: 'Outro'
};

function TeamPanel() {
  const dispatch = useDispatch();
  const {teams, microareas} = useSelector(state => state.app);
  const [modal, setModal] = useState(null);

  function maName(maId) {
    const ma = microareas.find(m => m.id === maId);
    return ma ? ma.name : '';
  }

  return (
    <Panel>
      <SectionHeader>
        <SectionTitle>Equipes ({teams.length})</SectionTitle>
        <BtnPrimary onClick={() => setModal({team: null, addMember: false})}>+ Nova Equipe</BtnPrimary>
      </SectionHeader>

      {teams.length === 0 && <EmptyState>Nenhuma equipe cadastrada.</EmptyState>}

      {teams.map(team => (
        <TeamCard key={team.id}>
          <TeamHeader>
            <TeamInfo>
              <TeamName>{team.name}</TeamName>
              <TeamMeta>INE: {team.ine || '—'} • {team.members.length} membros</TeamMeta>
            </TeamInfo>
            <TypeBadge>{team.type}</TypeBadge>
            <BtnGhost onClick={() => setModal({team, addMember: false})}>✎</BtnGhost>
            <BtnDanger onClick={() => {
              if (window.confirm(`Excluir equipe "${team.name}"?`)) dispatch(deleteTeam(team.id));
            }}>✕</BtnDanger>
          </TeamHeader>

          <MemberList>
            {team.members.map(m => (
              <MemberItem key={m.id}>
                <span style={{flex: 1}}>{m.name}</span>
                <RoleBadge>{ROLE_LABELS[m.role] || m.role}</RoleBadge>
                {m.microareaId && <span style={{fontSize:'10px', color:'#888'}}>{maName(m.microareaId)}</span>}
                <BtnDanger style={{padding:'1px 5px'}} onClick={() => dispatch(deleteMember(m.id))}>✕</BtnDanger>
              </MemberItem>
            ))}
            <MemberItem>
              <BtnGhost
                style={{fontSize:'11px', border:'1px dashed #ccc', padding:'3px 8px'}}
                onClick={() => setModal({team, addMember: true})}>
                + Membro
              </BtnGhost>
            </MemberItem>
          </MemberList>
        </TeamCard>
      ))}

      {modal && (
        <TeamModal team={modal.team} addMemberMode={modal.addMember} onClose={() => setModal(null)} />
      )}
    </Panel>
  );
}

export default TeamPanel;
