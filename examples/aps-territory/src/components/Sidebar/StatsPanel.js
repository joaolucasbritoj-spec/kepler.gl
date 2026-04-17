import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

const Panel = styled.div`padding: 16px;`;
const Title = styled.h3`margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #333;`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;`;
const Card = styled.div`background: ${p => p.color || '#f5f5f5'}; border-radius: 8px; padding: 14px; text-align: center;`;
const CardValue = styled.div`font-size: 24px; font-weight: 700; color: ${p => p.color || '#333'};`;
const CardLabel = styled.div`font-size: 11px; color: #777; margin-top: 4px;`;
const Section = styled.div`margin-bottom: 16px;`;
const SectionTitle = styled.div`font-size: 12px; font-weight: 600; color: #555; margin-bottom: 8px; text-transform: uppercase;`;
const BarItem = styled.div`margin-bottom: 8px;`;
const BarLabel = styled.div`display: flex; justify-content: space-between; font-size: 12px; color: #444; margin-bottom: 4px;`;
const BarTrack = styled.div`height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden;`;
const BarFill = styled.div`height: 100%; background: ${p => p.color || '#1a5e35'}; width: ${p => p.pct}%; border-radius: 3px; transition: width 0.3s;`;
const Divider = styled.div`height: 1px; background: #f0f0f0; margin: 16px 0;`;

function StatsPanel() {
  const {territories, microareas, teams, families} = useSelector(state => state.app);

  const allACS = teams.flatMap(t => t.members.filter(m => m.role === 'ACS'));
  const masWithACS = microareas.filter(m => m.acsId || allACS.some(a => a.microareaId === m.id));
  const coveragePct = microareas.length > 0 ? Math.round((masWithACS.length / microareas.length) * 100) : 0;

  const now = new Date();
  const d30 = new Date(now - 30 * 864e5).toISOString().split('T')[0];
  const d90 = new Date(now - 90 * 864e5).toISOString().split('T')[0];
  const v30 = families.filter(f => f.lastVisit && f.lastVisit >= d30).length;
  const v90 = families.filter(f => f.lastVisit && f.lastVisit >= d90).length;
  const p30 = families.length > 0 ? Math.round((v30 / families.length) * 100) : 0;
  const p90 = families.length > 0 ? Math.round((v90 / families.length) * 100) : 0;

  const vuln = {
    baixa: families.filter(f => f.socialVulnerability === 'baixa').length,
    media: families.filter(f => f.socialVulnerability === 'media').length,
    alta: families.filter(f => f.socialVulnerability === 'alta').length
  };

  const geoT = territories.filter(t => t.polygon).length;
  const geoM = microareas.filter(m => m.polygon).length;
  const geoF = families.filter(f => f.lat != null && f.lng != null).length;

  return (
    <Panel>
      <Title>Indicadores Gerais</Title>
      <Grid>
        <Card color="#e8f5e9"><CardValue color="#2e7d32">{territories.length}</CardValue><CardLabel>Territórios</CardLabel></Card>
        <Card color="#e3f2fd"><CardValue color="#1565c0">{microareas.length}</CardValue><CardLabel>Microáreas</CardLabel></Card>
        <Card color="#f3e5f5"><CardValue color="#6a1b9a">{allACS.length}</CardValue><CardLabel>ACS</CardLabel></Card>
        <Card color="#fff3e0"><CardValue color="#e65100">{families.length}</CardValue><CardLabel>Famílias</CardLabel></Card>
      </Grid>
      <Divider />
      <Section>
        <SectionTitle>Cobertura de ACS</SectionTitle>
        <BarItem>
          <BarLabel><span>Microáreas com ACS</span><span>{masWithACS.length}/{microareas.length} ({coveragePct}%)</span></BarLabel>
          <BarTrack><BarFill pct={coveragePct} color="#1a5e35" /></BarTrack>
        </BarItem>
      </Section>
      <Section>
        <SectionTitle>Visitas Domiciliares</SectionTitle>
        <BarItem>
          <BarLabel><span>30 dias</span><span>{v30} ({p30}%)</span></BarLabel>
          <BarTrack><BarFill pct={p30} color="#43a047" /></BarTrack>
        </BarItem>
        <BarItem>
          <BarLabel><span>90 dias</span><span>{v90} ({p90}%)</span></BarLabel>
          <BarTrack><BarFill pct={p90} color="#fb8c00" /></BarTrack>
        </BarItem>
      </Section>
      <Section>
        <SectionTitle>Vulnerabilidade Social</SectionTitle>
        {[{key:'alta',label:'Alta',color:'#c62828'},{key:'media',label:'Média',color:'#e65100'},{key:'baixa',label:'Baixa',color:'#2e7d32'}].map(({key, label, color}) => {
          const count = vuln[key];
          const pct = families.length > 0 ? Math.round((count / families.length) * 100) : 0;
          return (
            <BarItem key={key}>
              <BarLabel><span style={{color}}>{label}</span><span>{count} ({pct}%)</span></BarLabel>
              <BarTrack><BarFill pct={pct} color={color} /></BarTrack>
            </BarItem>
          );
        })}
      </Section>
      <Divider />
      <Section>
        <SectionTitle>Cobertura Geográfica</SectionTitle>
        <div style={{fontSize:'12px', color:'#666', display:'flex', flexDirection:'column', gap:'6px'}}>
          <div>📍 {geoT}/{territories.length} territórios com polígono</div>
          <div>📍 {geoM}/{microareas.length} microáreas com polígono</div>
          <div>📍 {geoF}/{families.length} famílias com localização</div>
        </div>
      </Section>
    </Panel>
  );
}

export default StatsPanel;
