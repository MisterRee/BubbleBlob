// Bubble class Module
module.exports = {
	init: function( px, py, vx, vy, r, rd, t, c, uid ){
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
		this.bloomOut = false;
	},

	// Creates a bubble using random parameters
	initBasic: function ( clientBounds ){
		let tempBubble = new Bubble(
			generateNumber( 0, clientBounds.x ),
			generateNumber( 0, clientBounds.y ),
			generateNumber( -1, 1 ),
			generateNumber( -1, 1 ),
			Math.random() * 20,
			Math.random() / 2 + 0.01,
			"neutral",
			"rgba(255,255,255,0.80)",
			0);
		return tempBubble;
	},

	colorize: function(){
		let points = Math.floor( generateNumber( 255, 510 ) );
		const r = generateNumber( 0, 255 );
		points -= r;
		const g = generateNumber( 0, r );
		points -= g;
		const b = points;
		const string = "rgba(" + Math.floor( r ) + "," + Math.floor( g ) + "," + Math.floor( b ) + ",0.80)";
		return string;
	},

	// Detects collisions of all bubbles of different types
	detectCollisions: function(BubbleArray){
		let output = [];
		for( var i = BubbleArray.length - 1; i >= 0; i-- ){
			let collisions = [];

			// cycles through every bubble except self in the array
			for( var u = i - 1; u >= 0; u-- ){
				const x1 = BubbleArray[ i ].position.x;
				const x2 = BubbleArray[ u ].position.x;
				const y1 = BubbleArray[ i ].position.y;
				const y2 = BubbleArray[ u ].position.y;
				const r1 = BubbleArray[ i ].radius;
				const r2 = BubbleArray[ u ].radius;

				//AABB collision before distance collision, to possibly save unnecessary .sqrt calculations
				if( x1 - r1 < x2 + r2 &&
				    x1 + r1 > x2 - r2 &&
				    y1 - r1 < y2 + r2 &&
				    y1 + r1 > y2 - r2 ){
					const dist = Math.sqrt( ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 ) );
					if(r1 + r2 > dist){
						// Onlty collisions between bubbles of different types casues an event
						if(BubbleArray[i].type != BubbleArray[u].type){
							collisions.push(BubbleArray[u]);
						}
					}
				}
			}
			if(collisions.length > 0){
				output.push( { reference:BubbleArray[i], collisions:collisions } );
			}
		}
		return output;
	},

	// Casues a visual effect after removing active bubbles
	createBloom: function( position, maxRadius, color ){
		const tempBubble = new Bubble(
			position.x,
			position.y,
			0,
			0,
			maxRadius,
			maxRadius / 10,
			"bloom",
			color,
			0);
		tempBubble.radius = 0;
		tempBubble.bloomOut = true;

		const tempLength = tempBubble.color.length - 1;
		const tempOpacityString = tempBubble.color.substring( tempLength - 4, tempLength - 1 );
		const opacity = "," + ( parseFloat( tempOpacityString ) / 8 ) + ")";
		tempBubble.color = tempBubble.color.substring( 0, tempLength - 5 ) + opacity;

		return tempBubble;
	}
}

// Bubble-object specific helpers

// Bubble Object
function Bubble( px, py, vx, vy, r, rd, t, c, uid ){
	this.position = { x: px, y: py };
	this.velocity = { x: vx, y: vy };
	this.radius = r;
	this.baseRadius = r;
	this.radiusDecay = rd;
	this.type = t;
	this.userDraw = true;
	this.color = c;
	this.userID = uid;
	this.points = 0;
	this.bloomOut = false;
}

function generateNumber( min, max ){
	return Math.random() * ( max - min + 1 ) + min;
}
