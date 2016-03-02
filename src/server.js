var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
//var orbObject = require('./Bubble.js');
var port = process.env.PORT || process.env.NODE_PORT || 3000;
var index = fs.readFileSync(__dirname + '/../client/client.html');

function onRequest(request, responce){
	responce.writeHead(200, {"Content-Type": "text/html"});
	responce.write(index);
	responce.end();
}

var app = http.createServer(onRequest).listen(port);
console.log("Listening on 127.0.0.1:" + port);
var io = socketio(app);

// Server globals
var users = [];
var sDraws = [];

io.sockets.on('connection', function(socket){
	socket.join('main'); // There's only one room
	users.push(socket);
	start(socket);
});

function start(socket){
	createInitialBubbles(2);
	setInterval(loop, 60);
}

	function createInitialBubbles(num){
		for(var i = 0; i < num; i++){
			var tempBubble = new Bubble(generateNumber(0, 500),
									    generateNumber(0, 500),
									    Math.random(),
									    Math.random());
			sDraws.push(tempBubble);
		}
	}
	
function loop(){
	serverUpdate();
	io.sockets.emit('draw', sDraws);
}

	// magic happens here
	function serverUpdate(){
		for(var i = 0; i < sDraws.length; i++){
			sDraws[i].position.x += sDraws[i].velocity.x;
			sDraws[i].position.y += sDraws[i].velocity.y;
		}
	}

// Inclusive on min and max
function generateNumber(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Class here for the moment */
function Bubble(px,py,vx,vy){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = 5;
	
	this.update = function(){
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	};
}

