const express = require('express');

//Initialize Express application
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
//Creates a unique id 
const { v4: uuidv4 } = require('uuid'); 

//web that enables Real-Time Communications (RTC) with peer js 
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set('view engine', 'ejs');
//Set our static file public folder
app.use(express.static('public'));

//Enable peerjs 
app.use('/peerjs', peerServer); 

app.get('/', (req, res) => {
  //res.render('room');

  //It will generate a uuid and redirect
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });   
});

//Create a connection with socketio
io.on('connection', socket => {
  //Listen join-room event 
  socket.on('join-room', (roomId, userId) => { 
    socket.join(roomId); 
    socket.to(roomId).broadcast.emit('user-connected', userId);
    
    //Listen to message event
    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message);
    });
  })
});



server.listen(process.env.PORT || 3030);