import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';
import appReducer from './app-reducer';
import Window from 'global/window';
import {loadState, saveState} from './services/storage';

const reducers = combineReducers({
  keplerGl: keplerGlReducer,
  app: appReducer
});

const middlewares = enhanceReduxMiddleware([]);
const enhancers = [applyMiddleware(...middlewares)];
const composeEnhancers = Window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistedState = loadState();
const store = createStore(
  reducers,
  persistedState ? {app: persistedState} : {},
  composeEnhancers(...enhancers)
);

let saveTimer = null;
store.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(store.getState().app), 500);
});

export default store;
