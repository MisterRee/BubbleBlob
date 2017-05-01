import React from 'react';
import ReactDOM from 'react-dom';

import ClientRender from './ClientRender.js';
import './client.css';

let count = 10;

let GUI = ReactDOM.render(
  <ClientRender count={ count }/>,
  document.getElementById( 'root' )
);
