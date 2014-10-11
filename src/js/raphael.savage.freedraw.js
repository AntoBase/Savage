Savage.FreeDraw = function(editor) {
	this.stop = null;
	this.start = new Savage.Point(0, 0);
	this.paper = editor.paper;
	this.raphaelobject = null;
	this.array = new Array();
	this.array[0] = ["M", this.start.x, this.start.y];

	this.path = function() {
		this.array[0] = ["M", this.start.x, this.start.y];
		return this.array;
	}

	this.select = function() {};
	this.unselect = function() {};

	this.draw = function() {

		this.raphaelobject = this.paper.path(this.path()).attr({
			'stroke-width': 2,
			'stroke': '#ff0000'
		});

		var parent = this;
		this.raphaelobject.click(
			function() {
				console.log("raphaelobject on click");
				parent.select();
			}
		);
	}

	this.remove = function() {
		this.raphaelobject.remove();
	}

	this.draw();

	this.update = function() {
		this.array[this.array.length] = ["L", this.stop.x, this.stop.y];
		this.raphaelobject.attr("path", this.path());
	}

	this.toJSON = function() {
		return {
			type: "freedraw",
			array: this.array,
			start: this.start.toJSON(),
			stop: this.stop.toJSON()
		};
	};

	this.fromJSON = function(json) {
		this.start.fromJSON(json["start"]);
		this.stop = new Savage.Point(0, 0);
		this.stop.fromJSON(json["stop"]);
		this.array = JSON.parse(JSON.stringify(json["array"]));
		this.update();
		return this;
	};
};