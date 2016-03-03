var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var perlinScript = require('./perlin.js');
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
perlinScript.noise.seed(Math.random());

// Server globals
var users = [];
var sDraws = [];

io.sockets.on('connection', function(socket){
	socket.join('main'); // There's only one room
	users.push(socket);
	start(socket);
});

function start(socket){
	socket.on('clientMouseOnStream', function(data){
		var index = users.indexOf(socket);
		users[index].onCanvas = true;
		users[index].mousePosition = { x:data.x, y:data.y };
	});
	//createNoise();
	createInitialBubbles(20);
	setInterval(loop, 60);
}

	/*
	function createNoise(){
		for (var x = 0; x < 500; x++) {
			for (var y = 0; y < 500; y++) {
		    var value = perlinScript.noise.simplex2(x / 100, y / 100);
		    var value = perlinScript.noise.simplex2(x / 100, y / 100);
	  		image[x][y].r = Math.abs(value) * 256; // Or whatever. Open demo.html to see it used with canvas.
			}
	  }
	}
	*/

	function createInitialBubbles(num){
		for(var i = 0; i < num; i++){
			var tempBubble = initBasicBubble();
			sDraws.push(tempBubble);
		}
	}

function loop(){
	serverUpdate();
	io.sockets.emit('draw', {d1:sDraws, d2:users });
	//io.sockets.emit('drawUsers', {data:users, color:"rgba(255,0,0,0.5)"} );
}

	// magic happens here
	function serverUpdate(){
		for(var i = sDraws.length - 1; i >= 0; i--){
			if(sDraws[i].radius - sDraws[i].radiusDecay > 0) {
				sDraws[i].radius -= sDraws[i].radiusDecay;
			}
			else {
				sDraws.splice(i, 1);
				var tempBubble = initBasicBubble();
				sDraws.push(tempBubble);

				continue;
			}

			cycleBubble(sDraws[i]);
		}

		for(var i = users.length -1; i >= 0; i--){
			if(users[i].onCanvas){
				if(users[i].Bubble == undefined){
					var tempBubble = initBasicBubble();
						users[i].Bubble = tempBubble;
				}

				cycleBubble(users[i].Bubble);
			}
		}
	}

// Bubble Object
function Bubble(px,py,vx,vy,r,rd){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = r;
	this.radiusDecay = rd;
}

function initBasicBubble(){
	var tempBubble = new Bubble(
		generateNumber(0, 500),
		generateNumber(0, 500),
		generateNumber(-1,1),
		generateNumber(-1,1),
		Math.random() * 20,
		Math.random() + 0.01);
	return tempBubble;
}

function cycleBubble(bubble){
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
}

// Inclusive on min and max
function generateNumber(min, max){
	return Math.random() * (max - min + 1) + min;
}
