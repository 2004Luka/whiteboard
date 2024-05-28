const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create HTTP server using Express app
const io = new Server(server, {
    cors: {
      origin: '*', // Allow requests from any origin
      methods: ['GET', 'POST'], // Allow specified HTTP methods
      allowedHeaders: '*', // Allow all headers
      exposedHeaders: ['ETag', 'Content-Type'], // Expose specified headers
      credentials: true // Allow sending cookies with requests
    }
  });
  
  const cors = require('cors');
  app.use(cors());
let connections = [];
io.on('connection', (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    socket.on('draw', (data) => {
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('ondraw', { x: data.x, y: data.y, brushsize: data.brushsize });
            }
        });
    });

    socket.on("down", (data) => {
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit("ondown", { x: data.x, y: data.y, brushsize: data.brushsize });
            }
        });
    });

    socket.on("clear",()=>{
        connections.forEach((con) => {
            con.emit("clear");
        })
    })

    socket.on('disconnect', () => {
        connections = connections.filter(con => con.id !== socket.id);
        console.log(`${socket.id} has disconnected`);
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => { // Use the server instance to listen for connections
    console.log(`Server started on port ${PORT}`);
});
