let canvas = document.getElementById("canvas");
let brushsize = document.getElementById("brush-size").value;

var io = io.connect("http://localhost:8080/")

let ctx = canvas.getContext('2d');

let x;
let y;

let mouseDown = false;

const getMousePos = (canvas, evt) => {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

canvas.onmousedown = (e) => {
    let pos = getMousePos(canvas, e);
    x = pos.x;
    y = pos.y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    io.emit("down", { x, y, brushsize });
    mouseDown = true;
};

canvas.onmouseup = (e) => {
    mouseDown = false;
};

canvas.onmousemove = (e) => {
    if (mouseDown) {
        let pos = getMousePos(canvas, e);
        x = pos.x;
        y = pos.y;
        io.emit('draw', { x, y, brushsize });
        ctx.lineWidth = brushsize;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
};

io.on('ondraw', ({ x, y, brushsize }) => {
    ctx.lineWidth = brushsize;
    ctx.lineTo(x, y);
    ctx.stroke();
});

io.on("ondown", ({ x, y, brushsize }) => {
    ctx.lineWidth = brushsize;
    ctx.beginPath();
    ctx.moveTo(x, y);
});

document.getElementById("brush-size").oninput = (e) => {
    brushsize = e.target.value;
    ctx.lineWidth = brushsize;
};

document.getElementById("clear").onclick = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    io.emit("clear");
};

io.on("clear", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
