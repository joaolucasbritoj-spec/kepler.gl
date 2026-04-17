import React, {useState} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {addFamily, updateFamily} from '../../app-reducer';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:480px;max-width:calc(100vw - 32px);max-height:calc(100vh - 60px);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 20px;font-size:16px;font-weight:600;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Input = styled.input`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none;&:focus{border-color:#1a5e35;}`;
const Select = styled.select`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;background:white;`;
const Textarea = styled.textarea`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;resize:vertical;min-height:56px;outline:none;&:focus{border-color:#1a5e35;}`;
const Row = styled.div`display:flex;gap:12px;`;
const SecLabel = styled.div`font-size:11px;font-weight:600;color:#888;text-transform:uppercase;margin:14px 0 8px;border-top:1px solid #f0f0f0;padding-top:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}`;

function FamilyModal({family, onClose}) {
  const dispatch = useDispatch();
  const {microareas, territories} = useSelector(state => state.app);
  const [form, setForm] = useState({
    responsibleName: family?.responsibleName||'', prontuario: family?.prontuario||'',
    address: family?.address||'', memberCount: family?.memberCount||1,
    socialVulnerability: family?.socialVulnerability||'baixa', lastVisit: family?.lastVisit||'',
    microareaId: family?.microareaId||'', lat: family?.lat||'', lng: family?.lng||''
  });
  function set(f,v){setForm(p=>({...p,[f]:v}));}
  function handleSave() {
    if (!form.responsibleName.trim()) return alert('Nome do responsável é obrigatório.');
    const data = {...form, memberCount: parseInt(form.memberCount,10)||1, lat: form.lat!==''?parseFloat(form.lat):null, lng: form.lng!==''?parseFloat(form.lng):null};
    family ? dispatch(updateFamily({...family,...data})) : dispatch(addFamily(data));
    onClose();
  }
  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>{family ? 'Editar Família' : 'Nova Família'}</Title>
        <Row>
          <FormGroup style={{flex:2}}><Label>Responsável *</Label><Input value={form.responsibleName} onChange={e=>set('responsibleName',e.target.value)} placeholder="Nome completo" autoFocus /></FormGroup>
          <FormGroup style={{flex:1}}><Label>Prontuário</Label><Input value={form.prontuario} onChange={e=>set('prontuario',e.target.value)} placeholder="Nº" /></FormGroup>
        </Row>
        <FormGroup><Label>Endereço</Label><Textarea value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Rua, número, bairro" /></FormGroup>
        <Row>
          <FormGroup style={{flex:1}}>
            <Label>Microárea</Label>
            <Select value={form.microareaId} onChange={e=>set('microareaId',e.target.value)}>
              <option value="">— Selecionar —</option>
              {territories.map(t=>(<optgroup key={t.id} label={t.name}>{microareas.filter(m=>m.territoryId===t.id).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>))}
            </Select>
          </FormGroup>
          <FormGroup style={{flex:1}}><Label>Nº Membros</Label><Input type="number" min="1" value={form.memberCount} onChange={e=>set('memberCount',e.target.value)} /></FormGroup>
        </Row>
        <Row>
          <FormGroup style={{flex:1}}><Label>Vulnerabilidade Social</Label><Select value={form.socialVulnerability} onChange={e=>set('socialVulnerability',e.target.value)}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></Select></FormGroup>
          <FormGroup style={{flex:1}}><Label>Última Visita</Label><Input type="date" value={form.lastVisit} onChange={e=>set('lastVisit',e.target.value)} /></FormGroup>
        </Row>
        <SecLabel>Localização no Mapa (opcional)</SecLabel>
        <Row>
          <FormGroup style={{flex:1}}><Label>Latitude</Label><Input type="number" step="any" value={form.lat} onChange={e=>set('lat',e.target.value)} placeholder="-23.5505" /></FormGroup>
          <FormGroup style={{flex:1}}><Label>Longitude</Label><Input type="number" step="any" value={form.lng} onChange={e=>set('lng',e.target.value)} placeholder="-46.6333" /></FormGroup>
        </Row>
        <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnSave onClick={handleSave}>Salvar</BtnSave></Buttons>
      </Dialog>
    </Overlay>
  );
}
export default FamilyModal;
