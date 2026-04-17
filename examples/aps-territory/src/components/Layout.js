import React from 'react';
import styled from 'styled-components';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import KeplerGl from '@kepler.gl/components';
import Sidebar from './Sidebar';

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  height: 50px;
  background: #1a5e35;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
  gap: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  z-index: 10;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MapArea = styled.div`
  flex: 1;
  position: relative;
`;

function Layout({mapboxToken, mapId}) {
  return (
    <Container>
      <Header>
        <span>🏥</span>
        <span>Sistema de Gestão de Território — APS</span>
      </Header>
      <Body>
        <Sidebar />
        <MapArea>
          <AutoSizer>
            {({height, width}) => (
              <KeplerGl
                mapboxApiAccessToken={mapboxToken}
                id={mapId}
                width={width}
                height={height}
              />
            )}
          </AutoSizer>
        </MapArea>
      </Body>
    </Container>
  );
}

export default Layout;
