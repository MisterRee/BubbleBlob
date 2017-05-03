//import React from 'react';
//import ReactDOM from 'react-dom';
//import ClientRender from './ClientRender.js';
//import './client.css';

const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const ClientRender = require( './ClientRender.js' );

let count = 10;

let GUI = ReactDOM.render(
  <ClientRender count={ count }/>,
  document.getElementById( 'root' )
);
