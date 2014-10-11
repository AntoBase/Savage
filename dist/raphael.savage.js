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

};;Savage.FreeDraw = function(editor) {
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
};;var Savage = Savage || {};

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
};;var Savage = Savage || {};

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

	this.hasFocus = false;
	this.mouseabove = false;


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
		"    <div id='svg-editor-" + this.id + "' style='height: " + ($("#" + editordiv).height() - 46) + "px;width:100%;border:solid #000 1px;'></div>"
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

		console.log(e);

		if (e.which === 1 || e.which === 0) {
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

	$(document).keydown(function(e){
		console.log(e);
    	if(e.keyCode == 46 || e.keyCode == 8 ){

    		for (var i = 0; i < parent.objectList.length; i++) {
    			if(parent.objectList[i].selected){
    				parent.objectList[i].remove();
    				delete parent.objectList[i];
    			}
    		};

			parent.objectList = parent.objectList.filter(function(n){ return n != undefined }); // (JS 1.6 and above)

			e.preventDefault();
			return false;
    	}
	}) 

	$(document).click(function(e){
		parent.hasFocus = parent.mouseabove;

		console.log("Has focus = " + parent.hasFocus);

		if(!parent.hasFocus)
		{
			parent.clearSelection();
		}
	}) 

	$("#svg-editor-" + this.id).on('mouseenter', function(e) {
		console.log('enter control');
		parent.mouseabove = true;
	});

	$("#svg-editor-" + this.id).on('mouseleave', function(e) {
		console.log('leave control');
		parent.mouseabove = false;
	});

		$("#svg-editor-" + this.id).keyup( 
			function(e) {
				console.log("svg editor keyup" + e);
			}
		);

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
			switch (element["type"]) {
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

window.Savage = Savage;;Savage.Rectangle = function(editor) {
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