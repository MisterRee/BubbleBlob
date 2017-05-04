const express = require( 'express' );
const App = express();

App.use( express.static( 'public' ) );

const io = require( 'socket.io' ).listen( App.listen( 3000 ) );

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});

const Bubble = require( './js/Bubble.js' );

// Game variables
const c_gr = 3;  // user growth ratio
let mnb = 30; // maximum number of bubbles
let tbr = 0; // time between requests
let lrc; // last called time
let clientBounds = { x: 750, y: 500 };
let users = [];
let userColors = [];
let bubbleArray = [];

const gameInit = function(){
  for( let i = 0; i < c_nb; i++ ){
    let tempBubble = Bubble.createBase( clientBounds );
    bubbleArray.push( tempBubble );
  }
  gameLoop();
};

// Game draw function
const gameLoop = function(){
	if( !lrc ){
    lrc = now();
    setImmediate( gameLoop );
    return;
  }

	let delta = ( now() - lrc );
  lrc = now();
  tbr = 1 / delta;

	serverCalculate();
	//io.sockets.emit( 'draw', bubbleArray );

	setImmediate( gameLoop );
}
