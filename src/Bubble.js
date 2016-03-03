
exports.Bubble = function(px,py,vx,vy,r,rd){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = r;
	this.radiusDecay = rd;
}
