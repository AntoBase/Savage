console.log('This would be the main JS file.');

$(function() {
  
    var paper = Raphael("svg-editor", "100%", "100%");

    var mode = "none";
    var submode = "none";

    var drawer = new Savage.Drawer();
    var objectList = this.array = new Array();

    $("#svg-editor-add-arrow").on('click', function(){ mode = "add-arrow"; drawer.tempObject = new Savage.Arrow(paper);submode = "none" });
    $("#svg-editor-add-rectangle").on('click', function(){ mode = "add-rectangle"; drawer.tempObject = new Savage.Rectangle(paper);submode = "none"});

    $("#svg-editor-add-text").on('click', function(){ mode = "add-text"; submode = "none"});
    $("#svg-editor-add-freedraw").on('click', function(){ mode = "add-freedraw"; drawer.tempObject = new Savage.FreeDraw(paper); submode = "none"});
    $("#svg-editor-modify").on('click', function(){ mode = "modify"; submode = "none"});

    // setting the start point
    $("#svg-editor").on('vmousedown', function(e){
        if(Savage.mode === "dragging")
            return;

        if(e.which===1){
            console.log("svg-editor on mousedown");
            console.log(Savage.mode);

            e.preventDefault();
            if(mode === "add-arrow" || mode === "add-rectangle" || mode === "add-freedraw"){
                var parentOffset = $("#svg-editor").offset(); 
                drawer.startDrawing(e.pageX - parentOffset.left, e.pageY - parentOffset.top);     
            }
        }
    });

    $("#svg-editor").on('vmousemove', function(e){
        if(Savage.mode === "dragging")
            return;
        e.preventDefault();
        if(mode === "add-arrow" || mode === "add-rectangle" || mode === "add-freedraw") {
            var parentOffset = $("#svg-editor").offset(); 
            drawer.update(e.pageX - parentOffset.left, e.pageY - parentOffset.top);
        }
    });

    // fixate the arrow
    $("#svg-editor").on('vmouseup', function(e){
        if(Savage.mode === "dragging")
            return;
        objectList.forEach(function(element, index, array)
            {
                element.unselect();
            });
        var index = objectList.length;
        if(mode === "add-arrow"){
            if(drawer.finish(mode === "add-arrow")){
                objectList[index] = drawer.tempObject;
                objectList[index].raphaelobject.click( 
                    function() { 
                        console.log("raphaelobject on mousedown");
                        objectList[index].select();
                    }
                );   
            }
            drawer.tempObject = new Savage.Arrow(paper);
        }
        if(mode === "add-rectangle"){
            if(drawer.finish(mode === "add-rectangle")){
                objectList[index] = drawer.tempObject;
                objectList[index].raphaelobject.click( 
                    function() { 
                        objectList[index].select();
                    }
                );   
            }
            drawer.tempObject = new Savage.Rectangle(paper);
        }
         if(mode === "add-freedraw"){
            if(drawer.finish(mode === "add-freedraw")){           
                objectList[index] = drawer.tempObject;
                objectList[index].raphaelobject.click( 
                    function(event) { 
                        console.log(event);
                        event.stopPropagation();
                        objectList[index].select();
                    }
                );   
            }
            drawer.tempObject = new Savage.FreeDraw(paper);
        }
    });
});
