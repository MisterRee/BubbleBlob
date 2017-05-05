//import React from 'react';
//import ReactDOM from 'react-dom';
//import ClientRender from './ClientRender.js';
//import './client.css';

const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const ClientRender = require( './ClientRender.js' );

let socket = io.connect();
socket.on( 'connect', function( data ){
  console.log( 'Hello World from Client-side' );
  socket.emit( 'join', 'Hello World from Client-side' );
});

let count = 10;

let GUI = ReactDOM.render(
  <ClientRender count={ count } socket={ socket }/>,
  document.getElementById( 'root' )
);
