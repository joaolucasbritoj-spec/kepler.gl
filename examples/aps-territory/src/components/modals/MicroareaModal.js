import React, {useState} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {addMicroarea, updateMicroarea} from '../../app-reducer';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:420px;max-width:calc(100vw - 32px);box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 20px;font-size:16px;font-weight:600;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Input = styled.input`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none;&:focus{border-color:#1a5e35;}`;
const Select = styled.select`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;background:white;`;
const Row = styled.div`display:flex;gap:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}`;

function MicroareaModal({microarea, territoryId, onClose}) {
  const dispatch = useDispatch();
  const {teams} = useSelector(state => state.app);
  const allACS = teams.flatMap(t => t.members.filter(m => m.role === 'ACS'));
  const [form, setForm] = useState({
    name: microarea?.name || '', code: microarea?.code || '',
    acsId: microarea?.acsId || '', territoryId: microarea?.territoryId || territoryId
  });
  function set(f, v) { setForm(p => ({...p, [f]: v})); }
  function handleSave() {
    if (!form.name.trim()) return alert('Nome é obrigatório.');
    microarea ? dispatch(updateMicroarea({...microarea, ...form})) : dispatch(addMicroarea(form));
    onClose();
  }
  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>{microarea ? 'Editar Microárea' : 'Nova Microárea'}</Title>
        <Row>
          <FormGroup style={{flex:2}}><Label>Nome *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Microárea 01" autoFocus /></FormGroup>
          <FormGroup style={{flex:1}}><Label>Código</Label><Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="MA001" /></FormGroup>
        </Row>
        <FormGroup>
          <Label>ACS Responsável</Label>
          <Select value={form.acsId} onChange={e => set('acsId', e.target.value)}>
            <option value="">— Sem ACS —</option>
            {allACS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </FormGroup>
        <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnSave onClick={handleSave}>Salvar</BtnSave></Buttons>
      </Dialog>
    </Overlay>
  );
}
export default MicroareaModal;
