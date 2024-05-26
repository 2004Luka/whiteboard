let canva =document.getElementById("canvas");
let brushsize = document.getElementById("brush-size").value;

canvas.width = window.innerWidth;
canvas.height= 800;

var io =io.connect("http://localhost:8080/")

let ctx = canvas.getContext('2d');

let x;
let y;

let mouseDown=false;


document.getElementById("brush-size").oninput = (e) => {
    brushsize = e.target.value;
    ctx.lineWidth = brushsize;
};

window.onmousedown = (e) => {
    x = e.clientX;
    y = e.clientY;
    ctx.beginPath();
    ctx.moveTo(x, y);
    io.emit("down", { x, y, brushsize });
    mouseDown = true;
};

window.onmouseup = (e) => {
    mouseDown = false;
};

io.on('ondraw', ({ x, y, brushsize }) => {
    // Use the brush size from the event data
    ctx.lineWidth = brushsize;
    ctx.lineTo(x, y);
    ctx.stroke();
});

io.on("ondown", ({ x, y, brushsize }) => {
    // Use the brush size from the event data
    ctx.lineWidth = brushsize;
    ctx.beginPath();
    ctx.moveTo(x, y);
});

window.onmousemove = (e) => {
    if (mouseDown) {
        x = e.clientX;
        y = e.clientY;
        io.emit('draw', { x, y, brushsize });
        ctx.lineWidth = brushsize;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
};