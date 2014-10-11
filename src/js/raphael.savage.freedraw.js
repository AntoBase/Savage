Savage.FreeDraw = function(editor) {
	this.stop = null;
	this.start = new Savage.Point(0, 0);
	this.paper = editor.paper;
	this.raphaelobject = null;
	this.array = new Array();
	this.array[0] = ["M", this.start.x, this.start.y];
	this.editor = editor;
	this.selected = false;
	this.color = "#ee0000";
	this.translation = new Savage.Point(0,0);

	this.path = function() {
		this.array[0] = ["M", this.start.x, this.start.y];
		return this.array;
	}

	this.update = function() {

		if(this.stop == null)
			return;

		if( this.array[this.array.length-1].x === this.stop.x && 
			this.array[this.array.length-1].y === this.stop.y)
			return;

		this.array[this.array.length] = ["L", this.stop.x, this.stop.y];

		this.raphaelobject.attr({
			"path": this.path(),
			'stroke-width': 2,
			'stroke': this.selected ? Savage.currenSelectedColor : this.color,
			'transform': ['t',this.translation.x,this.translation.y]
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
	}

	this.select = function() {
		this.editor.clearSelection();
		this.selected = true;

		console.log("freedraw selected");

		this.update();
	};
	this.unselect = function() {
		console.log("unselected!");
		this.selected = false;

		this.update();
	};

	this.draw = function() {

		this.raphaelobject = this.paper.path(this.path());

		this.unselect();

		var parent = this;
		this.raphaelobject.click(
			function() {
				console.log("freedraw on click");
				parent.select();
			}
		);

		this.raphaelobject.undrag();
		this.raphaelobject.drag(
			function(dx, dy, x, y, e) {
				parent.translation.x = this.data("translationx") + dx;
				parent.translation.y = this.data("translationy") + dy;

				parent.update();
			},
			function(x, y) {
				this.data("translationx", parent.translation.x);
				this.data("translationy", parent.translation.y);
				Savage.mode = "dragging";
			},
			function() {
				Savage.mode = "none";
				console.log(Savage.mode);
			}
		);
	}

	this.remove = function() {
		if(this.glow != null)
			this.glow.remove();
		this.raphaelobject.remove();
		delete this;
	}

	this.draw();



	this.toJSON = function() {
		return {
			type: "freedraw",
			array: this.array,
			start: this.start.toJSON(),
			stop: this.stop.toJSON(),
			translation: this.translation.toJSON()
		};
	};

	this.fromJSON = function(json) {
		this.start.fromJSON(json["start"]);
		this.stop = new Savage.Point(0, 0);
		this.stop.fromJSON(json["stop"]);
		this.array = JSON.parse(JSON.stringify(json["array"]));
		this.translation.fromJSON(json["translation"]);
		this.update();
		return this;
	};
};