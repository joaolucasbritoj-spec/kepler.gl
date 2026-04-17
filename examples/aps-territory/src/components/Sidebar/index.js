import React from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';
import {setTab} from '../../app-reducer';
import TerritoryPanel from './TerritoryPanel';
import TeamPanel from './TeamPanel';
import FamilyPanel from './FamilyPanel';
import PatientPanel from './PatientPanel';
import StatsPanel from './StatsPanel';

const Wrapper = styled.div`
  width: 380px; min-width: 380px; height: 100%; display: flex; flex-direction: column;
  background: white; border-right: 1px solid #e0e0e0; overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
`;
const TabBar = styled.nav`display: flex; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; flex-shrink: 0;`;
const Tab = styled.button`
  flex: 1; padding: 10px 2px; border: none;
  border-bottom: 3px solid ${p => p.$active ? '#1a5e35' : 'transparent'};
  background: transparent; cursor: pointer; font-size: 10.5px;
  font-weight: ${p => p.$active ? '600' : '400'};
  color: ${p => p.$active ? '#1a5e35' : '#777'};
  transition: all 0.15s;
  &:hover { color: #1a5e35; background: #f0f7f3; }
`;
const Content = styled.div`flex: 1; overflow-y: auto; overflow-x: hidden;`;

const TABS = [
  {id: 'territories', label: 'Territórios'},
  {id: 'teams',       label: 'Equipes'},
  {id: 'families',    label: 'Famílias'},
  {id: 'patients',    label: 'Pacientes'},
  {id: 'stats',       label: 'Stats'}
];

function Sidebar() {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.app.activeTab);
  return (
    <Wrapper>
      <TabBar>
        {TABS.map(tab => (
          <Tab key={tab.id} $active={activeTab === tab.id} onClick={() => dispatch(setTab(tab.id))}>{tab.label}</Tab>
        ))}
      </TabBar>
      <Content>
        {activeTab === 'territories' && <TerritoryPanel />}
        {activeTab === 'teams'       && <TeamPanel />}
        {activeTab === 'families'    && <FamilyPanel />}
        {activeTab === 'patients'    && <PatientPanel />}
        {activeTab === 'stats'       && <StatsPanel />}
      </Content>
    </Wrapper>
  );
}

export default Sidebar;
