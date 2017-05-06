const now = require( 'performance-now' );
const Bubble = require( './js/Bubble.js' );

const express = require( 'express' );
const App = express();

const server = require( 'http' ).createServer( App );
const io = require( 'socket.io' )( server );

io.on( 'connection', function( client ){
  console.log( 'Client connected!' );

  client.on( 'join', function( data ){
    client.join( 'main' ); // There's only one room in this app at the moment

		client.userColor = Bubble.colorize();
    console.log( client.userColor );

    client.user = generateID();
    console.log( generateID() );
		const tempBubble = Bubble.createBase( { x: -500, y: -500 }, client.user, client.userColor );
		client.Bubble = tempBubble;

		client.mousePosition = { x: -500, y: -500 };

		users.push( client );
		bubbleArray.push( client.Bubble );

		client.emit( 'clientColorPush', client.userColor );
  });

  // called when client exits http
  client.on( 'disconnect', function(){
    let currentUser;
    // Find disconnected user index
    for( let i = users.length - 1; i >= 0; i-- ){
      if( client.user == users[ i ].user ){
        currentUser = users[ i ];
      };
    };
    if( currentUser != undefined ){
      let userBubble = bubbleArray.indexOf( currentUser.Bubble );
      bubbleArray[ userBubble ].draw = false;
      bubbleArray.splice( userBubble, 1 );
      users.splice( currentUser, 1 );
    };
  });

  client.on( 'bubblePull', function(){
    client.emit( 'bubblePush', bubbleArray );
  });

  client.on( 'mouseOnPush', function( data ){
    for( let i = users.length - 1; i >= 0; i-- ){
			if( client.user == users[ i ].user ){
				const currentUser = users[ i ];
				currentUser.Bubble.draw = true;
				currentUser.mousePosition = data;
			}
		}
  });

  client.on( 'mouseOffPush', function(){
    for( let i = users.length - 1; i >= 0; i-- ){
			if( client.user == users[ i ].user ){
        const currentUser = users[ i ];
        currentUser.Bubble.draw = false;
        currentUser.mousePosition = { x: -500, y: -500 };
      };
    };
  });
});

const generateID = function(){
  let id = Math.round( Math.random() * 1000 );

  for( let i = users.length - 1; i >= 0; i-- ){
    if( users[ i ].user === id ){
      console.log( 'looped' );
      generateID();
    };

    return id;
  };
};

App.use( express.static( __dirname + '/public' ) );

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});

// Game variables
const c_gr = 3;  // user growth ratio
let mnb = 30; // maximum number of bubbles

let tbr = 0;
let lrc;

let clientBounds = { x: 750, y: 500 };
let users = [];
let userColors = [];
let bubbleArray = [];

const gameInit = function(){
  for( let i = 0; i < mnb; i++ ){
    let tempBubble = Bubble.createNeutral( clientBounds );
    bubbleArray.push( tempBubble );
  }
  gameLoop();
};

// Game draw function
const gameLoop = function(){
  if( !lrc ){
    lrc = now();
    setImmediate( gameLoop );
  };

  let delta = ( now() - lrc );
  lrc = now();
  tbr = delta / 1000;

	serverCalculate( tbr );
	setImmediate( gameLoop );
};

// Frame calculations
const serverCalculate = function( time ){
	for( let i = bubbleArray.length - 1; i >= 0; i-- ){
		cycleBubble( bubbleArray[ i ], i, time );
	};

	const cList = Bubble.detectCollisions( bubbleArray );
	for( let u = cList.length - 1; u >= 0; u-- ){
		for( let y = cList[ u ].collisions.length - 1; y >= 0; y-- ){
			resolveCollision( cList[ u ].reference, cList[ u ].collisions[ y ] );
		};
	};
};

// Runs calculations and behaviors regarding specific bubble-type
const cycleBubble = function( bubble, index, time ){
	switch( bubble.type ){
		case "neutral":
		case "colored":
			// Check if the bubble can survive its current decay rate.
			// If it can, it decays
			// If it cant, it is removed from the array and a Bloom bubble is spawned in its coordinates
			if( bubble.radius - ( bubble.radiusDecay * time ) > 0 ) {
				bubble.radius -= ( bubble.radiusDecay * time );
			} else {
				for( let y = bubbleArray.length - 1; y >= 0; y-- ){
					if( bubbleArray[ y ].color == bubble.color &&
					    bubbleArray[ y ].type == "user"){
						bubbleArray[ y ].points -= 1;
		      };
        };
				const bloom = Bubble.createBloom( bubble.position, bubble.baseRadius * 3, bubble.color );
				bubbleArray.push( bloom );
				bubbleArray.splice( index, 1 );
				const tempBubble = Bubble.createNeutral( clientBounds );
				bubbleArray.push( tempBubble );
				break; // Code below is omitted for this deleted bubble instance
			};

			// Frame calculations for autonomous movement
			bubble.position.x += bubble.velocity.x * time;
			bubble.position.y += bubble.velocity.y * time;
			// Calculations for bouncing off edges
			if( bubble.position.x + bubble.radius < 0 ){
				bubble.position.x = clientBounds.x + bubble.radius;
			};
			if( bubble.position.x - bubble.radius > clientBounds.x ){
				bubble.position.x = -bubble.radius;
			};
			if( bubble.position.y  + bubble.radius < 0 ){
				bubble.position.y = clientBounds.y + bubble.radius;
			};
			if( bubble.position.y - bubble.radius > clientBounds.y ){
				bubble.position.y = -bubble.radius;
			};
			break;

		case "user":
			if( bubble.draw ){
				// Finds the right user socket to the bubble, and draws to its mouse position
				// The more points the user has, the larger his user bubble becomes
				for(var i = users.length - 1; i >= 0; i--){
					if( bubble.user == users[ i ].user ){
						bubble.position = users[ i ].mousePosition;
						bubble.radius = bubble.baseRadius + ( bubble.points / c_gr );
					}
				}
			} else {
				// Throw this bubble off-screen if user is not drawing
				bubble.position = { x: -500, y: -500 };
	    }
			break;

		case "bloom":
			// Checks if this bloom bubble is blowing outwards or inwards
			// Removed from the array once its run its course
			if( bubble.bloom ){
				if( bubble.radius + ( bubble.radiusDecay * time ) < bubble.baseRadius ){
					bubble.radius += bubble.radiusDecay * time;
				} else {
					bubble.bloom = false;
				}
			} else {
				if( bubble.radius - ( bubble.radiusDecay / 2  * time ) > 0 ){
					bubble.radius -= ( bubble.radiusDecay / 2 ) * time;
				} else {
					bubbleArray.splice( index, 1 );
				}
			}
	}
};

const resolveCollision = function( bubble1, bubble2 ){
	switch( bubble1.type ){
		case "user":
			if( bubble2.type == "neutral" ){
				userToNeutral( bubble1, bubble2 );
			}
			if( bubble2.type == "colored" ){
				userToColored( bubble1, bubble2 );
			}
			break;
		case "neutral":
			if( bubble2.type == "user" ){
				userToNeutral( bubble2, bubble1 );
			}
			break;
		case "colored":
			if( bubble2.type == "user" ){
				userToColored( bubble2, bubble1 );
			}
			break;
	}
};

const userToNeutral = function( userb, neutralb ){
	neutralb.color = userb.color;
	neutralb.radius = neutralb.radius * 2;
	neutralb.type = "colored";
	userb.points += 1;
};

const userToColored = function( userb, coloredb ){
	if( userb.color == coloredb.color ){
		return;
	} else {
		for( let t = bubbleArray.length - 1; t >= 0; t-- ){
			if(bubbleArray[ t ].type == "colored" &&
			   bubbleArray[ t ].color == userb.color ){
				bubbleArray[ t ].type = "neutral";
				bubbleArray[ t ].color = "rgba(255,255,255,0.50)";
				bubbleArray[ t ].radius = bubbleArray[ t ].radius / 2;
				var bloom = Bubble.createBloom( bubbleArray[ t ].position, bubbleArray[ t ].baseRadius * 3, userb.color );
				bubbleArray.push( bloom );
				userb.points = 0;
			}
		}
	}
};

gameInit();
server.listen( 3000 );


/*
io.sockets.on( 'connection', function( socket ){
	// called right as client connects to http
	socket.on( 'join', function( user ){
		socket.join('main'); // There's only one room in this app at the moment
		socket.userColor = Bubble.colorize();
		const tempBubble = Bubble.createBase( -500, -500 , 0, 0, 20, false, "user", socket.userColor, user );
		socket.user = user;
		socket.Bubble = tempBubble;
		socket.mousePosition = { x: -500, y: -500 };
		users.push( socket );
		bubbleArray.push( socket.Bubble );
		socket.emit( 'clientColorSet', socket.userColor );
	});
	// called when client exits http
	socket.on('disconnect', function(){
		let currentUser;
		// Find disconnected user index
		for( let i = users.length - 1; i >= 0; i-- ){
			if( socket.user == users[ i ].user ){
				currentUser = users[ i ];
			}
		}
		if( currentUser != undefined ){
			let userBubble = bubbleArray.indexOf( currentUser.Bubble );
			bubbleArray[ userBubble ].draw = false;
			bubbleArray.splice( userBubble, 1 );
			users.splice( currentUser, 1 );
		}
	});
	// called when client moves mouse over canvas
	socket.on( 'clientMouseOnStream', function( clientData ){
		for( let i = users.length - 1; i >= 0; i-- ){
			if( socket.user == users[ i ].user ){
				var currentUser = users[ i ];
				currentUser.Bubble.draw = true;
				currentUser.mousePosition = clientData;
			}
		}
	});
	// called when client moves mouse out of canvas
	socket.on( 'clientMouseOffStream', function(){
		for( let u = users.length - 1; u >= 0; u-- ){
			if( socket.user == users[ u ].user ){
				var currentUser = users[ u ];
				currentUser.Bubble.user = false;
			}
		}
	});
});
*/
