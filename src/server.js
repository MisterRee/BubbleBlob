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
var users = [];
var sDraws = [];

// ----- ----- ----- ----------------------------------- ----- ----- -----
// ----- ----- ----- <([ Functions on server process ])> ----- ----- -----
// ----- ----- ----- ----------------------------------- ----- ----- -----
serverbegin(); // Starts right away

function serverbegin(){
	for(var i = 0; i < /*<<::|NUM_BUBBLES|::>>*/20/*::<<|NUM_BUBBLES|>>::*/; i++){ // Server starts with set number of neutral bubbles
		var tempBubble = Bubble.initBasic();
		sDraws.push(tempBubble);
	} 
	setInterval(function(){
		serverUpdate(); // All calculations done server-side
		io.sockets.emit('draw', sDraws); // Emits sDraw array to all clients for them to redraw
	}, 60); // Gotta go fast
}

	// magic calculations happens here
	function serverUpdate(){
		for(var i = users.length - 1; i >= 0; i--){
			if(users[i].Bubble.userDraw){ // userDraw acts as a toggle if mouse is on client canvas
				users[i].Bubble.position = users[i].mousePosition;
			} else { // Gets associated client's bubble out of the drawing scope if mouse is not on client canvas
				users[i].Bubble.position = {x:-50, y:-50};
			}
		}
		
		for(var u = sDraws.length - 1; u >= 0; u--){
			switch(sDraws[u].type){ // Switch in case if more bubble types are to be added
				case "neutral":
					if(sDraws[u].radius - sDraws[u].radiusDecay > 0) {
						sDraws[u].radius -= sDraws[u].radiusDecay;
					}
					else {
						sDraws.splice(u, 1);
						var tempBubble = Bubble.initBasic();
						sDraws.push(tempBubble);

						continue; //Skip Bubble animation cycle
					}

					cycleBubble(sDraws[u],"neutral"); 
				break;
			}
		}
	}
	
		function cycleBubble(bubble, type){ // cycleBubble runs specific bubble behaviors
			switch(type){
				case "neutral":
					bubble.position.x += bubble.velocity.x;
					bubble.position.y += bubble.velocity.y;

					if(bubble.position.x < 0){
						bubble.position.x = 500;
					}
					if(bubble.position.x > 500){
						bubble.position.x = 0;
					}
					if(bubble.position.y < 0){
						bubble.position.y = 500;
					}
					if(bubble.position.y > 500){
						bubble.position.y = 0;
					}
					break;
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
			var tempBubble = new Bubble.init(-50,-50,0,0,20,false,"user",socket.userColor);
			socket.userID = userID;
			socket.Bubble = tempBubble;
			socket.mousePosition = {x:-50, y:-50};
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
				console.log("Bubble Sliced");
				users.splice(currentUser, 1);
				console.log("User disconnected");
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