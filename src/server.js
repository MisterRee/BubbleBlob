var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var Bubble = require('./Bubble.js');

var port = process.env.PORT || process.env.NODE_PORT || 3000;
var index = fs.readFileSync(__dirname + '/../client/client.html');

function onRequest(request, responce){
	responce.writeHead(200, {"Content-Type": "text/html"});
	responce.write(index);
	responce.end();
}

var app = http.createServer(onRequest).listen(port);
var io = socketio(app);
var clientBounds = {x:750,y:500};
var users = [];
var userColors = [];
var sDraws = [];

// ----- ----- ----- ------------------------------------- ----- ----- -----
// ----- ----- ----- <([ Functions on server processes ])> ----- ----- -----
// ----- ----- ----- ------------------------------------- ----- ----- -----
serverbegin(); // Starts right away

function serverbegin(){
	for(var i = 0; i < /*<<::|NUM_BUBBLES|::>>*/30/*::<<|NUM_BUBBLES|>>::*/; i++){ // Server starts with set number of neutral bubbles
		var tempBubble = Bubble.initBasic(clientBounds);
		sDraws.push(tempBubble);
	}
	setInterval(function(){
		serverUpdate(); // All calculations done server-side
		io.sockets.emit('draw', sDraws); // Emits sDraw array to all clients for them to redraw
	}, /*<<::|RATE_CALL|::>>*/60/*::<<|RATE_CALL|>>::*/); // Gotta go fast
}

	function serverUpdate(){
		for(var i = sDraws.length - 1; i >= 0; i--){
			cycleBubble(sDraws[i],i);
		}

		var cList = Bubble.detectCollisions(sDraws);

		for(var u = cList.length - 1; u >= 0; u--){
			for(var y = cList[u].collisions.length - 1; y >= 0; y--){
				resolveCollision(cList[u].reference, cList[u].collisions[y]);
			}
		}
	}

		function cycleBubble(bubble,index){ // cycleBubble runs specific bubble behaviors
			switch(bubble.type){
				case "neutral":
				case "colored":
					if(bubble.radius - bubble.radiusDecay > 0) {
						bubble.radius -= bubble.radiusDecay;
					} else {
						for(var y = sDraws.length - 1; y >= 0; y--){
							if(sDraws[y].color == bubble.color &&
							   sDraws[y].type == "user"){
								sDraws[y].points -= 1;
							}
						}
						sDraws.splice(index, 1);
						var tempBubble = Bubble.initBasic(clientBounds);
						sDraws.push(tempBubble);

						break;
					}

					bubble.position.x += bubble.velocity.x;
					bubble.position.y += bubble.velocity.y;

					if(bubble.position.x + bubble.radius < 0){
						bubble.position.x = clientBounds.x + bubble.radius;
					}
					if(bubble.position.x - bubble.radius > clientBounds.x){
						bubble.position.x = -bubble.radius;
					}
					if(bubble.position.y  + bubble.radius < 0){
						bubble.position.y = clientBounds.y + bubble.radius;
					}
					if(bubble.position.y - bubble.radius > clientBounds.y){
						bubble.position.y = -bubble.radius;
					}
					break;
				case "user":
					if(bubble.userDraw){
						for(var i = users.length - 1; i >= 0; i--){
							if(bubble.userID == users[i].userID){
								bubble.position = users[i].mousePosition;
								bubble.radius = bubble.baseRadius + (bubble.points/ /*::<<|GROWTH_RATIO|>>::*/3/*::<<|GROWTH_RATIO|>>::*/);
							}
						}
					} else {
						bubble.position = {x:-500, y:-500};
					}
					break;
			}
		}

		function resolveCollision(bubble1, bubble2){
			switch(bubble1.type){ // never would have thought a nested switch statement would be necessary
				case "user":
					if(bubble2.type == "neutral"){
						userToNeutral(bubble1, bubble2);
					}
					if(bubble2.type == "colored"){
						userTocolored(bubble1, bubble2);
					}
					break;
				case "neutral":
					if(bubble2.type == "user"){
						userToNeutral(bubble2, bubble1);
					}
					break;
				case "colored":
					if(bubble2.type == "user"){
						userTocolored(bubble2, bubble1);
					}
					break;
			}
		}

			function userToNeutral(userb, neutralb){
				neutralb.color = userb.color;
				neutralb.radius = neutralb.radius * 2;
				neutralb.type = "colored";
				userb.points += 1;
			}

			function userTocolored(userb, coloredb){
				if(userb.color == coloredb.color){
					return;
				} else {
					for(var t = sDraws.length - 1; t >= 0; t--){
						if(sDraws[t].type == "colored" &&
						   sDraws[t].color == userb.color){
							sDraws[t].type = "neutral";
							sDraws[t].color = "rgba(255,255,255,0.50)";
							sDraws[t].radius = sDraws[t].radius / 2;
							userb.points = 0;
						}
					}
				}
			}

// ----- ----- ----- ------------------------------------ ----- ----- -----
// ----- ----- ----- <([ Functions on client behavior ])> ----- ----- -----
// ----- ----- ----- ------------------------------------ ----- ----- -----
io.sockets.on('connection', function(socket){
	onJoined(socket);
	onDisconnect(socket);
	onMouseEvent(socket);
});

	function onJoined(socket){ // called right as client connects to http
		socket.on('join', function(userID){
			socket.join('main'); // There's only one room in this app
			socket.userColor = Bubble.colorize();
			var tempBubble = new Bubble.init(-500,-500,0,0,20,false,"user",socket.userColor, userID);
			socket.userID = userID;
			socket.Bubble = tempBubble;
			socket.mousePosition = {x:-500, y:-500};
			users.push(socket);
			sDraws.push(socket.Bubble);
			socket.emit('clientColorSet', socket.userColor);
		});
	}

	function onDisconnect(socket){ // called when client exits http
		socket.on('disconnect', function(){
			var currentUser;
			var userBubble;

			for(var i = users.length - 1; i >= 0; i--){
				if(socket.userID == users[i].userID){
					currentUser = users[i];
				}
			}
			if(currentUser != undefined){
				var userBubble = sDraws.indexOf(currentUser.Bubble);

				sDraws[userBubble].userDraw = false;
				sDraws.splice(userBubble, 1);
				users.splice(currentUser, 1);
			}
		});
	}

	function onMouseEvent(socket){
		socket.on('clientMouseOnStream', function(clientData){ // called when client moves mouse over canvas
			for(var i = users.length - 1; i >= 0; i--){
				if(socket.userID == users[i].userID){
					var currentUser = users[i];
					currentUser.Bubble.userDraw = true;
					currentUser.mousePosition = clientData;
				}
			}
		});
		socket.on('clientMouseOffStream', function(){ // called when client moves mouse out of canvas
			for(var u = users.length - 1; u >= 0; u--){
				if(socket.userID == users[u].userID){
					var currentUser = users[u];
					currentUser.Bubble.userDraw = false;
				}
			}
		});
	}
