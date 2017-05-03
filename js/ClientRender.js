//import React from 'react';
//import './client.css';

const React = require( 'React' );

class ClientRender extends React.Component {
  constructor( props ){
    super( props );
    this.canvas = <canvas className="GUI" ref="canvas"></canvas>;
  }

  render(){
    return (
      <div className="App">
        <div className="Header">
          <h1>Bubble Blobs</h1>
        </div>
        <div className="Color"></div>
        { this.canvas }
        <div className="Footer">
          <p> { this.props.count } </p>
        </div>
      </div>
    )
  }

  componentDidMount(){
    this.canvas = this.refs.canvas;
    this.ctx    = this.canvas.getContext( "2d" );
  }
};

module.exports = ClientRender;
