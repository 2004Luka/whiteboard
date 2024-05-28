import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:8080');
console.log('Socket.IO connection established successfully!');

function App() {
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef(null);
  let brushSizeUsedForStroke = brushSize; // Define and initialize brushSizeUsedForStroke

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let x, y;
    let mouseDown = false;

    const getMousePos = (canvas, evt) => {
      let rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    };

    const handleMouseDown = (e) => {
      let pos = getMousePos(canvas, e);
      x = pos.x;
      y = pos.y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      socket.emit('down', { x, y, brushsize: brushSize });
      mouseDown = true;
      brushSizeUsedForStroke = brushSize; // Store the brush size used for the original stroke
    };

    const handleMouseUp = () => {
      mouseDown = false;
    };

    const handleMouseMove = (e) => {
      if (mouseDown) {
        let pos = getMousePos(canvas, e);
        x = pos.x;
        y = pos.y;
        socket.emit('draw', { x, y, brushsize: brushSize });
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    socket.on('ondraw', ({ x, y, brushsize }) => {
      ctx.lineWidth = brushsize; // Use the brush size from the received event
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    socket.on('ondown', ({ x, y, brushsize }) => {
      ctx.lineWidth = brushsize; // Use the brush size from the received event
      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    socket.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      socket.off('ondraw');
      socket.off('ondown');
      socket.off('clear');
    };
  }, [brushSize]);

  const handleChange = (e) => {
    setBrushSize(e.target.value);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
  };

  return (
    <div>
      <canvas ref={canvasRef} id="canvas" width="2000" height="2000"></canvas>
      <div id="controls">
        <label htmlFor="brush-size">Brush Size:</label>
        <input type="range" id="brush-size" min="1" max="50" value={brushSize} onChange={handleChange} />
        <button id="clear" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

export default App;
