// Bubble class Module
module.exports = {
	init: function(px,py,vx,vy,r,rd,t,c){
		this.position = {x:px, y:py};
		this.velocity = {x:vx, y:vy};
		this.radius = r;
		this.radiusDecay = rd;
		this.type = t;
		this.userDraw = true;
		this.color = c;
	},

	initBasic: function (){
		var tempBubble = new Bubble(
			generateNumber(0, 500),
			generateNumber(0, 500),
			generateNumber(-1,1),
			generateNumber(-1,1),
			Math.random() * 20,
			Math.random() + 0.01,
			"neutral",
			"rgba(255,255,255,0.50)");
		return tempBubble;
	},
	
	colorize: function(){
		var points = Math.floor(generateNumber(255,510));
		var r = generateNumber(0,255);
		points -= r;
		var g = generateNumber(0,r);
		points -= g;
		var b = points;
		var string = "rgba(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ",0.50)"
		return string;
	}
}

// Bubble specific helpers
function Bubble(px,py,vx,vy,r,rd,t,c){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = r;
	this.radiusDecay = rd;
	this.type = t;
	this.userDraw = true;
	this.color = c;
}

function generateNumber(min, max){
	return Math.random() * (max - min + 1) + min;
}