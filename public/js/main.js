// Boilerplate Canvas Code
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasUi = document.getElementById("canvasUi");
var ctxUi = canvasUi.getContext("2d");
var canvasHeight = canvas.height;
var canvasWidth = canvas.width; 

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

window.requestAnimationFrame = requestAnimationFrame;

function animate(time) {           // Animation loop
	update(time);
	draw(time);                     // A function that draws the current animation frame
	requestAnimationFrame(animate); // Keep the animation going
};


// Classes
Player = function(name, x, y) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.gX = x;
	this.gY = y;
	this.rect = new Rectangle(x,y,32,32);
	this.img;

	this.sprite = "default";
	this.moving = false;
}

Sprite = function(x, y, w, h, imgIn) {
	this.rect = new Rectangle(x, y, w, h)
	this.image = imgIn;
	
	this.SetPosition = function(x, y) {
		this.rect.x = x;
		this.rect.y = y;
	};
	
	this.Draw = function(ctx) {
		ctx.drawImage(this.image, this.rect.x, this.rect.y);
	}
	
	this.changeImg = function(imgIn) {
		this.image = imgIn;
	}
};


// Socket.io Initilization
var socket = io.connect();

// Store loggedIn Status
var loggedIn = false;  // Triggers name selection hide
var initilized = false; // Checks to see if the player list has been retrieved
var localPlayer = new Rectangle(0,0,0,0);
var username = null;
var pSprite;

// Store game game timings;
var gameTime;
var nTime = new Date();
var dTime = 1;
var pTime = new Date();
var fps;

// Store player sprites
var maleSprite = "img/psprite1.png";
var femaleSprite = "img/psprite2.png";

// Store Interface Status (focus)
var gameFocus = true;
var enterChatTime = new Date(); // Prevents the submit enter from self triggering

// jQuery event Handlers
$(document).ready(function(){
	$('#canvasWrapper').hide();

	$('#loginForm').submit(function(e){
		// Get the list of players:
		socket.emit('get players');
		for (i = 0; i < players.length; i++) {
			if ($("#nameField").val() ===  players[i].name) {
				return;
			}
		}

		e.preventDefault();
		username = $("#nameField").val();
		pSprite = $('input:radio[name=sprite]:checked').val();
		loggedIn = true;
		$('#canvasWrapper').show();
		$('#loginWrapper').hide();

		// The local player is the first player in the local array
		// push local player onto the local stack and to the server
		players.push(new Player(username, 100, 100));
		players[players.length-1].sprite = pSprite;
		if (pSprite === "male") {
			playersAnimation.push(new Animation(32, 32, 0, 0, 3, maleSprite, 3, 3, 4));
		} else if (pSprite === "female") {
			playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
		} else {
			playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
		}
		localPlayer = players[players.length-1];
		localPlayerAni = playersAnimation[playersAnimation.length-1];
		localPlayerAni.position.x = localPlayer.rect.x;
		localPlayerAni.position.y = localPlayer.rect.y;
		socket.emit('player joined', players[players.length-1]);

	});

	$('#msgForm').submit(function(e){
		e.preventDefault();
		socket.emit('send dialog', username, $('#msgField').val());
		$('#msgField').val("");
		$('#canvas').focus();
		enterChatTime = new Date();
		gameFocus = true;
	});

	$('#msgField').focusin(function(){
		gameFocus = false;
	});

	$('#msgField').focusout(function(){
		gameFocus = true;
	});
});


// Game Code Begins Here:
// players array to hold the Rectangles of all connected players
var players = [];
// parallel array for Animation classes
var playersAnimation = [];

// Holds the player properties.
var playerSpeed = 150;

// holds the messages
var messages = [];

// Sprites
// Maps / Backgrounds:
var testBg = new Image(); 
testBg.src = "img/testBg.jpg";
var testBgSprite = new Sprite(0, 0, 1216, 964, testBg);

// Current map
var currentMap = testBgSprite;


// Server Updates (remember, async);
socket.on('new player', function(data){
	// Pushes the player object and parallel animation object
	players.push(new Player(data.name, data.x, data.y));
	players[players.length-1].sprite = data.sprite;
	if (data.sprite === "male") {
		playersAnimation.push(new Animation(32, 32, 0, 0, 3, maleSprite, 3, 3, 4));
	} else if (data.sprite === "female") {
		playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
	} else {
		playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
	}
});

// Grabs a list of all of the current players and their location
socket.on('player list', function(data) {
	if (initilized === false) {
		for (i = 0; i < data.length; i++) {	
			if (data[i].name != username) {
				players.push(new Player(data[i].name, data[i].x, data[i].y));
				players[players.length-1].sprite = data[i].sprite;

				if (data[i].sprite === "male") {
					playersAnimation.push(new Animation(32, 32, 0, 0, 3, maleSprite, 3, 3, 4));
				} else if (data[i].sprite === "female") {
					playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
				} else {
					playersAnimation.push(new Animation(32, 32, 0, 0, 3, femaleSprite, 3, 3, 4));
				}

				playersAnimation[playersAnimation.length-1].position.x = data[i].rect.x;
				playersAnimation[playersAnimation.length-1].position.y = data[i].rect.y;
				players[players.length-1].gX = data[i].gX;
				players[players.length-1].gY = data[i].gY;
			}
		}

		initilized = true;
	}
});

// A new global message (for message box)
socket.on('new message', function(data){
	messages.push(data);
});

// A new "/say" from a player
socket.on('new dialog', function(name, msg){
	messages.push(name + ": " + msg);
});

// Moves a player based on the player object passed from the server
socket.on('move player', function(data, direction){
	for(i = 0; i < players.length; i++) {
		if (players[i].name === data.name) {
			players[i].gX = data.gX;
			players[i].gY = data.gY;
			players[i].moving = data.moving;

			if (direction == "left") {
				playersAnimation[i].SetRow(1);
			} else if (direction == "right") {
				playersAnimation[i].SetRow(2);
			} else if (direction == "up") {
				playersAnimation[i].SetRow(3);
			} else if (direction == "down") {
				playersAnimation[i].SetRow(0);
			}
		}
	}
});

// Removes a disconnected player from the local client
socket.on('player disconnect', function(data){
	for(i = 0; i < players.length; i++) {
		if (players[i].name === data){
			players.splice(i, 1);
			playersAnimation.splice(i, 1);
		}
	}
})

// Auxilary update functions:
function gLocationUpdate() {
	localPlayer.gX = localPlayer.rect.x - currentMap.rect.x;
	localPlayer.gY = localPlayer.rect.y - currentMap.rect.y;
}

function gPlayerUpdate() {
	for(i = 0; i < players.length; i++) {
		if (players[i].name != localPlayer.name) {
			players[i].rect.x = currentMap.rect.x + players[i].gX;
			players[i].rect.y = currentMap.rect.y + players[i].gY;
			playersAnimation[i].position.x = players[i].rect.x;
			playersAnimation[i].position.y = players[i].rect.y;
		}
	}
}

// Local Updates
function update() {
	// Calculates the time delta for fps independence
	cTime = new Date();
	dTime = (cTime - pTime) / 1000;
	fps   = Math.round(1 / dTime);
	pTime = cTime;

	// Stop the player animation if the player isn't moving

	// If logged in, start the canvas update game block
	if (loggedIn == true) {
		// Movement
		if (input.d === true && gameFocus === true) {
			localPlayer.moving = true;
			localPlayerAni.SetRow(2);
			if (localPlayer.rect.x > 430 && currentMap.rect.x + currentMap.rect.width > 580) {
				currentMap.rect.x -= Math.round(playerSpeed * dTime);
			} else {
				if (localPlayer.rect.x + 25 < 580) {
					localPlayer.rect.x += Math.round(playerSpeed * dTime);
				}
			}
			gLocationUpdate();
			socket.emit('player moved', localPlayer, "right");
		}

		else if (input.a === true && gameFocus === true) {
			localPlayer.moving = true;
			localPlayerAni.SetRow(1);
			if (localPlayer.rect.x < 150 && currentMap.rect.x < 0) {
				currentMap.rect.x += Math.round(playerSpeed * dTime);
			} else {
				localPlayer.rect.x -= Math.round(playerSpeed * dTime);
			}
			gLocationUpdate();
			socket.emit('player moved', localPlayer, "left");
		}

		else if (input.w === true && gameFocus === true) {
			localPlayer.moving = true;
			localPlayerAni.SetRow(3);
			if (localPlayer.rect.y < 120 && currentMap.rect.y < 0) {
				currentMap.rect.y += Math.round(playerSpeed * dTime);
			} else {
				localPlayer.rect.y -= Math.round(playerSpeed * dTime);
			}
			gLocationUpdate();
			socket.emit('player moved', localPlayer, "up");
		}

		else if (input.s === true && gameFocus === true) {
			localPlayer.moving = true;
			localPlayerAni.SetRow(0);
			if (localPlayer.rect.y > 350 && currentMap.rect.y + currentMap.rect.height > 500) {
				currentMap.rect.y -= Math.round(playerSpeed * dTime);
			} else {
				localPlayer.rect.y += Math.round(playerSpeed * dTime);
			}
			gLocationUpdate();
			socket.emit('player moved', localPlayer, "down");
		}

		if (input.enter == true && gameFocus === true && (gameTime.getTime() - enterChatTime.getTime()) > 1000) {
			$('#msgField').focus();
			gameFocus = false;
		};
	}

	// Update all players based on the latest global location
	gPlayerUpdate();
    
	if (loggedIn === true) {
		for (i = 0; i < players.length; i++) {
			if (players[i].moving === true) {
				playersAnimation[i].Update();
				playersAnimation[i].position.x = players[i].rect.x;
				playersAnimation[i].position.y = players[i].rect.y;	
			} else {
				playersAnimation[i].SetColumn(1);
			}
		}
		
		// Update player animations
		if (localPlayer.moving === true) {
			localPlayerAni.Update();
			localPlayerAni.position.x = localPlayer.rect.x;
			localPlayerAni.position.y = localPlayer.rect.y;
		} else {
			localPlayerAni.SetColumn(1);
		}
	}

	// Store the latest gameTime
	gameTime = new Date();

	// Stop the player animation if the player isn't moving
	for(i = 0; i < players.length; i++) {
		players[i].moving = false;
	}
}

function draw() {
	if (loggedIn === true) {
		ctx.clearRect(0, 0, canvas.height,canvas.width);
		ctx.fillStyle = "#AAA";
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		// Render Background Sprites
		testBgSprite.Draw(ctx);

		// Render the players
		for(i=0; i<players.length; i++) {
			ctx.fillStyle = "#000";
			ctx.font = "12px Arial";
			ctx.fillText(players[i].name, players[i].rect.x - 5, players[i].rect.y - 5);
			//players[i].rect.Draw(ctx);
			playersAnimation[i].Draw(ctx);
		}
		localPlayerAni.Draw(ctx);

		// Render the player list box
		ctx.fillStyle = "#222"
		ctx.fillRect(580, 0, 120, 500);
		ctx.fillStyle = "#FFF";
			ctx.font = "12px Arial";
			ctx.fillText("Connected Players", 590, 15);
			ctx.fillText("-------------------------", 590, 30);
		for(i = 0; i < players.length; i++) {
			ctx.fillText(players[i].name, 590, 47 + (i * 15));
		}

		// Render message pane
		ctx.fillStyle = "#222"
		ctx.fillRect(0, 500, 700, 150);

		// Render the message boxs
		ctx.fillStyle = "#FFF";
		ctx.font = "12px Arial";
		for (i = 0; i < messages.length; i++) {
			messages.reverse();
			if (i < 10) {
				ctx.fillText(messages[i], 5, 640 - (14 * i));
			}
			messages.reverse();
		}

		// Render FPS
		ctx.fillText("FPS: " + fps, 650, 638);
	}
}

animate();