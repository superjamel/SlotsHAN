
var IMAGE_HEIGHT = 150;
var IMAGE_TOP_MARGIN = 5;
var IMAGE_BOTTOM_MARGIN = 5;
var SLOT_SEPARATOR_HEIGHT = 2;
var SLOT_HEIGHT = IMAGE_HEIGHT + IMAGE_TOP_MARGIN + IMAGE_BOTTOM_MARGIN + SLOT_SEPARATOR_HEIGHT; // how many pixels one slot image takes
var RUNTIME = 3000; // how long all slots spin before starting countdown
var SPINTIME = 1000; // how long each slot spins at minimum
var ITEM_COUNT = 8 // item count in slots
var SLOT_SPEED = 15; // how many pixels per second slots roll
var DRAW_OFFSET = 45 // how much draw offset in slot display from top

var BLURB_TBL = [
    'No win!',
    'Good!',
    'Excellent!',
    'JACKPOT!'
];

function shuffleArray( array ) {

    for (i = array.length - 1; i > 0; i--) {
	var j = parseInt(Math.random() * i)
	var tmp = array[i];
	array[i] = array[j]
	array[j] = tmp;
    }
}

function CreateImageFromText(value){
	var ctx = document.createElement('canvas').getContext('2d');
	ctx.height = "256px";
	ctx.width = "256px";
	ctx.font="10px";
	ctx.fillText(value.toString(),0,40);
	return ctx.canvas.toDataURL();
}


// Images must be preloaded before they are used to draw into canvas
function preloadImages(itemsReel1,itemsReel2,itemsReel3,itemsReel4 ,callback ) {

    function _preload( asset ) {
	asset.img = new Image();
	asset.img.src = CreateImageFromText(asset.id);

	asset.img.addEventListener("load", function() {
	    _check();
	}, false);

	asset.img.addEventListener("error", function(err) {
	    _check(err, asset.id);
	}, false);
    }

    var loadc = 0;
    function _check( err, id ) {
	if ( err ) {
	    alert('Failed to load ' + id );
	}
	loadc++;
	if ( (itemsReel1.length+itemsReel2.length+itemsReel3.length+itemsReel4.length) == loadc ) 
	    return callback()
    }

    itemsReel1.forEach(function(asset) {
	_preload( asset );
    });
    itemsReel2.forEach(function(asset) {
	_preload( asset );
    });
    itemsReel3.forEach(function(asset) {
	_preload( asset );
    });
    itemsReel4.forEach(function(asset) {
	_preload( asset );
    });
}

function copyArray( array ) {
    var copy = [];
    for( var i = 0 ; i < array.length; i++) {
	copy.push( array[i] );
    }
    return copy;
}

var game = null;
function SlotGame() {

    game = new Game();
    //Names for every reel
    var itemsReel1= [ 
	{id: 'Klanten'},
	{id: 'Aandeelhouders'},
	{id: 'Leveranciers'},
	{id: 'Werknemers'},
	{id: 'Overheden'},
	{id: 'Media'},
	{id: 'Omwonenden'}
    ];

     //Names for every reel
    var itemsReel2 = [ 
	{id: 'Gebruik'},
	{id: 'Milieu'},
	{id: 'Advies'},
	{id: 'Marketing'},
	{id: 'Intelerctueel eigendom'},
	{id: 'Bemiddeling'},
	{id: 'Zekerheid-veiligheid'},
	{id: 'Persoonlijke groei'},
    ];
       
    //Names for every reel
    var itemsReel3 = [ 
	{id: 'Eenmaling'},
	{id: 'Periodiek'},
	{id: 'Continu'},
	{id: 'Vooraf'},
	{id: 'Achteraf'}
    ];

     //Names for every reel
    var itemsReel4 = [ 
	{id: 'Hoeveelheid producten'},
	{id: 'Aantaql klanten voor 1 product'},
	{id: 'Geen voorwaarden'}
    ];   
    $('canvas').attr('height', IMAGE_HEIGHT * ITEM_COUNT * 2);
    $('canvas').css('height', IMAGE_HEIGHT * ITEM_COUNT * 2);
    $('canvas').css('width', IMAGE_HEIGHT);
    game.items = itemsReel1;

    // load assets and predraw the reel canvases
    preloadImages( itemsReel1,itemsReel2,itemsReel3,itemsReel4, function() {

	// images are preloaded

	// draws canvas strip
	function _fill_canvas( canvas, items ) {
	    ctx = canvas.getContext('2d');
	    ctx.fillStyle = '#ddd';

	    for (var i = 0 ; i < items.length ; i++) {
		var asset = items[i];
		ctx.save();
		ctx.shadowColor = "rgba(0,0,0,0.5)";
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;
		ctx.shadowBlur = 5;
		ctx.drawImage(asset.img, 3, i * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
		ctx.drawImage(asset.img, 3, (i + ITEM_COUNT) * SLOT_HEIGHT + IMAGE_TOP_MARGIN);
		ctx.restore();
		ctx.fillRect(0, i * SLOT_HEIGHT, 80, SLOT_SEPARATOR_HEIGHT);
		ctx.fillRect(0, (i + ITEM_COUNT)  * SLOT_HEIGHT, 80, SLOT_SEPARATOR_HEIGHT);
	    }
	}
	// Draw the canvases with shuffled arrays
	game.items1 = copyArray(itemsReel1);
	game.items2 = copyArray(itemsReel2);
	game.items3 = copyArray(itemsReel3);
	game.items4 = copyArray(itemsReel4);
	shuffleArray(game.items1);
	_fill_canvas( game.c1[0], game.items1 );
	game.items2 = copyArray(itemsReel2);
	shuffleArray(game.items2);
	_fill_canvas( game.c2[0], game.items2 );
	game.items3 = copyArray(itemsReel2);
	shuffleArray(game.items3);
	_fill_canvas( game.c3[0], game.items3 );
	game.items4 = copyArray(itemsReel3);
	shuffleArray(game.items4);
	_fill_canvas( game.c4[0], game.items4 );

	game.resetOffset =  (ITEM_COUNT + 4) * SLOT_HEIGHT;
	game.loop();
    });

    $('#play').click(function(e) {
	// start game on play button click
	$('h1').text('Rolling!');
	game.restart();
    });

    // Show reels for debugging
    var toggleReels = 1;
    $('#debug').click(function() {
	toggleReels = 1 - toggleReels;
	if ( toggleReels ) {
	    $('#reels').css('overflow', 'hidden' );
	} else {
	    $('#reels').css('overflow', 'visible' );
	}
    });
}

function Game() {

    // reel canvases
    this.c1 = $('#canvas1');
    this.c2 = $('#canvas2');
    this.c3 = $('#canvas3');
	this.c4 = $('#canvas4');
	
	this.c1Locked = false;
	this.c2Locked = false;
	this.c3Locked = false;
	this.c4Locked = false;
	
    // set random canvas offsets
    this.offset1 = -parseInt(Math.random() * ITEM_COUNT ) * SLOT_HEIGHT;
    this.offset2 = -parseInt(Math.random() * ITEM_COUNT ) * SLOT_HEIGHT;
    this.offset3 = -parseInt(Math.random() * ITEM_COUNT ) * SLOT_HEIGHT;
	this.offset4 = -parseInt(Math.random() * ITEM_COUNT ) * SLOT_HEIGHT;
    this.speed1 = this.speed2 = this.speed3 = this.speed4 = 0;
    this.lastUpdate = new Date();

    // Needed for CSS translates
    this.vendor = 
	(/webkit/i).test(navigator.appVersion) ? '-webkit' :
    	(/firefox/i).test(navigator.userAgent) ? '-moz' :
	(/msie/i).test(navigator.userAgent) ? 'ms' :
    	'opera' in window ? '-o' : '';
    
    this.cssTransform = this.vendor + '-transform';
    this.has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())  
    this.trnOpen       = 'translate' + (this.has3d ? '3d(' : '(');
    this.trnClose      = this.has3d ? ',0)' : ')';
    this.scaleOpen     = 'scale' + (this.has3d ? '3d(' : '(');
    this.scaleClose    = this.has3d ? ',0)' : ')';

    // draw the slots to initial locations
    this.draw( true );
}

// Restar the game and determine the stopping locations for reels
Game.prototype.restart = function() {
    this.lastUpdate = new Date();
    this.speed1 = this.speed2 = this.speed3 = this.speed4 = SLOT_SPEED
    // function locates id from items
    function _find( items, id ) {
	for ( var i=0; i < items.length; i++ ) {
	    if ( items[i].id == id ) return i;
	}
    }
	

    // uncomment to get always jackpot
    //this.result1 = _find( this.items1, 'gold-64' );
    //this.result2 = _find( this.items2, 'gold-64' );
    //this.result3 = _find( this.items3, 'gold-64' );

    // get random results
    this.result1 = parseInt(Math.random() * this.items1.length)
    this.result2 = parseInt(Math.random() * this.items2.length)
    this.result3 = parseInt(Math.random() * this.items3.length)
	this.result4 = parseInt(Math.random() * this.items4.length)

    // Clear stop locations
    this.stopped1 = false;
    this.stopped2 = false;
    this.stopped3 = false;
	this.stopped4 = false;

	if(this.c1Locked == true)
	{
		this.speed1 = 0;
		this.stopped1 = true;
	}
	if(this.c2Locked == true)
	{
		this.speed2 = 0;
		this.stopped2 = true;
	}
	
	if(this.c3Locked == true)
	{
		this.speed3 = 0;
		this.stopped3 = true;
	}
	if(this.c4Locked == true)
	{
		this.speed4 = 0;
		this.stopped4 = true;
	}
    // randomize reel locations
    this.offset1 = -parseInt(Math.random( ITEM_COUNT )) * SLOT_HEIGHT;
    this.offset2 = -parseInt(Math.random( ITEM_COUNT )) * SLOT_HEIGHT;
    this.offset3 = -parseInt(Math.random( ITEM_COUNT )) * SLOT_HEIGHT;
	this.offset4 = -parseInt(Math.random( ITEM_COUNT )) * SLOT_HEIGHT;

    $('#results').hide();

    this.state = 1;
}

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

Game.prototype.loop = function() {
    var that = this;
    that.running = true;
    (function gameLoop() {
	that.update();
	that.draw();
	if (that.running) {
	    requestAnimFrame( gameLoop );
	}
    })();
	this.c1[0].addEventListener('click', function() {if (game.speed1 == 0 && game.c1Locked == false){ game.c1.css({"border-color": "#C1E0FF", 
             "border-width":"10px", 
             "border-style":"solid"});game.c1Locked =true; } else {game.c1Locked = false; game.c1.css({"border-color": "#C1E0FF", 
             "border-width":"0px", 
             "border-style":"solid"})  } }, false);
	this.c2[0].addEventListener('click', function() {if (game.speed1 == 0 && game.c2Locked == false){game.c2.css({"border-color": "#C1E0FF", 
             "border-width":"1px", 
             "border-style":"solid"});game.c2Locked =true; } else{game.c2Locked = false; game.c2.css({"border-color": "#C1E0FF", 
             "border-width":"0px", 
             "border-style":"solid"}) } }, false);
	this.c3[0].addEventListener('click', function() {if (game.speed1 == 0 && game.c3Locked == false){ game.c3.css({"border-color": "#C1E0FF", 
             "border-width":"10px", 
             "border-style":"solid"}); game.c3Locked =true;} else{game.c4Locked = false; game.c3.css({"border-color": "#C1E0FF", 
             "border-width":"0px", 
             "border-style":"solid"}) } }, false);
	this.c4[0].addEventListener('click', function() {if (game.speed1 == 0 && game.c3Locked == false){game.c4.css({"border-color": "#C1E0FF", 
             "border-width":"10px", 
             "border-style":"solid"}) ; game.c4Locked =true; } else { game.c4Locked = false; game.c4.css({"border-color": "#C1E0FF", 
             "border-width":"0px", 
             "border-style":"solid"}) } }, false);
}  

Game.prototype.update = function() {

    var now = new Date();
    var that = this;

    // Check slot status and if spun long enough stop it on result
    function _check_slot( offset, result, locked ) {
	if ( now - that.lastUpdate > SPINTIME ) {
	    var c = parseInt(Math.abs( offset / SLOT_HEIGHT)) % ITEM_COUNT;
	    if ( c == result ) {
		if ( result == 0 ) {
		    if ( Math.abs(offset + (ITEM_COUNT * SLOT_HEIGHT)) < (SLOT_SPEED * 1.5)) {
			return true; // done
		    }
		} else if ( Math.abs(offset + (result * SLOT_HEIGHT)) < (SLOT_SPEED * 1.5)) {
		    return true; // done
		} else if(locked == true){return true; }
	    }else if(locked == true){return true; }
	}
	return false;
    }

    switch (this.state) {
    case 1: // all slots spinning
	if (now - this.lastUpdate > RUNTIME) {
	    this.state = 2;
	    this.lastUpdate = now;
	}
	break;
    case 2: // slot 1
	this.stopped1 = _check_slot( this.offset1, this.result1, this.c1Locked );
	if ( this.stopped1 ) {
	    this.speed1 = 0;
	    this.state++;
	    this.lastUpdate = now;
	}
	break;
    case 3: // slot 1 stopped, slot 2
	this.stopped2 = _check_slot( this.offset2, this.result2,this.c2Locked );
	if ( this.stopped2 ) {
	    this.speed2 = 0;
	    this.state++;
	    this.lastUpdate = now;
	}
	break;
    case 4: // slot 2 stopped, slot 3
	this.stopped3 = _check_slot( this.offset3, this.result3,this.c3Locked );
	if ( this.stopped3 ) {
	    this.speed3 = 0;
	    this.state++;
	}
	break;
    case 5: // slot 3 stopped, slot 4
	this.stopped4 = _check_slot( this.offset4, this.result4,this.c4Locked );
	if ( this.stopped4 ) {
	    this.speed4 = 0;
	    this.state++;
	}
	break;	
    case 6: // slots stopped 
	if ( now - this.lastUpdate > 3000 ) {
	    this.state = 6;
	}
	break;
    case 7: // check results
	var ec = 0;

	//$('#results').show();
	if (that.items1[that.result1].id == 'gold-64') {
	    ec++;
	}
	if (that.items2[that.result2].id == 'gold-64') {
	    ec++;
	}
	if (that.items3[that.result3].id == 'gold-64') {
	    ec++;
	}
	if (that.items4[that.result4].id == 'gold-64') {
	    ec++;
	}
	//$('#multiplier').text(ec);

	//$('#status').text(BLURB_TBL[ec]);

	this.state = 0;
	break;
    case 0: // game ends
	break;
    default:
    }
    this.lastupdate = now;
}

Game.prototype.draw = function( force ) {

    if (this.state >= 7 ) return;

    // draw the spinning slots based on current state
    for (var i=1; i <= 4; i++ ) {
	var resultp = 'result'+i;
	var stopped = 'stopped'+i;
	var speedp = 'speed'+i;
	var offsetp = 'offset'+i;
	var cp = 'c'+i;
	if (this[stopped] || this[speedp] || force) {
	    if (this[stopped]) {
		this[speedp] = 0;
		var c = this[resultp]; // get stop location
		this[offsetp] = -(c * SLOT_HEIGHT);

		if (this[offsetp] + DRAW_OFFSET > 0) {
		    // reset back to beginning
		    this[offsetp] = -this.resetOffset + SLOT_HEIGHT * 3;
		}

	    } else {
		this[offsetp] += this[speedp];
		if (this[offsetp] + DRAW_OFFSET > 0) {
		    // reset back to beginning
		    this[offsetp] = -this.resetOffset + SLOT_HEIGHT * 3 - DRAW_OFFSET;
		}
	    }
		console.log(this);
	    // translate canvas location
	    this[cp].css(this.cssTransform, this.trnOpen + '0px, '+(this[offsetp] + DRAW_OFFSET)+'px' + this.trnClose);
	}
    }
}
