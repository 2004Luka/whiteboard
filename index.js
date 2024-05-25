let express = require('express')
let app = express();
let httpserver= require('http').createServer(app);
let io= require('socket.io')(httpserver);


app.use(express.static('public'));


let PORT = process.env.PORT || 8080
app.listen(PORT,()=>console.log(`server started ib port ${PORT}`));