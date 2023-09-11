const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: 'http://localhost:3001',
		methods: ['GET', 'POST'],
	},
});

const port = 3000;

app.use(express.static('public'));

io.on('connection', socket => {
	socket.on('join-room', roomId => {
		socket.join(roomId);
	});

	socket.on('offer', (offer, roomId) => {
		socket.to(roomId).emit('offer', offer);
	});

	socket.on('answer', (answer, roomId) => {
		socket.to(roomId).emit('answer', answer);
	});

	socket.on('ice-candidate', (candidate, roomId) => {
		socket.to(roomId).emit('ice-candidate', candidate);
	});
});

server.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
