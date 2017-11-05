var express = require('express');
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};
	
server.listen(process.env.PORT || 3000);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	
	socket.on('new user', function(data, callback) {
		window.open(__dirname + '/index.html' ,null, 'height=200,width=400,status=yes,toolbar=no,menubar=no,location=no');
		if(data in users){
			callback(false);
		} else {
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});
	
	function updateNicknames() {
		io.sockets.emit('usernames', Object.keys(users));
	}
	
	socket.on('send message', function(data){
		var msg = data.trim();
		if(msg.substr(0, 3) === "/w ") {
			msg = msg.substr(3);
			var ind = msg.indexOf(" ");
			if(ind !== -1) {
				
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				
				if(name in users) {
					
					//Actual user
					users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					
				} else {
					
					//User not found
					
				}
				
			} else {
				
				//if no message is given
					
			}
		} else {
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});