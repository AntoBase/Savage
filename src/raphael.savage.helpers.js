var Savage = Savage || {};

//Helpers 

Savage.S4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

Savage.uniqueID = function() {

	return Savage.S4() + Savage.S4() + "-" + Savage.S4() + Savage.S4();
}

// Current 
Savage.currenSelectedColor = '#ff0000';
Savage.mode = "none";

Savage.Point = function(x, y) {
	this.x = x;
	this.y = y;

	this.toJSON = function() {
		return {
			x: this.x,
			y: this.y
		};
	};

	this.fromJSON = function(json) {
		this.x = json["x"];
		this.y = json["y"];
	};
};