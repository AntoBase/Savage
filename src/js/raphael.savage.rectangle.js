Savage.Rectangle = function(editor) {
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.paper = editor.paper;
	this.raphaelobject = null;
	this.color = "#ee0000";
	this.editor = editor;
	this.startSelector = null;
	this.stopSelector = null;
	this.resizing = false;
	this.glow = null;
	this.selected = false;

	this.path = function() {

		return "M" + this.start.x + " " + this.start.y + //startpoint
			" L" + this.stop.x + "," + this.start.y +
			" L" + this.stop.x + " " + this.stop.y + //endpoint
			" L" + this.start.x + "," + this.stop.y + " Z";
	}

	this.update = function() {
		this.raphaelobject.attr({
			"path": this.path(),
			'stroke-width': 2,
			'stroke': this.selected ? Savage.currenSelectedColor : this.color//,
			//'fill': this.color
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

		this.raphaelobject = this.paper.path(this.path()).attr({
			'stroke-width': 2,
			'stroke': '#ff0000'
		});

		var parent = this;
		$(this.raphaelobject.node).on("vclick",
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
	}

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

	this.draw();

	this.toJSON = function() {
		return {
			type: "rectangle",
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