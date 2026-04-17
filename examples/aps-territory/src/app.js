import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {addDataToMap, wrapTo} from '@kepler.gl/actions';
import Layout from './components/Layout';
import {buildKeplerDatasets} from './services/geojson';

const MAPBOX_TOKEN = process.env.MapboxAccessToken || '';
export const MAP_ID = 'aps-map';

function App() {
  const dispatch = useDispatch();
  const {territories, microareas, families, patients} = useSelector(state => state.app);
  const mapReadyRef = useRef(false);

  useEffect(() => {
    const datasets = buildKeplerDatasets(territories, microareas, families, patients);
    const isFirst = !mapReadyRef.current;
    mapReadyRef.current = true;
    dispatch(
      wrapTo(MAP_ID, addDataToMap({
        datasets,
        options: {centerMap: isFirst},
        ...(isFirst ? {config: {mapStyle: {styleType: 'light'}}} : {})
      }))
    );
  }, [territories, microareas, families, patients]);

  return <Layout mapboxToken={MAPBOX_TOKEN} mapId={MAP_ID} />;
}

export default App;
