import React from 'react';
import ReactDOM from 'react-dom/client';
import document from 'global/document';
import {Provider} from 'react-redux';
import store from './store';
import App from './app';

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
