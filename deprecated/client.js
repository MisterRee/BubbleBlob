'use strict';

var socket = void 0,
    canvas = void 0,
    ctx = void 0;
var userID = 'user' + (Math.floor(Math.random() * 1000) + 1); //TODO: this should be calculated server side
var cDraws = {};

var init = function init() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext("2d");
  socket = io.connect();
  canvas.addEventListener("mouseover", mouseOver, false);
  canvas.addEventListener("mousemove", mouseOver, false);
  canvas.addEventListener("mouseout", mouseOut, false);

  socket.on('clientColorSet', function (serverData) {
    console.log(serverData);
    var tempLength = serverData.length - 1;
    var tempOpacityString = serverData.substring(tempLength - 4, tempLength - 1);
    var opacity = parseFloat(tempOpacityString);
    document.querySelector("#wrap").style.backgroundColor = serverData;
  });

  socket.on('draw', function (data) {
    draw(data);
  });

  socket.emit('join', userID);
};

function mouseOver(e) {
  var clientData = getMousePos(canvas, e);
  socket.emit('clientMouseOnStream', clientData);
}

function mouseOut(e) {
  socket.emit('clientMouseOffStream');
}

var draw = function draw(data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < data.length; i++) {
    var tempCircle = data[i];
    var isUser = false;

    if (data[i].type == "user") {
      isUser = true;
    }

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = data[i].color;

    if (isUser) {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
    }

    ctx.arc(tempCircle.position.x, tempCircle.position.y, tempCircle.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    if (isUser) {
      ctx.stroke();
    }

    ctx.restore();
  }
};

var getMousePos = function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

window.onload = init;