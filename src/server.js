var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var orbObject = require('./Bubble.js');
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

var sDraws = {};

io.sockets.on('connection', function(socket){
	socket.join('main'); // There's only one room
	start(socket);
});

function start(socket){
	socket.emit('startDraw');
}