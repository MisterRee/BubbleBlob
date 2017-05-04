//import React from 'react';
//import './client.css';
const React = require( 'React' );

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
    this.updateCanvas();
  }

  updateCanvas(){
    const ctx = this.refs.canvas.getContext( '2d' );
  }
};

module.exports = ClientRender;
