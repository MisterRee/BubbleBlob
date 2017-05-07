const now = require( 'performance-now' );
const React = require( 'react' );

let socket, cvs, ctx, cdv;
let mrs = false; // mouse ready state
let mos = false; // mouse over state
let mec; // mouse event coordinates

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
        <div className="Color"  ref="color"></div>
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
    cdv = this.refs.color;

    cvs.width = cvs.clientWidth;
    cvs.height = cvs.clientHeight;
    window.onresize = function(){
      cvs.width = cvs.clientWidth;
      cvs.height = cvs.clientHeight;
    };

    cvs.addEventListener( "mouseover", mouseOver, false );
    cvs.addEventListener( "mousemove", mouseOver, false );
    cvs.addEventListener( "mouseout", mouseOut, false );

    ctx = this.refs.canvas.getContext( '2d' );
    clientInit();
  }
};

const mouseOver = function( e ){
  if( !mrs ){
    return;
  }

  const rect = cvs.getBoundingClientRect();

  mec = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  mrs = false;

  socket.emit( 'mouseOnPush', mec );
}

const mouseOut = function( e ){
  if( !mrs ){
    return;
  }
  mrs = false;

  socket.emit( 'mouseOffPush' );
};

const clientInit = function(){
  if( !socket || !ctx ){
    return;
  };

  socket.on( 'connect', function( data ){
    socket.emit( 'join', 'Hello World from Client-side' );
  });

  socket.on( 'clientColorPush', function( data ){
    cdv.style.backgroundColor = data; // TODO set color value div "color" to this color
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
  tbr = delta / 1000;
  mrs = true;

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
