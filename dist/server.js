'use strict';

// Pulling dependencies
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var now = require('performance-now');
var Bubble = require('./Bubble.edit.js');

// Socket/Port constants
var port = process.env.PORT || process.env.NODE_PORT || 3000;
var index = fs.readFileSync(__dirname + './../client/client.html');

function onRequest(request, responce) {
	responce.writeHead(200, { "Content-Type": "text/html" });
	responce.write(index);
	responce.end();
}

var app = http.createServer(onRequest).listen(port);
var io = socketio(app);

// Game constants
var num_bubbles = 30;
var rate_call = 60;
var user_growth_ratio = 3;

// Game variables
var clientBounds = { x: 750, y: 500 };
var users = [];
var userColors = [];
var bubbleArray = [];

// ----- ----- ----- ------------------------------------- ----- ----- -----
// ----- ----- ----- <([ Functions on server processes ])> ----- ----- -----
// ----- ----- ----- ------------------------------------- ----- ----- -----

// Setup upon server startup
var init = function init() {
	for (var i = 0; i < num_bubbles; i++) {
		var tempBubble = Bubble.createBase(clientBounds);
		bubbleArray.push(tempBubble);
	}
	gameLoop();
};

var tbr = 0; // time between requests
var lrc = void 0; // last called time

// Game draw function
var gameLoop = function gameLoop() {
	if (!lrc) {
		lrc = now();
		setImmediate(gameLoop);
		return;
	}

	var delta = now() - lrc;
	lrc = now();
	tbr = 1 / delta;

	serverCalculate();
	io.sockets.emit('draw', bubbleArray);

	setImmediate(gameLoop);
};

// Frame calculations
var serverCalculate = function serverCalculate() {
	for (var i = bubbleArray.length - 1; i >= 0; i--) {
		cycleBubble(bubbleArray[i], i);
	}

	var cList = Bubble.detectCollisions(bubbleArray);

	for (var u = cList.length - 1; u >= 0; u--) {
		for (var y = cList[u].collisions.length - 1; y >= 0; y--) {
			resolveCollision(cList[u].reference, cList[u].collisions[y]);
		}
	}
};

// Runs calculations and behaviors regarding specific bubble-type
var cycleBubble = function cycleBubble(bubble, index) {
	/*
 	There are four bubble-types which the server designates to each bubble during calculations.
 	- Neutral: These bubbles are randomly generated with random parameters. They are meant to collide with the user's bubble to convert to that player's color.
 	- Colored: A neutral bubble that has been claimed by a user. Interacts with other players besides the one that has claimed the prior neutral bubble.
 	- User: The indication hitbox bubble that follows the user's mouse position. Besides indicating hitbox range, this is simply a visual.
 	- Bloom: An opacity cut visual bubble to indicate that either a neutral or colored bubble has decayed past its lifetime.
 */

	switch (bubble.type) {
		case "neutral":
		case "colored":
			// Check if the bubble can survive its current decay rate.
			// If it can, it decays
			// If it cant, it is removed from the array and a Bloom bubble is spawned in its coordinates
			if (bubble.radius - bubble.radiusDecay > 0) {
				bubble.radius -= bubble.radiusDecay;
			} else {
				for (var y = bubbleArray.length - 1; y >= 0; y--) {
					if (bubbleArray[y].color == bubble.color && bubbleArray[y].type == "user") {
						bubbleArray[y].points -= 1;
					}
				}

				var bloom = Bubble.createBloom(bubble.position, bubble.baseRadius * 3, bubble.color);
				bubbleArray.push(bloom);
				bubbleArray.splice(index, 1);
				var tempBubble = Bubble.createNeutral(clientBounds);
				bubbleArray.push(tempBubble);

				// Code below is omitted for this deleted bubble instance
				break;
			}

			// Frame calculations for autonomous movement
			bubble.position.x += bubble.velocity.x;
			bubble.position.y += bubble.velocity.y;

			// Calculations for bouncing off edges
			if (bubble.position.x + bubble.radius < 0) {
				bubble.position.x = clientBounds.x + bubble.radius;
			}
			if (bubble.position.x - bubble.radius > clientBounds.x) {
				bubble.position.x = -bubble.radius;
			}
			if (bubble.position.y + bubble.radius < 0) {
				bubble.position.y = clientBounds.y + bubble.radius;
			}
			if (bubble.position.y - bubble.radius > clientBounds.y) {
				bubble.position.y = -bubble.radius;
			}
			break;
		case "user":
			if (bubble.draw) {
				// Finds the right user socket to the bubble, and draws to its mouse position
				// The more points the user has, the larger his user bubble becomes
				for (var i = users.length - 1; i >= 0; i--) {
					if (bubble.user == users[i].user) {
						bubble.position = users[i].mousePosition;
						bubble.radius = bubble.baseRadius + bubble.points / user_growth_ratio;
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
			if (bubble.bloom) {
				if (bubble.radius + bubble.radiusDecay < bubble.baseRadius) {
					bubble.radius += bubble.radiusDecay;
				} else {
					bubble.bloom = false;
				}
			} else {
				if (bubble.radius - bubble.radiusDecay > 0) {
					bubble.radius -= bubble.radiusDecay / 2;
				} else {
					bubbleArray.splice(index, 1);
				}
			}
	}
};

var resolveCollision = function resolveCollision(bubble1, bubble2) {
	switch (bubble1.type) {
		case "user":
			if (bubble2.type == "neutral") {
				userToNeutral(bubble1, bubble2);
			}
			if (bubble2.type == "colored") {
				userTocolored(bubble1, bubble2);
			}
			break;
		case "neutral":
			if (bubble2.type == "user") {
				userToNeutral(bubble2, bubble1);
			}
			break;
		case "colored":
			if (bubble2.type == "user") {
				userTocolored(bubble2, bubble1);
			}
			break;
	}
};

var userToNeutral = function userToNeutral(userb, neutralb) {
	neutralb.color = userb.color;
	neutralb.radius = neutralb.radius * 2;
	neutralb.type = "colored";
	userb.points += 1;
};

var userTocolored = function userTocolored(userb, coloredb) {
	if (userb.color == coloredb.color) {
		return;
	} else {
		for (var t = bubbleArray.length - 1; t >= 0; t--) {
			if (bubbleArray[t].type == "colored" && bubbleArray[t].color == userb.color) {
				bubbleArray[t].type = "neutral";
				bubbleArray[t].color = "rgba(255,255,255,0.50)";
				bubbleArray[t].radius = bubbleArray[t].radius / 2;
				var bloom = Bubble.createBloom(bubbleArray[t].position, bubbleArray[t].baseRadius * 3, userb.color);
				bubbleArray.push(bloom);
				userb.points = 0;
			}
		}
	}
};

// ----- ----- ----- ------------------------------------ ----- ----- -----
// ----- ----- ----- <([ Functions on client behavior ])> ----- ----- -----
// ----- ----- ----- ------------------------------------ ----- ----- -----
io.sockets.on('connection', function (socket) {

	// called right as client connects to http
	socket.on('join', function (userID) {
		socket.join('main'); // There's only one room in this app at the moment
		socket.userColor = Bubble.colorize();
		var tempBubble = Bubble.createBase(-500, -500, 0, 0, 20, false, "user", socket.userColor, userID);
		socket.userID = userID;
		socket.Bubble = tempBubble;
		socket.mousePosition = { x: -500, y: -500 };
		users.push(socket);
		bubbleArray.push(socket.Bubble);
		socket.emit('clientColorSet', socket.userColor);
	});

	// called when client exits http
	socket.on('disconnect', function () {
		var currentUser = void 0;

		// Find disconnected user index
		for (var i = users.length - 1; i >= 0; i--) {
			if (socket.userID == users[i].userID) {
				currentUser = users[i];
			}
		}

		if (currentUser != undefined) {
			var userBubble = bubbleArray.indexOf(currentUser.Bubble);

			bubbleArray[userBubble].draw = false;
			bubbleArray.splice(userBubble, 1);
			users.splice(currentUser, 1);
		}
	});

	// called when client moves mouse over canvas
	socket.on('clientMouseOnStream', function (clientData) {
		for (var i = users.length - 1; i >= 0; i--) {
			if (socket.userID == users[i].user) {
				var currentUser = users[i];
				currentUser.Bubble.draw = true;
				currentUser.mousePosition = clientData;
			}
		}
	});

	// called when client moves mouse out of canvas
	socket.on('clientMouseOffStream', function () {
		for (var u = users.length - 1; u >= 0; u--) {
			if (socket.userID == users[u].user) {
				var currentUser = users[u];
				currentUser.Bubble.user = false;
			}
		}
	});
});

init(); // Starts right away