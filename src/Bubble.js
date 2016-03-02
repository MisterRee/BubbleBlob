
function Bubble(px,py,vx,vy){
	this.position = {x:px, y:py};
	this.velocity = {x:vx, y:vy};
	this.radius = 5;
	
	this.update = function(){
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	};
}