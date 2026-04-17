import React, {useState, useRef} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {importFamilies} from '../../app-reducer';
import {parseCSV, parseXML, geocodeBatch, assignFamiliesToTerritories} from '../../services/import-data';

const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;`;
const Dialog = styled.div`background:white;border-radius:8px;padding:24px;width:560px;max-width:calc(100vw - 32px);max-height:calc(100vh - 60px);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const Title = styled.h2`margin:0 0 4px;font-size:16px;font-weight:600;`;
const Sub = styled.p`margin:0 0 20px;font-size:12px;color:#888;`;
const FormGroup = styled.div`margin-bottom:14px;`;
const Label = styled.label`display:block;font-size:12px;font-weight:500;color:#555;margin-bottom:4px;`;
const Select = styled.select`width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;background:white;`;
const Row = styled.div`display:flex;gap:12px;`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:20px;`;
const BtnCancel = styled.button`padding:8px 16px;background:transparent;border:1px solid #ddd;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#f5f5f5;}`;
const BtnSave = styled.button`padding:8px 16px;background:#1a5e35;color:white;border:none;border-radius:4px;font-size:13px;cursor:pointer;&:hover{background:#155029;}&:disabled{background:#aaa;cursor:not-allowed;}`;
const DropZone = styled.div`border:2px dashed ${p=>p.$drag?'#1a5e35':'#ddd'};border-radius:8px;padding:32px;text-align:center;cursor:pointer;background:${p=>p.$drag?'#f0f7f3':'#fafafa'};font-size:13px;color:#888;transition:all 0.2s;`;
const SecLabel = styled.div`font-size:11px;font-weight:600;color:#888;text-transform:uppercase;margin:16px 0 8px;border-top:1px solid #f0f0f0;padding-top:12px;`;
const PreviewWrap = styled.div`max-height:140px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:4px;`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:11px;`;
const Th = styled.th`background:#f5f5f5;padding:5px 8px;text-align:left;font-weight:600;border-bottom:1px solid #e0e0e0;white-space:nowrap;`;
const Td = styled.td`padding:4px 8px;border-bottom:1px solid #f5f5f5;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;`;
const ProgressBar = styled.div`height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden;margin-top:8px;`;
const ProgressFill = styled.div`height:100%;background:#1a5e35;border-radius:3px;transition:width 0.3s;width:${p=>p.pct}%;`;
const StatusMsg = styled.div`font-size:12px;color:#666;margin-top:8px;`;
const SummaryBox = styled.div`background:#e8f5e9;border-radius:6px;padding:12px;font-size:12px;color:#2e7d32;margin-top:12px;line-height:1.8;`;
const Check = styled.label`display:flex;align-items:center;gap:8px;font-size:12px;color:#444;cursor:pointer;margin-top:6px;`;

const STEPS = {UPLOAD:'upload', MAPPING:'mapping', PROCESSING:'processing', DONE:'done'};

function ImportModal({onClose}) {
  const dispatch = useDispatch();
  const {territories, microareas} = useSelector(state => state.app);
  const fileRef = useRef(null);
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [drag, setDrag] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({nameCol:'',addressCol:'',membersCol:'',vulnerabilityCol:''});
  const [options, setOptions] = useState({geocode:true, assign:true});
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState(null);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = file.name.toLowerCase().endsWith('.xml') ? parseXML(e.target.result) : parseCSV(e.target.result);
        if (!data.rows.length) return alert('Arquivo vazio ou formato inválido.');
        setParsed(data);
        const h = data.headers;
        setMapping({
          nameCol: h.find(x=>/nome|responsavel|name/i.test(x))||h[0]||'',
          addressCol: h.find(x=>/endere|rua|logradouro/i.test(x))||'',
          membersCol: h.find(x=>/membros?|pessoas?|moradores?/i.test(x))||'',
          vulnerabilityCol: h.find(x=>/vulnerab/i.test(x))||''
        });
        setStep(STEPS.MAPPING);
      } catch(err) { alert('Erro: ' + err.message); }
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleImport() {
    setStep(STEPS.PROCESSING); setTotal(parsed.rows.length); setProgress(0);
    let rows = parsed.rows;
    if (options.geocode && mapping.addressCol) {
      rows = await geocodeBatch(rows, mapping.addressCol, (done, t) => { setProgress(done); setTotal(t); });
    }
    const normalizeVuln = v => { if(!v) return 'baixa'; const s = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); return /alta|high|3/.test(s)?'alta':/media|medio|2/.test(s)?'media':'baixa'; };
    const families = rows.map(row => ({
      responsibleName: row[mapping.nameCol]||'Sem nome',
      address: row[mapping.addressCol]||'',
      memberCount: parseInt(row[mapping.membersCol],10)||1,
      socialVulnerability: normalizeVuln(row[mapping.vulnerabilityCol]),
      lat: row._lat??( row.lat?parseFloat(row.lat):null),
      lng: row._lng??( row.lng?parseFloat(row.lng):null)
    }));
    const assigned = options.assign ? assignFamiliesToTerritories(families, territories, microareas) : families;
    setResult({total: assigned.length, geocoded: assigned.filter(f=>f.lat!=null).length, withTerritory: assigned.filter(f=>f.microareaId).length, families: assigned});
    setStep(STEPS.DONE);
  }

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Dialog>
        <Title>Importar Planilha de Famílias</Title>
        <Sub>Suporta CSV e XML com dados de domicílios. Geocodificação via OpenStreetMap.</Sub>

        {step === STEPS.UPLOAD && (
          <>
            <DropZone $drag={drag} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}>
              📁 Clique ou arraste um arquivo CSV / XML aqui
              <div style={{fontSize:'11px',marginTop:'8px',color:'#aaa'}}>Máx. recomendado: 500 registros para geocodificação automática</div>
            </DropZone>
            <input ref={fileRef} type="file" accept=".csv,.xml" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
            <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel></Buttons>
          </>
        )}

        {step === STEPS.MAPPING && parsed && (
          <>
            <StatusMsg>✓ {parsed.rows.length} registros • {parsed.headers.length} colunas</StatusMsg>
            <SecLabel>Mapeamento de Colunas</SecLabel>
            <Row>
              <FormGroup style={{flex:1}}><Label>Nome do Responsável *</Label><Select value={mapping.nameCol} onChange={e=>setMapping(p=>({...p,nameCol:e.target.value}))}><option value="">—</option>{parsed.headers.map(h=><option key={h} value={h}>{h}</option>)}</Select></FormGroup>
              <FormGroup style={{flex:1}}><Label>Endereço</Label><Select value={mapping.addressCol} onChange={e=>setMapping(p=>({...p,addressCol:e.target.value}))}><option value="">— Não importar —</option>{parsed.headers.map(h=><option key={h} value={h}>{h}</option>)}</Select></FormGroup>
            </Row>
            <Row>
              <FormGroup style={{flex:1}}><Label>Nº Membros</Label><Select value={mapping.membersCol} onChange={e=>setMapping(p=>({...p,membersCol:e.target.value}))}><option value="">—</option>{parsed.headers.map(h=><option key={h} value={h}>{h}</option>)}</Select></FormGroup>
              <FormGroup style={{flex:1}}><Label>Vulnerabilidade</Label><Select value={mapping.vulnerabilityCol} onChange={e=>setMapping(p=>({...p,vulnerabilityCol:e.target.value}))}><option value="">—</option>{parsed.headers.map(h=><option key={h} value={h}>{h}</option>)}</Select></FormGroup>
            </Row>
            <SecLabel>Opções</SecLabel>
            <Check><input type="checkbox" checked={options.geocode} onChange={e=>setOptions(p=>({...p,geocode:e.target.checked}))} />Geocodificar endereços via OpenStreetMap (~1 req/s)</Check>
            <Check><input type="checkbox" checked={options.assign} onChange={e=>setOptions(p=>({...p,assign:e.target.checked}))} />Atribuir automaticamente ao território por localização</Check>
            <SecLabel>Prévia (5 primeiros)</SecLabel>
            <PreviewWrap><Table><thead><tr>{parsed.headers.map(h=><Th key={h}>{h}</Th>)}</tr></thead><tbody>{parsed.rows.slice(0,5).map((r,i)=><tr key={i}>{parsed.headers.map(h=><Td key={h}>{r[h]}</Td>)}</tr>)}</tbody></Table></PreviewWrap>
            <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnSave disabled={!mapping.nameCol} onClick={handleImport}>{options.geocode&&mapping.addressCol?'Geocodificar e Importar':'Importar'}</BtnSave></Buttons>
          </>
        )}

        {step === STEPS.PROCESSING && (
          <>
            <StatusMsg>{options.geocode&&mapping.addressCol?`Geocodificando... ${progress}/${total}`:'Processando...'}</StatusMsg>
            <ProgressBar><ProgressFill pct={total>0?(progress/total)*100:0} /></ProgressBar>
            <StatusMsg style={{fontSize:'11px',color:'#aaa',marginTop:'4px'}}>{options.geocode?'Respeitando limite de 1 req/s do Nominatim...':''}</StatusMsg>
          </>
        )}

        {step === STEPS.DONE && result && (
          <>
            <SummaryBox>
              <div>✅ <strong>{result.total}</strong> registros importados</div>
              <div>📍 <strong>{result.geocoded}</strong> geocodificados com sucesso</div>
              <div>🗺️ <strong>{result.withTerritory}</strong> atribuídos a uma microárea</div>
              {result.total-result.withTerritory>0&&<div style={{marginTop:'6px',color:'#e65100'}}>⚠️ {result.total-result.withTerritory} sem correspondência — revisar na aba Famílias</div>}
            </SummaryBox>
            <Buttons><BtnCancel onClick={onClose}>Cancelar</BtnCancel><BtnSave onClick={()=>{dispatch(importFamilies(result.families));onClose();}}>Confirmar Importação</BtnSave></Buttons>
          </>
        )}
      </Dialog>
    </Overlay>
  );
}
export default ImportModal;
