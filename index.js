const express = require('express');
const app = express();
const http = require('http');
const httpserver = http.createServer(app);
const io = require('socket.io')(httpserver);

let connections = [];

io.on('connection', (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    socket.on('draw', (data) => {
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('ondraw', { x: data.x, y: data.y });
            }
        });
    });

    socket.on("down",(data)=>{
        connections.forEach((con)=> {
            if(con.id !== socket.id){
                con.emit("ondown",{x: data.x ,y: data.y});
            }
        })
    })

    socket.on('disconnect', () => {
        connections = connections.filter(con => con.id !== socket.id);
        console.log(`${socket.id} has disconnected`);
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
httpserver.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});