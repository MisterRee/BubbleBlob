const now = require( 'performance-now' );
const React = require( 'react' );

let socket, cvs, ctx, cdv;
let mrs = false; // mouse ready state
let mos = false; // mouse over state
let mec, bcr, gdv; // mouse event coordinates, bounding canvas rectangle, greater dimension value

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

    set_gdv();

    window.onresize = function(){
      cvs.width = cvs.clientWidth;
      cvs.height = cvs.clientHeight;

      set_gdv();
    };

    cvs.addEventListener( "mouseover", mouseOver, false );
    cvs.addEventListener( "mousemove", mouseOver, false );
    cvs.addEventListener( "mouseout", mouseOut, false );

    ctx = this.refs.canvas.getContext( '2d' );
    clientInit();
  }
};

const set_gdv = function(){
  if( cvs.width > cvs.height ){
    gdv = cvs.width;
  } else {
    gdv = cvs.height;
  }
};

const mouseOver = function( e ){
  if( !mrs ){
    return;
  }

  const rect = cvs.getBoundingClientRect();

  mec = {
    x: ( e.clientX - rect.left ) / cvs.width ,
    y: ( e.clientY - rect.top  ) / cvs.height
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
    cdv.style.backgroundColor = data;
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
      tempBubble.position.x * cvs.width,
      tempBubble.position.y * cvs.height,
      tempBubble.radius * gdv / 2,
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
