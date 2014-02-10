// Express and SocketIO
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Static web server and listen on 8000;
app.use(express.static(__dirname+'/public'));
var port = Number(process.env.PORT || 5000);
server.listen(port, function() {
  console.log("Listening on " + port);
});

var connectedPlayers = [];

/* -----------  USED FOR NON STATIC HTTP SERVER ---------------
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/test.html');
})
*/

io.sockets.on('connection', function(socket){
	
	socket.on('player joined', function(data){
		socket.alias = data.name;
		connectedPlayers.push(data);
		console.log("Total connected players: " + connectedPlayers.length);
		io.sockets.emit('new message', data.name + " has connected!");
		socket.broadcast.emit('new player', data);
	});

	socket.on('get players', function() {
		io.sockets.emit('player list', connectedPlayers);
	});

	socket.on('send message', function(data){
		io.sockets.emit('new message', data.name + "connected!");
	});

	socket.on('send dialog', function(name, msg){
		io.sockets.emit('new dialog', name, msg);
	});

	socket.on('player moved', function(data, direction){
		for (i = 0; i < connectedPlayers.length; i++) {
			if (socket.alias === connectedPlayers[i].name) {
				connectedPlayers[i].gX = data.gX;
				connectedPlayers[i].gY = data.gY;
			}
		}
		socket.broadcast.emit('move player', data, direction);
	});

	socket.on('disconnect', function(data){
		for (i = 0; i < connectedPlayers.length; i++){
			if (socket.alias === connectedPlayers[i].name) {
				io.sockets.emit('new message', connectedPlayers[i].name + " has disconnected!");
				connectedPlayers.splice(i, 1);
			}
		}
		io.sockets.emit('player disconnect', socket.alias);
	})

});