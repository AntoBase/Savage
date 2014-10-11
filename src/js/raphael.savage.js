var Savage = Savage || {};

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

window.Savage = Savage;