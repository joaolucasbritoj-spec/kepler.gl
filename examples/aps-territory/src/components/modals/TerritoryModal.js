import React, {useState} from 'react';
import styled from 'styled-components';
import {useDispatch} from 'react-redux';
import {addTerritory, updateTerritory, TERRITORY_COLORS} from '../../app-reducer';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:440px;max-width:calc(100vw - 32px);box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 20px;font-size:16px;font-weight:600;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Input = styled.input`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none;&:focus{border-color:#1a5e35;}`;
const Row = styled.div`display:flex;gap:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}`;
const ColorPicker = styled.div`display:flex;gap:8px;flex-wrap:wrap;`;
const Swatch = styled.button`width:26px;height:26px;border-radius:50%;cursor:pointer;border:3px solid ${p => p.$sel ? '#333' : 'transparent'};background:${p => p.color};outline:none;`;

function TerritoryModal({territory, onClose}) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: territory?.name || '', code: territory?.code || '',
    cnes: territory?.cnes || '', ubsName: territory?.ubsName || '',
    color: territory?.color || TERRITORY_COLORS[0]
  });
  function set(f, v) { setForm(p => ({...p, [f]: v})); }
  function handleSave() {
    if (!form.name.trim()) return alert('Nome é obrigatório.');
    territory ? dispatch(updateTerritory({...territory, ...form})) : dispatch(addTerritory(form));
    onClose();
  }
  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>{territory ? 'Editar Território' : 'Novo Território'}</Title>
        <FormGroup><Label>Nome *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Território Norte" autoFocus /></FormGroup>
        <Row>
          <FormGroup style={{flex:1}}><Label>Código</Label><Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="T001" /></FormGroup>
          <FormGroup style={{flex:1}}><Label>CNES</Label><Input value={form.cnes} onChange={e => set('cnes', e.target.value)} placeholder="CNES da UBS" /></FormGroup>
        </Row>
        <FormGroup><Label>Nome da UBS</Label><Input value={form.ubsName} onChange={e => set('ubsName', e.target.value)} placeholder="Ex: UBS Central" /></FormGroup>
        <FormGroup>
          <Label>Cor no Mapa</Label>
          <ColorPicker>{TERRITORY_COLORS.map(c => <Swatch key={c} color={c} $sel={form.color === c} onClick={() => set('color', c)} />)}</ColorPicker>
        </FormGroup>
        <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnSave onClick={handleSave}>Salvar</BtnSave></Buttons>
      </Dialog>
    </Overlay>
  );
}
export default TerritoryModal;
