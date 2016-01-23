var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var server = app.listen(8000, function () {
  console.log("listening on 8000")
});
var io = require('socket.io').listen(server);

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var users = []
var messages = []

io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id);
  //all the socket code goes in here!
  socket.on("get_new_user", function (data){
    console.log('Someone created a username!  Name: ' + data.name)
    socket.broadcast.emit('new_user', {name: data.name});
    socket.emit('get_all_messages', messages)
    users.push({name: data.name, socket_id: data.id})
    console.log(users)
  });

  socket.on("get_new_message", function (data){
    console.log('Someone submitted a message!  Name: ' + data.name + ' Message: ' + data.message);
    messages.push({name: data.name, message: data.message});
    io.emit('new_message', {name: data.name, message: data.message});
  });

  socket.on("deactivate_user", function(data){
  	for (var i = 0; i < users.length; i++) {
  		if (users[i].socket_id == data.id) {
  			socket.broadcast.emit("user_gone", {user: users[i].name})
  			console.log("THIS IS USERS I: " + users[i].name)
  			var temp = users[i];
  			users[i] = users[users.length - 1]
  			users[users.length - 1] = temp
  		};
  	};
  	users.pop();
  	console.log("REMAINING USERS: ")
  	console.log(users)
  });
});

app.get('/', function(request, response) {
	response.render('index')
});