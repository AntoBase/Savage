var Savage = Savage || {};

Savage.Arrow = function(editor) {
	// json properties:
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.color = "#ee0000";
	this.editor = editor;
	this.paper = editor.paper;
	this.raphaelobject = null;
	this.startSelector = null;
	this.stopSelector = null;
	this.resizing = false;
	this.glow = null;
	this.selected = false;

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
		this.raphaelobject.attr({
			"path": this.path(),
			'stroke-width': 2,
			'stroke': this.selected ? Savage.currenSelectedColor : this.color,
			'fill': this.color
		});

		if(this.selected)
			$(this.raphaelobject.node).attr("class", "selectable selected");
		else
			$(this.raphaelobject.node).attr("class", "selectable");

		if(this.glow != null)
			this.glow.remove();

		this.glow = this.raphaelobject.glow({
			width: 5,
			fill: false,
			opacity: 0.5,
			offsetx: 1,
			offsety: 1,
			color: '#000000'
		});

		if (this.startSelector != null)
			this.startSelector.attr({
				"cx": this.start.x,
				"cy": this.start.y
			});

		if (this.stopSelector != null)
			this.stopSelector.attr({
				"cx": this.stop.x,
				"cy": this.stop.y
			});
	};

	this.select = function() {

		this.editor.clearSelection();
		this.selected = true;

		console.log("selected!");


		if (this.startSelector != null)
			this.startSelector.remove();
		if (this.stopSelector != null)
			this.stopSelector.remove();

		this.startSelector = this.paper.circle(this.start.x, this.start.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'//,
			//'opacity': 0.5
		});

		this.stopSelector = this.paper.circle(this.stop.x, this.stop.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'//,
			//'opacity': 0.5
		});

		this.update();

		var parent = this;
		this.startSelector.undrag();
		this.startSelector.drag(
			function(dx, dy, x, y, e) {
				parent.start.x = this.data("ox") + dx;
				parent.start.y = this.data("oy") + dy;
				parent.update();
			},
			function(x, y) {
				this.data("ox", this.attr("cx"));
				this.data("oy", this.attr("cy"));
				Savage.mode = "dragging";
			},
			function() {
				Savage.mode = "none";
			}
		);

		this.stopSelector.undrag();
		this.stopSelector.drag(
			function(dx, dy, x, y, e) {
				parent.stop.x = this.data("ox") + dx;
				parent.stop.y = this.data("oy") + dy;
				parent.update();
			},
			function(x, y) {
				this.data("ox", this.attr("cx"));
				this.data("oy", this.attr("cy"));
				Savage.mode = "dragging";
			},
			function() {
				Savage.mode = "none";
				console.log(Savage.mode);
			}
		);	
	};

	this.unselect = function() {
		console.log("unselected!");
		this.selected = false;
		
		if (this.startSelector != null)
			this.startSelector.remove();
		if (this.stopSelector != null)
			this.stopSelector.remove();

		this.update();
	};

	this.draw = function() {

		this.raphaelobject = this.paper.path(this.path());

		this.unselect();

		var parent = this;
		this.raphaelobject.on("vclick",
			function() {
				console.log("raphaelobject on click");
				parent.select();
			}
		);

		this.raphaelobject.undrag();
		this.raphaelobject.drag(
			function(dx, dy, x, y, e) {
				parent.start.x = this.data("startx") + dx;
				parent.start.y = this.data("starty") + dy;
				parent.stop.x = this.data("stopx") + dx;
				parent.stop.y = this.data("stopy") + dy;
				parent.update();
			},
			function(x, y) {
				this.data("startx", parent.start.x);
				this.data("starty", parent.start.y);
				this.data("stopx", parent.stop.x);
				this.data("stopy", parent.stop.y);
				Savage.mode = "dragging";
			},
			function() {
				Savage.mode = "none";
				console.log(Savage.mode);
			}
		);
	};

	this.draw();

	this.remove = function() {
		if (this.startSelector != null)
			this.startSelector.remove();
		if (this.stopSelector != null)
			this.stopSelector.remove();
		if(this.glow != null)
			this.glow.remove();
		this.raphaelobject.remove();
		delete this;
	}

	this.toJSON = function() {
		return {
			type: "arrow",
			start: this.start.toJSON(),
			stop: this.stop.toJSON(),
			color: this.color
		};
	};

	this.fromJSON = function(json) {
		this.start.fromJSON(json["start"]);
		this.stop.fromJSON(json["stop"]);
		this.color = json["color"];
		this.update();
		return this;
	};

};