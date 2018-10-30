$('body').on('contextmenu', '#myCanvas', function(e){ return false; });

var x = 10;
var y = 10;

var rect_size = 20;
var grid_size_x = 30;
var grid_size_y = 20;
var game_state = 0;
var size = new Size(rect_size, rect_size);
var grid = [[]];
var bombe_counter;
var bombe_traped = 0;
var traped_counter;
var nb_bombe;
var clock_tick;
var clock;

function init_game(level){

    project.clear();

    var bomber_screen_center = new Point(70 + grid_size_x*rect_size, 70);
    var clock_center = new Point((grid_size_x*rect_size)/2, 100 + grid_size_y*rect_size);
    var traped_counter_center = new Point(70 + grid_size_x*rect_size, grid_size_y*rect_size - 70);

    clock = new PointText(clock_center);
    clock.justification = 'center';
    clock.fillColor = 'black';
    clock.fontSize = 30;
    clock.content = 0;

    bombe_counter = new PointText(bomber_screen_center);
    bombe_counter.justification = 'center';
    bombe_counter.fillColor = '#c12929';
    bombe_counter.fontSize = 30;
    bombe_counter.content = 0;   

    traped_counter = new PointText(traped_counter_center);
    traped_counter.justification = 'center';
    traped_counter.fillColor = '#7fc7af';
    traped_counter.fontSize = 30;
    traped_counter.content = 0;      

    for (i=0; i<=grid_size_x; i++){

        grid[i] = new Array();

        for (j=0; j<=grid_size_y; j++){

            var point = new Point(x + rect_size*i, y + rect_size*j);
            var shape = new Shape.Rectangle(point, size);

            shape.onMouseEnter = function(event) {
                this.opacity = '0.7';
            }

            shape.onMouseLeave = function(event) {
                this.opacity = '1';
            }            

            if (Math.random() > level){
                nb_bombe = 1;
                grid[i][j] = {"bombe" : 1, "rect" : shape, "near_bombe" : 0, "point" : point, "i" : i, "j" : j, "revealed" : false, "check" : 0, "text" : null};
            }else{
                nb_bombe = 0;
                grid[i][j] = {"bombe" : 0, "rect" : shape, "near_bombe" : 0, "point" : point, "i" : i, "j" : j, "revealed" : false, "check" : 0, "text" : null};
            }             

            // use for animation.
            setTimeout(function(_s, _b) { return function() {

                bombe_counter.content = bombe_counter.content*1 + _b;
                _s.strokeColor = 'black'; 
                _s.fillColor = "#29adcd";   

            };  }(shape, nb_bombe), (25*i) );       

        }

    }

    // seconde lecture
    for (i=0; i<=grid_size_x; i++){
        for (j=0; j<=grid_size_y; j++){

            grid[i][j].near_bombe = near_bombe(i,j);
                   
        }
    }

    clock_tick = setInterval(function () { clock.content = clock.content*1+1;  }, 1000);


}


function box_or_null(x,y){

     if (grid[x] != undefined && grid[x][y] != undefined)
        return grid[x][y];
    else
        return null;

}

function get_box_around(x,y){

    a = box_or_null(x,y+1);
    b = box_or_null(x+1,y+1);
    c = box_or_null(x+1,y);
    d = box_or_null(x-1,y);
    e = box_or_null(x-1,y+1);
    f = box_or_null(x,y-1);
    g = box_or_null(x+1,y-1);
    h = box_or_null(x-1,y-1);

    return [a,b,c,d,e,f,g,h];

}




function near_bombe(x,y){

    var blanck_rect = 0;
    var nb = 0;

    var me = grid[x][y];

    var Arround_me = get_box_around(x,y);

    for(var i = 0; i < Arround_me.length; i++){

       if (Arround_me[i] != null){

            if (Arround_me[i].bombe == 1){

                nb += 1;                
            }

        }

    }


    return nb;

}


function reveal_rect(r){

    r.revealed = true;

    if (r.near_bombe > 0) {

        var text = new PointText(new Point(r.point.x + 10 , r.point.y + 15 ));
        text.justification = 'center';
        text.fillColor = 'black';
        text.content = r.near_bombe;
        r.rect.fillColor = '#82f0ff';

    }

}

function game_over(){

    var win = (bombe_traped == bombe_counter.content*1);
    var score = Math.ceil((bombe_counter.content*1000)/(clock.content*1));

    game_state = -1;
    window.clearInterval(clock_tick);
    var bombe_color = "#ee0930";

    if (win){

        var bombe_color = "#4ca64c";
        clock.fontSize = 30;
        clock.content = "Well done ! score : " + score;        

    }else{

        clock.fontSize = 30;
        clock.content = "Try again..";

    }

    for (i=0; i<=grid_size_x; i++){
        for (j=0; j<=grid_size_y; j++){

            c = grid[i][j];

            setTimeout(function(x) { return function() {

                if (x.bombe == 1){
                    x.rect.fillColor = bombe_color;
                }else
                    x.rect.fillColor = "#aaa8aa";

            };  }(c), (25*i) );
                   
        }
    }


    paper.view.draw();

}

function reveal_map(x,y){

    var blanck_rect = 0;
    var near_bombe = 0;

    var me = grid[x][y];

    if (me.bombe == 1){

        game_over();

    }else if (me.near_bombe > 0){

        reveal_rect(me);

    } else {

        var Arround_me = get_box_around(x,y);

        for(var i = 0; i < Arround_me.length; i++){

           if (Arround_me[i] != null && Arround_me[i].revealed == false ){

                if (Arround_me[i].near_bombe > 0 && Arround_me[i].bombe == 0){

                    reveal_rect(Arround_me[i]);

                } else {

                    Arround_me[i].revealed = true;
                    reveal_map(Arround_me[i].i, Arround_me[i].j)

                   setTimeout(function(x) { return function() {

                        Arround_me[x].rect.fillColor = '#82f0ff';

                   }; }(i), i*25 );
                    

                }

            }

        }
    }

}



function onMouseDown(event) {

    var x = Math.ceil((event.point.x - (grid_size_x/2)) /rect_size) -1;
    var y = Math.ceil((event.point.y - (grid_size_y/2)) /rect_size) -1;  

    console.log("x : " + x + " y : " + y) ;

    var box = grid[x][y];

    if (game_state == 0 && (event.event.buttons == 1 || event.event.button == 0)) {

        reveal_map(x,y);
        //console.log(box);

    }else if(event.event.buttons == 2 || event.event.button == 2){

        if (box.check == 2){
            box.text.content = ""; 
            box.check = 0;           
        } else if (box.check == 1){

            traped_counter.content = traped_counter.content*1-1;
            box.text.content = "?"; 
            box.check = 2;     

            if (box.bombe == 1) 
                bombe_traped -=1;  

        } else if (box.check == 0){

            if (traped_counter.content*1 < bombe_counter.content*1){

                traped_counter.content = traped_counter.content*1+1;

                if (box.text != null){
                    box.text.content = "x"; 
                }else{
                    var check_text = new PointText(box.point.x + (rect_size/2), box.point.y + (rect_size/2) + 5);
                    check_text.justification = 'center';
                    check_text.fontSize = 16;
                    check_text.content = "x";                  
                    box.text = check_text;  
                }

                if (box.bombe == 1) 
                    bombe_traped +=1; 

                box.check = 1;

            }

        }

    }

    if (bombe_traped == bombe_counter.content*1){
        game_over();
    }

}

function restart(level){

    window.clearInterval(clock_tick);

    init_game(level);
    paper.view.draw();
    game_state = 0;
    bombe_traped = 0;
    clock.content = 0;
        
}


$("#restart_easy").click(function(){

    restart(0.9);

});

$("#restart_normal").click(function(){

    restart(0.8);

});

$("#restart_hard").click(function(){

    restart(0.7);

});


$(function(){

    init_game(0.8);
    paper.view.draw();

});


function onFrame(event) {
    // hack for fluid animation.
    paper.view.draw();

}

