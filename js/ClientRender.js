const now = require( 'performance-now' );
const React = require( 'react' );

let socket, cvs, ctx;

let tbr = 0; // time between requests
let lrc; // last called time

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
    cvs = this.refs.canvas;
    cvs.width = cvs.clientWidth;
    cvs.height = cvs.clientHeight;

    window.onresize = function(){
      cvs.width = cvs.clientWidth;
      cvs.height = cvs.clientHeight;
    };

    ctx = this.refs.canvas.getContext( '2d' );
    clientInit();
  }
};

const clientInit = function(){
  if( !socket || !ctx ){
    return;
  };

  socket.on( 'connect', function( data ){
    socket.emit( 'join', 'Hello World from Client-side' );
  });

  socket.on( 'bubblePush', function( data ){
    clientDraw( data );
  });

  clientLoop();
};

const clientLoop = function(){
  if( !lrc ){
    lrc = now();
    requestAnimationFrame( clientLoop );
    return;
  };

  let delta = ( now() - lrc );
  lrc = now();
  tbr = 1 / delta;

  socket.emit( 'bubblePull' );
  requestAnimationFrame( clientLoop );
};

const clientDraw = function( data ){
  ctx.clearRect( 0, 0, cvs.width, cvs.height );

  for( let i = 0; i < data.length; i++ ){
    const tempBubble = data[ i ];
    let isUser = false;

    if( data[ i ].type == "user" ){
      isUser = true;
    }

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = data[ i ].color;

    if( isUser ){
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
    }

    ctx.arc(
      tempBubble.position.x,
      tempBubble.position.y,
      tempBubble.radius,
      0, Math.PI * 2,
      false );
    ctx.closePath();
    ctx.fill();

    if( isUser ){
      ctx.stroke();
    }

    ctx.restore();
  };
};

module.exports = ClientRender;
