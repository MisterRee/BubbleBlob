// Bubble class Module
module.exports = {
	init: function(px,py,vx,vy,r,rd,t,c,uid){
		this.position = {x:px, y:py};
		this.velocity = {x:vx, y:vy};
		this.radius = r;
		this.baseRadius = r;
		this.radiusDecay = rd;
		this.type = t;
		this.userDraw = true;
		this.color = c;
		this.userID = uid;
		this.points = 0;
	},

	initBasic: function (clientBounds){
		var tempBubble = new Bubble(
			generateNumber(0, clientBounds.x),
			generateNumber(0, clientBounds.y),
			generateNumber(-1,1),
			generateNumber(-1,1),
			Math.random() * 20,
			Math.random() / 2 + 0.01,
			"neutral",
			"rgba(255,255,255,0.50)",
			0);
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
	},

	detectCollisions: function(BubbleArray){ // Detects ALL collisions of bubbles of different types
		var output = [];
		for(var i = BubbleArray.length - 1; i >= 0; i--){ // cycles through every bubble in the array
			var collisions = [];
			for(var u = i - 1; u >= 0; u--){ // cycles through every bubble except self in the array
				var x1 = BubbleArray[i].position.x;
				var x2 = BubbleArray[u].position.x;
				var y1 = BubbleArray[i].position.y;
				var y2 = BubbleArray[u].position.y;
				var r1 = BubbleArray[i].radius;
				var r2 = BubbleArray[u].radius;
				if(x1 - r1 < x2 + r2 &&
				   x1 + r1 > x2 - r2 &&
				   y1 - r1 < y2 + r2 &&
				   y1 + r1 > y2 - r2){ //AABB collision before distance collision, to possibly save unnecessary filthy .sqrt calls
					var dist = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) )
					if(r1 + r2 > dist){
						if(BubbleArray[i].type != BubbleArray[u].type){ // If bubbles of same type collide, I don't really care, no designed interaction
							collisions.push(BubbleArray[u]);
						}
					}
				}
			}
			if(collisions.length > 0){
				output.push({reference:BubbleArray[i], collisions:collisions});
			}
		}
		return output;
	}
}

// Bubble specific helpers
function Bubble(px,py,vx,vy,r,rd,t,c,uid){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = r;
	this.baseRadius = r;
	this.radiusDecay = rd;
	this.type = t;
	this.userDraw = true;
	this.color = c;
	this.userID = uid;
	this.points = 0;
}

function generateNumber(min, max){
	return Math.random() * (max - min + 1) + min;
}
