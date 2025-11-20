import { resizeAspectRatio, setupText, updateText } from './util.js';
import { Shader, readShaderFile, createProgram } from './shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) { console.error('WebGL 2 is not supported by your browser.'); }

canvas.width = 600;
canvas.height = 600;

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1.0);



const vSource = await readShaderFile('hw02Vert.glsl');
const fSource = await readShaderFile('hw02Frag.glsl');

const shaderProgram = createProgram(gl, vSource, fSource);
resizeAspectRatio(gl, canvas);

const vertices = new Float32Array([
    -0.1, -0.1, 0.0,
    0.1, -0.1, 0.0,
    0.1, 0.1, 0.0,
    -0.1, 0.1, 0.0
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

gl.useProgram(shaderProgram);

const offsetLocation = gl.getUniformLocation(shaderProgram, 'offset');

let offsetVector = new Float32Array([0.0, 0.0]);

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function manageOffset(directionIsX, positive)
{
    offsetVector[0] = directionIsX ? (clamp(offsetVector[0] + ((positive) ? 0.01 : -0.01), -0.9 , 0.9)) : offsetVector[0];
    offsetVector[1] = directionIsX ? offsetVector[1] : (clamp(offsetVector[1] + ((positive) ? 0.01 : -0.01) , -0.9 , 0.9));
}

let lastPressed = null;

window.addEventListener('keydown', (event) => { if (event.key === 'ArrowUp'||event.key === 'ArrowDown'||event.key === 'ArrowLeft'||event.key === 'ArrowRight') { lastPressed = event.key; }});
window.addEventListener('keyup', (event) => { if ((event.key === 'ArrowUp'||event.key === 'ArrowDown'||event.key === 'ArrowLeft'||event.key === 'ArrowRight') && (event.key == lastPressed)) { lastPressed = null; }});


function render()
{
    if (lastPressed != null) { manageOffset((lastPressed === 'ArrowLeft'||lastPressed === 'ArrowRight'), (lastPressed === 'ArrowUp'||lastPressed === 'ArrowRight')); }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2fv(offsetLocation, offsetVector);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    setupText(canvas, "Use arrow keys to move the rectangle");
    
    requestAnimationFrame(render);
}


render();