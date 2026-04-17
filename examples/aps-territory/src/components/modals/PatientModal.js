import React, {useState} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {addPatient, updatePatient} from '../../app-reducer';
import {CONDITIONS} from '../../constants';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:520px;max-width:calc(100vw - 32px);max-height:calc(100vh - 60px);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 20px;font-size:16px;font-weight:600;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Input = styled.input`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none;&:focus{border-color:#1a5e35;}`;
const Select = styled.select`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;background:white;`;
const Row = styled.div`display:flex;gap:12px;`;
const SectionLabel = styled.div`font-size:11px;font-weight:600;color:#888;text-transform:uppercase;margin:16px 0 8px;border-top:1px solid #f0f0f0;padding-top:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}`;
const CondGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:6px;`;
const CondCheck = styled.label`
  display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:12px;
  background:${p => p.$checked ? p.color + '22' : '#f9f9f9'};
  border:1px solid ${p => p.$checked ? p.color : '#e0e0e0'};
  &:hover{background:${p => p.color}11;}
`;

function PatientModal({patient, onClose}) {
  const dispatch = useDispatch();
  const {families, microareas, territories} = useSelector(state => state.app);
  const [form, setForm] = useState({
    name: patient?.name || '',
    cns: patient?.cns || '',
    cpf: patient?.cpf || '',
    birthdate: patient?.birthdate || '',
    gender: patient?.gender || 'F',
    familyId: patient?.familyId || '',
    microareaId: patient?.microareaId || '',
    conditions: patient?.conditions || [],
    lat: patient?.lat || '',
    lng: patient?.lng || '',
    notes: patient?.notes || ''
  });

  function set(f, v) { setForm(p => ({...p, [f]: v})); }

  function toggleCondition(cid) {
    setForm(p => ({
      ...p,
      conditions: p.conditions.includes(cid)
        ? p.conditions.filter(c => c !== cid)
        : [...p.conditions, cid]
    }));
  }

  function handleSave() {
    if (!form.name.trim()) return alert('Nome é obrigatório.');
    const data = {
      ...form,
      lat: form.lat !== '' ? parseFloat(form.lat) : null,
      lng: form.lng !== '' ? parseFloat(form.lng) : null
    };
    if (patient) { dispatch(updatePatient({...patient, ...data})); }
    else { dispatch(addPatient(data)); }
    onClose();
  }

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>{patient ? 'Editar Paciente' : 'Novo Paciente'}</Title>

        <Row>
          <FormGroup style={{flex:2}}>
            <Label>Nome completo *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome" autoFocus />
          </FormGroup>
          <FormGroup style={{flex:1}}>
            <Label>Sexo</Label>
            <Select value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
              <option value="outro">Outro</option>
            </Select>
          </FormGroup>
        </Row>

        <Row>
          <FormGroup style={{flex:1}}>
            <Label>Data de Nascimento</Label>
            <Input type="date" value={form.birthdate} onChange={e => set('birthdate', e.target.value)} />
          </FormGroup>
          <FormGroup style={{flex:1}}>
            <Label>CNS</Label>
            <Input value={form.cns} onChange={e => set('cns', e.target.value)} placeholder="Cartão Nacional" />
          </FormGroup>
        </Row>

        <Row>
          <FormGroup style={{flex:1}}>
            <Label>Família vinculada</Label>
            <Select value={form.familyId} onChange={e => set('familyId', e.target.value)}>
              <option value="">— Selecionar —</option>
              {families.map(f => <option key={f.id} value={f.id}>{f.responsibleName}</option>)}
            </Select>
          </FormGroup>
          <FormGroup style={{flex:1}}>
            <Label>Microárea (override)</Label>
            <Select value={form.microareaId} onChange={e => set('microareaId', e.target.value)}>
              <option value="">— Herdar da família —</option>
              {territories.map(t => (
                <optgroup key={t.id} label={t.name}>
                  {microareas.filter(m => m.territoryId === t.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </FormGroup>
        </Row>

        <SectionLabel>Condições de Saúde</SectionLabel>
        <CondGrid>
          {CONDITIONS.map(c => (
            <CondCheck key={c.id} color={c.color} $checked={form.conditions.includes(c.id)} onClick={() => toggleCondition(c.id)}>
              <input type="checkbox" checked={form.conditions.includes(c.id)} onChange={() => toggleCondition(c.id)} style={{accentColor: c.color}} />
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </CondCheck>
          ))}
        </CondGrid>

        <SectionLabel>Localização (opcional — herda da família se vazio)</SectionLabel>
        <Row>
          <FormGroup style={{flex:1}}>
            <Label>Latitude</Label>
            <Input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-23.5505" />
          </FormGroup>
          <FormGroup style={{flex:1}}>
            <Label>Longitude</Label>
            <Input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-46.6333" />
          </FormGroup>
        </Row>

        <Buttons>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <BtnSave onClick={handleSave}>Salvar</BtnSave>
        </Buttons>
      </Dialog>
    </Overlay>
  );
}

export default PatientModal;
