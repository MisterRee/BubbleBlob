//import React from 'react';
//import './client.css';

const React = require( 'react' );
let socket;

class ClientRender extends React.Component {
  constructor( props ){
    super( props );
  }

  render(){
    return (
      <div className="App">
        <div className="Header">
          <h1>Bubbles.io</h1>
        </div>
        <div className="Color"></div>
        <canvas className="GUI" ref="canvas"></canvas>
        <div className="Footer">
          <p> { this.props.count } </p>
        </div>
      </div>
    )
  }

  componentDidMount(){
    socket = this.props.socket;
    this.updateCanvas();
  }

  updateCanvas(){
    const cvs = this.refs.canvas;
    const ctx = cvs.getContext( '2d' );
  }
};

module.exports = ClientRender;

const mouseOver  = function( canvasObject, evt ){
  const coord = getMousePos( canvasObject, evt );
  socket.emit( 'clientMouseOnStream', coord );
};

const getMousePos = function( canvasObject , evt ){
  const rect = canvasObject.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
