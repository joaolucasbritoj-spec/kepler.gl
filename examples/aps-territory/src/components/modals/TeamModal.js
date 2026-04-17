import React, {useState} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {addTeam, updateTeam, addMember} from '../../app-reducer';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:460px;max-width:calc(100vw - 32px);box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 20px;font-size:16px;font-weight:600;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Input = styled.input`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none;&:focus{border-color:#1a5e35;}`;
const Select = styled.select`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;background:white;`;
const Row = styled.div`display:flex;gap:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}`;

const TEAM_TYPES = ['ESF','EAP','EMAD','EMAP','outro'];
const ROLES = ['ACS','medico','enfermeiro','tecnico_enfermagem','dentista','outro'];
const ROLE_LABELS = {ACS:'Agente Comunitário de Saúde',medico:'Médico(a)',enfermeiro:'Enfermeiro(a)',tecnico_enfermagem:'Técnico(a) de Enfermagem',dentista:'Dentista',outro:'Outro'};

function TeamModal({team, addMemberMode, onClose}) {
  const dispatch = useDispatch();
  const {territories, microareas} = useSelector(state => state.app);
  const [teamForm, setTeamForm] = useState({name: team?.name||'', ine: team?.ine||'', type: team?.type||'ESF', territoryId: team?.territoryId||''});
  const [memberForm, setMemberForm] = useState({name:'', role:'ACS', cns:'', microareaId:''});
  function setT(f,v){setTeamForm(p=>({...p,[f]:v}));}
  function setM(f,v){setMemberForm(p=>({...p,[f]:v}));}

  if (addMemberMode) {
    return (
      <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
        <Dialog>
          <Title>Adicionar Membro — {team.name}</Title>
          <FormGroup><Label>Nome *</Label><Input value={memberForm.name} onChange={e=>setM('name',e.target.value)} placeholder="Nome completo" autoFocus /></FormGroup>
          <Row>
            <FormGroup style={{flex:1}}>
              <Label>Cargo</Label>
              <Select value={memberForm.role} onChange={e=>setM('role',e.target.value)}>
                {ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </FormGroup>
            <FormGroup style={{flex:1}}><Label>CNS</Label><Input value={memberForm.cns} onChange={e=>setM('cns',e.target.value)} placeholder="Cartão Nacional" /></FormGroup>
          </Row>
          {memberForm.role==='ACS' && (
            <FormGroup>
              <Label>Microárea de Responsabilidade</Label>
              <Select value={memberForm.microareaId} onChange={e=>setM('microareaId',e.target.value)}>
                <option value="">— Selecionar —</option>
                {microareas.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </FormGroup>
          )}
          <Buttons>
            <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
            <BtnSave onClick={()=>{ if(!memberForm.name.trim())return alert('Nome é obrigatório.'); dispatch(addMember({...memberForm,teamId:team.id})); onClose(); }}>Adicionar</BtnSave>
          </Buttons>
        </Dialog>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>{team ? 'Editar Equipe' : 'Nova Equipe'}</Title>
        <FormGroup><Label>Nome *</Label><Input value={teamForm.name} onChange={e=>setT('name',e.target.value)} placeholder="Ex: ESF Vila Nova" autoFocus /></FormGroup>
        <Row>
          <FormGroup style={{flex:1}}><Label>Tipo</Label><Select value={teamForm.type} onChange={e=>setT('type',e.target.value)}>{TEAM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</Select></FormGroup>
          <FormGroup style={{flex:1}}><Label>INE</Label><Input value={teamForm.ine} onChange={e=>setT('ine',e.target.value)} placeholder="Identificador" /></FormGroup>
        </Row>
        <FormGroup><Label>Território</Label><Select value={teamForm.territoryId} onChange={e=>setT('territoryId',e.target.value)}><option value="">— Selecionar —</option>{territories.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</Select></FormGroup>
        <Buttons>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnSave onClick={()=>{ if(!teamForm.name.trim())return alert('Nome é obrigatório.'); team?dispatch(updateTeam({...team,...teamForm})):dispatch(addTeam(teamForm)); onClose(); }}>Salvar</BtnSave>
        </Buttons>
      </Dialog>
    </Overlay>
  );
}
export default TeamModal;
