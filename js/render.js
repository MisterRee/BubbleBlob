const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const ClientRender = require( './ClientRender.js' );

let socket = io.connect();

let GUI = ReactDOM.render(
  <ClientRender socket={ socket }/>,
  document.getElementById( 'root' )
);
