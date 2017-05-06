const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const ClientRender = require( './ClientRender.js' );

let socket = io.connect();
let count = 10;

let GUI = ReactDOM.render(
  <ClientRender count={ count } socket={ socket }/>,
  document.getElementById( 'root' )
);
