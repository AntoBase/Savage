/*!
 * Savage v0.0.1 (http://labs.antobase.com/Savage/)
 * Copyright 2014-2015 AntoBase, BVBA.
 * Licensed under MIT (https://github.com/AntoBase/Savage/blob/master/LICENSE)
 */
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

	this.toJSON = function(){
		return { x: this.x, y: this.y};
	};

	this.fromJSON = function(json){
		this.x = json["x"];
		this.y = json["y"];
	};
};

Savage.Arrow = function(editor) {
	// json properties:
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.color = "#ff0000";

	this.paper = editor.paper;
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
		console.log("selected!");
		this.raphaelobject.attr({
			'stroke-width': 2,
			'stroke': '#00ff00',
			'fill': '#ff0000'
		});

		if (this.startSelector != null)
			this.startSelector.remove();
		if (this.stopSelector != null)
			this.stopSelector.remove();

		this.startSelector = this.paper.circle(this.start.x, this.start.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'
		});

		this.stopSelector = this.paper.circle(this.stop.x, this.stop.y, 6).attr({
			'fill': '#fff',
			'stroke': '#00f'
		});

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

		$(this.raphaelobject.node).attr("class", "selectable selected");
	};

	this.unselect = function() {
		console.log("unselected!");
		this.raphaelobject.attr({
			'stroke-width': 2,
			'stroke': '#ff0000',
			'fill': '#ff0000'
		});

		if (this.startSelector != null)
			this.startSelector.remove();
		if (this.stopSelector != null)
			this.stopSelector.remove();

		$(this.raphaelobject.node).attr("class", "selectable");
	};

	this.draw = function() {


		this.raphaelobject = this.paper.path(this.path());

		this.unselect();

		this.raphaelobject.glow({
			width: 10,
			fill: false,
			opacity: 0.5,
			offsetx: 0,
			offsety: 0,
			color: '#000000'
		});

		var parent = this;
		this.raphaelobject.click(
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


	this.remove = function(){
		this.raphaelobject.remove();
	}


	this.toJSON = function(){
		return { type:"arrow", start: this.start.toJSON(), stop: this.stop.toJSON()};
	};

	this.fromJSON = function(json){
		this.start.fromJSON(json["start"]);
		this.stop.fromJSON(json["stop"]);
		this.update();
		return this;
	};

};

Savage.Rectangle = function(editor) {
	this.start = new Savage.Point(-10, -10);
	this.stop = new Savage.Point(-100, -100);
	this.paper = editor.paper;
	this.raphaelobject = null;

	this.path = function() {

		return "M" + this.start.x + " " + this.start.y + //startpoint
			" L" + this.stop.x + "," + this.start.y +
			" L" + this.stop.x + " " + this.stop.y + //endpoint
			" L" + this.start.x + "," + this.stop.y + " Z";
	}

	this.select = function(){};
	this.unselect = function(){};

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

	this.remove = function(){
		this.raphaelobject.remove();
	}

	this.draw();

	this.update = function() {
		this.raphaelobject.attr("path", this.path());
	}

	this.toJSON = function(){
		return { type:"rectangle", start: this.start.toJSON(), stop: this.stop.toJSON()};
	};

	this.fromJSON = function(json){
		this.start.fromJSON(json["start"]);
		this.stop.fromJSON(json["stop"]);
		this.update();
		return this;
	};
};

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

	this.select = function(){};
	this.unselect = function(){};

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

	this.remove = function(){
		this.raphaelobject.remove();
	}

	this.draw();

	this.update = function() {
		this.array[this.array.length] = ["L", this.stop.x, this.stop.y];
		this.raphaelobject.attr("path", this.path());
	}

	this.toJSON = function(){
		return { type:"freedraw",  array: this.array, start: this.start.toJSON(), stop: this.stop.toJSON()};
	};

	this.fromJSON = function(json){
		this.start.fromJSON(json["start"]);
		this.stop = new Savage.Point(0, 0);
		this.stop.fromJSON(json["stop"]);
		this.array = JSON.parse(JSON.stringify(json["array"]));
		this.update();
		return this;
	};
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


Savage.Editor = function(editordiv) {

	//Variables:
	this.objectList = new Array();
	this.id = Savage.uniqueID();


	// Add the buttons and the canvas to the control.
	$("#" + editordiv).html(
		"    <div class='btn-group'>" +
		"        <button id='svg-editor-" + this.id + "-add-arrow' type='button' class='btn btn-default'>Add arrow</button>" +
		//"        <button id='svg-editor-" + this.id + "-add-text' type='button' class='btn btn-default'>Add Text</button>" +
		"        <button id='svg-editor-" + this.id + "-add-rectangle' type='button' class='btn btn-default'>Add rectangle</button>" +
		"        <button id='svg-editor-" + this.id + "-add-freedraw' type='button' class='btn btn-default'>Add freedraw</button>" +
		"        <button id='svg-editor-" + this.id + "-clear' type='button' class='btn btn-default'>Clear</button>" +
		//"        <button id='svg-editor-" + this.id + "-modify' type='button' class='btn btn-default'>Modify</button>" +
		"    </div>" +
		"    <div id='svg-editor-" + this.id + "' style='height: "+($("#"+editordiv).height()-46)+"px;width:100%;border:solid #000 1px;'></div>"
	);

	this.paper = Raphael("svg-editor-" + this.id, "100%", "100%");

	var mode = "none";
	var submode = "none";

	var drawer = new Savage.Drawer();

	var parent = this;

	$("#svg-editor-" + this.id + "-add-arrow").on('click', function() {
		mode = "add-arrow";
		drawer.tempObject = new Savage.Arrow(parent);
		submode = "none"
	});

	$("#svg-editor-" + this.id + "-add-rectangle").on('click', function() {
		mode = "add-rectangle";
		drawer.tempObject = new Savage.Rectangle(parent);
		submode = "none"
	});

	$("#svg-editor-" + this.id + "-add-text").on('click', function() {
		mode = "add-text";
		submode = "none"
	});

	$("#svg-editor-" + this.id + "-add-freedraw").on('click', function() {
		mode = "add-freedraw";
		drawer.tempObject = new Savage.FreeDraw(parent);
		submode = "none"
	});

	$("#svg-editor-" + this.id + "-modify").on('click', function() {
		mode = "modify";
		submode = "none"
	});

	$("#svg-editor-" + this.id + "-clear").on('click', function() {
		parent.clearEditor();
	});

	// setting the start point
	$("#svg-editor-" + this.id).on('vmousedown', function(e) {
		if (Savage.mode === "dragging")
			return;

		if (e.which === 1) {
			console.log(this.id + " on mousedown");
			console.log(Savage.mode);

			e.preventDefault();
			if (mode === "add-arrow" || mode === "add-rectangle" || mode === "add-freedraw") {
				var parentOffset = $(this).offset();
				drawer.startDrawing(e.pageX - parentOffset.left, e.pageY - parentOffset.top);
			}
		}
	});

	$("#svg-editor-" + this.id).on('vmousemove', function(e) {
		if (Savage.mode === "dragging")
			return;
		e.preventDefault();
		if (mode === "add-arrow" || mode === "add-rectangle" || mode === "add-freedraw") {
			var parentOffset = $(this).offset();
			drawer.update(e.pageX - parentOffset.left, e.pageY - parentOffset.top);
		}
	});

	// fixate the arrow
	$("#svg-editor-" + this.id).on('vmouseup', function(e) {
		if (Savage.mode === "dragging")
			return;

		parent.clearSelection();

		var index = parent.objectList.length;
		if (mode === "add-arrow") {
			if (drawer.finish(mode === "add-arrow")) {
				parent.objectList[index] = drawer.tempObject;
			}
			drawer.tempObject = new Savage.Arrow(parent);
		}
		if (mode === "add-rectangle") {
			if (drawer.finish(mode === "add-rectangle")) {
				parent.objectList[index] = drawer.tempObject;
			}
			drawer.tempObject = new Savage.Rectangle(parent);
		}
		if (mode === "add-freedraw") {
			if (drawer.finish(mode === "add-freedraw")) {
				parent.objectList[index] = drawer.tempObject;
			}
			drawer.tempObject = new Savage.FreeDraw(parent);
		}
	});

	this.saveToJSON = function() {
		var json = {
			objects: []
		};

		this.objectList.forEach(function(element, index, array) {
			json["objects"].push(element.toJSON());
		});

		return json;
	};

	this.loadFromJSON = function(json) {
		var objects = JSON.parse(json)["objects"];

		var parent = this;
		objects.forEach(function(element, index, array) {
			switch(element["type"]){
				case "arrow":
					parent.objectList.push((new Savage.Arrow(parent)).fromJSON(element));
					break;
				case "rectangle":
					parent.objectList.push((new Savage.Rectangle(parent)).fromJSON(element));
					break;
				case "freedraw":
					parent.objectList.push((new Savage.FreeDraw(parent)).fromJSON(element));
					break;
			}
		});
	};

	this.clearSelection = function() {
		this.objectList.forEach(function(element, index, array) {
			element.unselect();
		});
	};

	this.clearEditor = function() {
		console.log(parent.objectList);
		for (var i = 0; i < this.objectList.length; i++) {
			this.objectList[i].remove();
		};
		this.objectList = [];
	};
}

window.Savage = Savage;