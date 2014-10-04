// global namespace
var Savage = Savage || {};

Savage.color = '#ff0000';

Savage.mode = "none";

Savage.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

Savage.Arrow = function(paper) {
	// json properties:
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.color = "#ff0000";

	this.paper = paper;
	this.raphaelobject = null;
	this.startSelector = null;
	this.stopSelector = null;
	this.resizing = false;

	this.path = function() {

		var x = this.stop.x - this.start.x;
		var y = this.stop.y - this.start.y;

		var length = Math.sqrt(x * x + y * y);

		var alpha = Math.atan2(y, x);

		var factor = 0.3;
		var factor2 = 0.2;

		var arrowAngle = 0.4;
		var innerAngle = 0.25;


		var alphaMin = alpha - arrowAngle;
		var alphaMin2 = alpha - innerAngle;

		var alphaPlus = alpha + arrowAngle;
		var alphaPlus2 = alpha + innerAngle;

		var xmin = Math.floor(this.start.x + Math.cos(alphaMin) * length * factor);
		var ymin = Math.floor(this.start.y + Math.sin(alphaMin) * length * factor);
		var xmin2 = Math.floor(this.start.x + Math.cos(alphaMin2) * length * factor2);
		var ymin2 = Math.floor(this.start.y + Math.sin(alphaMin2) * length * factor2);

		var xplus = Math.floor(this.start.x + Math.cos(alphaPlus) * length * factor);
		var yplus = Math.floor(this.start.y + Math.sin(alphaPlus) * length * factor);
		var xplus2 = Math.floor(this.start.x + Math.cos(alphaPlus2) * length * factor2);
		var yplus2 = Math.floor(this.start.y + Math.sin(alphaPlus2) * length * factor2);

		return "M" + this.start.x + " " + this.start.y + //startpoint
			" L" + xplus + "," + yplus + " L" + xplus2 + "," + yplus2 +
			" L" + this.stop.x + " " + this.stop.y + //endpoint
			" L" + xmin2 + "," + ymin2 + " L" + xmin + "," + ymin + " Z";
	};

	this.update = function() {
		this.raphaelobject.attr("path", this.path());

		if(this.startSelector != null)
			this.startSelector.attr({"cx":this.start.x, "cy":this.start.y});

		if(this.stopSelector != null)
			this.stopSelector.attr({"cx":this.stop.x, "cy":this.stop.y});

	};

	this.select = function() {
		console.log("selected!");
		this.raphaelobject.attr({
			'stroke-width': 2,
			'stroke': '#00ff00',
			'fill': '#ff0000'
		});

		this.startSelector = paper.circle(this.start.x, this.start.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'
		});

		this.stopSelector = paper.circle(this.stop.x, this.stop.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'
		});

		var parent = this;
		this.startSelector.drag(
			function (dx, dy, x, y, e) {
			    parent.start.x = this.data("ox") + dx;
			    parent.start.y = this.data("oy") + dy;
			    parent.update();
			},
			function (x, y) {
			     this.data("ox", this.attr("cx"));
			     this.data("oy", this.attr("cy"));
			     Savage.mode = "dragging";
			},
			function () {
				Savage.mode = "none";
			}
		);

		this.stopSelector.drag(
			function (dx, dy, x, y, e) {
			    parent.stop.x = this.data("ox") + dx;
			    parent.stop.y = this.data("oy") + dy;
			    parent.update();
			},
			function (x, y) {
			     this.data("ox", this.attr("cx"));
			     this.data("oy", this.attr("cy"));
			     Savage.mode = "dragging";
			},
			function () {
				Savage.mode = "none";
				console.log(Savage.mode);
			}
		);		

		$(this.raphaelobject.node).attr("class", "selectable selected");
	};

	this.unselect = function() {
		console.log("unselected!");
		this.raphaelobject.attr({
			'stroke-width': 2,
			'stroke': '#ff0000',
			'fill': '#ff0000'
		});

		if(this.startSelector!= null)
			this.startSelector.remove();
		if(this.stopSelector!=null)
			this.stopSelector.remove();

		$(this.raphaelobject.node).attr("class", "selectable");
	};

	this.draw = function() {


		this.raphaelobject = paper.path(this.path());

		this.unselect();

		return this.raphaelobject;
	};

	this.draw();

	
};

Savage.Rectangle = function(paper) {
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.paper = paper;
	this.raphaelobject = null;

	this.path = function() {

		return "M" + this.start.x + " " + this.start.y + //startpoint
			" L" + this.stop.x + "," + this.start.y +
			" L" + this.stop.x + " " + this.stop.y + //endpoint
			" L" + this.start.x + "," + this.stop.y + " Z";
	}

	this.draw = function() {

		this.raphaelobject = paper.path(this.path()).attr({
			'stroke-width': 2,
			'stroke': '#ff0000'
		});

		return this.raphaelobject;
	}

	this.draw();

	this.update = function() {
		this.raphaelobject.attr("path", this.path());
	}
};

Savage.FreeDraw = function(paper) {
	this.stop = null;
	this.start = new Savage.Point(0, 0);
	this.paper = paper;
	this.raphaelobject = null;
	this.array = new Array();
	this.array[0] = ["M", this.start.x, this.start.y];


	this.path = function() {
		this.array[0] = ["M", this.start.x, this.start.y];
		return this.array;
	}

	this.draw = function() {

		this.raphaelobject = paper.path(this.path()).attr({
			'stroke-width': 2,
			'stroke': '#ff0000'
		});

		return this.raphaelobject;
	}

	this.draw();

	this.update = function() {
		this.array[this.array.length] = ["L", this.stop.x, this.stop.y];
		this.raphaelobject.attr("path", this.path());
	}
};

Savage.Drawer = function() {
	this.tempObject = null;
	this.mode = "none";

	this.startDrawing = function(x, y) {
		this.tempObject.start = new Savage.Point(x, y);
		this.tempObject.stop = new Savage.Point(x, y);
		this.mode = "drawing-line";
	}

	this.toClose = function() {
		return Math.sqrt(Math.pow(this.tempObject.start.x - this.tempObject.stop.x, 2) + Math.pow(this.tempObject.start.y - this.tempObject.stop.y, 2)) < 10;
	}

	this.update = function(x, y) {
		if (this.tempObject === null) return;

		this.tempObject.stop = new Savage.Point(x, y);

		if (this.mode === "drawing-line" && !this.toClose()) {
			this.tempObject.update();
		}
	}

	this.finish = function(fixate) {

		if (fixate && this.mode === "drawing-line" && !this.toClose()) {
			this.mode = "none";



			return true;
		}

		this.mode = "none";
		this.tempObject = null;
		return false;
	}
};



window.Savage = Savage;
