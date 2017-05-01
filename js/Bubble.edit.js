
// Constants
const maxBloomRadius = 20;
const bloomDecayRate = 0.1;

// Base Object
function BubbleClass( px, py, pvx, pvy, pr, prd, pt, pc, pid ){
  this.position = { x: px, y: py };
	this.velocity = { x: pvx, y: pvy };
	this.radius = pr;
	this.baseRadius = pr;
	this.radiusDecay = prd;
	this.type = pt;
	this.color = pc;
	this.user = pid;
  this.draw = true;
	this.points = 0;
	this.bloom = false;
}

function generateNumber( min, max ){
	return Math.random() * ( max - min + 1 ) + min;
}

const Bubble = {
  createBase( px, py, pvx, pvy, pr, prd, pt, pc, pid ){
    const bubble = new BubbleClass( px, py, pvx, pvy, pr, prd, pt, pc, pid );
    return bubble;
  },

  createNeutral( clientBounds ){
    const bubble = new BubbleClass(
      generateNumber( 0, clientBounds.x ),
			generateNumber( 0, clientBounds.y ),
			generateNumber( -1, 1 ),
			generateNumber( -1, 1 ),
			generateNumber( 0, maxBloomRadius ),
			Math.random() / 2 + 0.01,
			"neutral",
			"rgba(255,255,255,0.80)",
			0 );
    return bubble;
  },

  createBloom( position, maxRadius, color ){
    const bubble = new BubbleClass(
    position.x,
    position.y,
    0,
    0,
    maxRadius,
    maxRadius * bloomDecayRate,
    "bloom",
    color,
    0);
    bubble.radius = 0;
    bubble.bloom = true;

    const tempLength = bubble.color.length - 1;
    const tempOpacityString = bubble.color.substring( tempLength - 4, tempLength - 1 );
    const opacity = "," + ( parseFloat( tempOpacityString ) / 8 ) + ")";
    bubble.color = bubble.color.substring( 0, tempLength - 5 ) + opacity;

    return tempBubble;
  },

  colorize(){
		let points = Math.floor( generateNumber( 255, 510 ) );
		const r = generateNumber( 0, 255 );
		points -= r;
		const g = generateNumber( 0, r );
		points -= g;
		const b = points;
		const string = "rgba(" + Math.floor( r ) + "," + Math.floor( g ) + "," + Math.floor( b ) + ",0.80)";
		return string;
	},

  detectCollisions( BubbleArray ){
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

				// AABB collision before distance collision, to possibly save unnecessary .sqrt calculations
				if( x1 - r1 < x2 + r2 &&
				    x1 + r1 > x2 - r2 &&
				    y1 - r1 < y2 + r2 &&
				    y1 + r1 > y2 - r2 ){
					const dist = Math.sqrt( ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 ) );
					if(r1 + r2 > dist){
						// Only collisions between bubbles of different types casues an event
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
	}
};

module.exports = Bubble;
