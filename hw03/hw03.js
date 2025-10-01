import { resizeAspectRatio, setupText, updateText, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;

let circleBuffer; let lineBuffer; let positionBuffer;
let state = "waitingCircle";
const circleArray = new Float32Array(720); let circleCenter = [0, 0]; let radius = 0.0;
const lineArray = [0.0, 0.0, 0.0, 0.0];


document.addEventListener('DOMContentLoaded', () => { main(); });

function initWebGL()
{
    if (!gl) { console.error('WebGL 2 is not supported by your browser.'); return false; }

    canvas.width = 700;
    canvas.height = 700;

    resizeAspectRatio(gl, canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);

    return true;
}

function setupMouseEvents()
{
    function handleMouseDown(event)
	{
		event.preventDefault();
		event.stopPropagation();
		
		switch(state)
		{
			case "waitingCircle":
            {
				const rect = canvas.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				
				let [glX, glY] = convertToWebGLCoordinates(x, y);
				circleCenter = [glX, glY];
				state = "draggingCircle";
				break;
            }
            case "waitingLine":
            {
				const rect = canvas.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				
				let [glX, glY] = convertToWebGLCoordinates(x, y);
                lineArray[0] = glX; lineArray[1] = glY; lineArray[2] = glX; lineArray[3] = glY;
                
                state = "draggingLine";
                break;
            }
            default:
                break;
		}
    }

    function handleMouseMove(event)
	{
		switch(state)
		{
			case "draggingCircle":
            {
				const rect = canvas.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				
				let [glX, glY] = convertToWebGLCoordinates(x, y);
				radius = ((circleCenter[0] - glX) ** 2 + (circleCenter[1] - glY) ** 2) ** (0.5);
				
				render();
				break;
            }
            case "draggingLine":
            {
				const rect = canvas.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				
				let [glX, glY] = convertToWebGLCoordinates(x, y);
				lineArray[2] = glX; lineArray[3] = glY;
				
				render();
				break;
            }
		}
    }

    function handleMouseUp()
	{
		switch(state)
		{
			case "draggingCircle":
				state = "waitingLine";

                render();
				break;
            case "draggingLine":
                state = "final";
                
                render();
                break;
            default:
                break;
		}
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	drawLine([0.0, 0.8], [0.0, -0.8], [0.0, 1.0, 0.5, 1.0]);
    drawLine([0.8, 0.0], [-0.8, 0.0], [1.0, 0.0, 0.0, 1.0]);
    
	switch(state)
	{
        case "draggingCircle":
            drawCircle(circleCenter, radius, [1.0, 1.0, 1.0, 1.0]);
            break;
        case "final":
            drawCircle(circleCenter, radius, [1.0, 0.0, 1.0, 1.0]);
            drawLine([lineArray[0], lineArray[1]], [lineArray[2], lineArray[3]], [1.0, 1.0, 1.0, 1.0]);
            setupText(canvas, ("Circle : center (" + circleCenter[0].toFixed(2) + ", " + circleCenter[1].toFixed(2) + ") radius = " + radius.toFixed(2)), 1);
            setupText(canvas, ("Line segment: (" + lineArray[0].toFixed(2) + ", " + lineArray[1].toFixed(2) + ") ~ (" + lineArray[2].toFixed(2) + ", " + lineArray[3].toFixed(2) + ")"), 2);
            
            const intersection = getIntersection();
            if (intersection.length == 0) { setupText(canvas, "No intersection", 3); }
            if (intersection.length == 2) { setupText(canvas, ("Intersection Points: 1 Point 1: (" + intersection[0].toFixed(2) + ", " + intersection[1].toFixed(2) + ")"), 3); }
            if (intersection.length == 4) { setupText(canvas, ("Intersection Points: 2 Point 1: (" + intersection[0].toFixed(2) + ", " + intersection[1].toFixed(2) + ") Point 2: (" + + intersection[2].toFixed(2) + ", " + intersection[3].toFixed(2) + ")"), 3); }
            
            drawPoint([intersection[0], intersection[1]], [1.0, 1.0, 0.0, 1.0]);
            drawPoint([intersection[2], intersection[3]], [1.0, 1.0, 0.0, 1.0]);
            break;
        case "draggingLine":
            drawLine([lineArray[0], lineArray[1]], [lineArray[2], lineArray[3]], [1.0, 1.0, 1.0, 1.0]);
        case "waitingLine":
            drawCircle(circleCenter, radius, [1.0, 0.0, 1.0, 1.0]);
            setupText(canvas, ("Circle : center (" + circleCenter[0].toFixed(2) + ", " + circleCenter[1].toFixed(2) + ") radius = " + radius.toFixed(2)), 1);
            break;
		default:
            break;
	}
}

async function initShader()
{
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() 
{
    try
	{
        if (!initWebGL()) { throw new Error('WebGL 초기화 실패'); return false; }

        await initShader();
        
        shader.use();
        
        setupMouseEvents();
        
        render();

        return true;
        
    }
	catch (error)
	{
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

function convertToWebGLCoordinates(x, y) { return [(x / canvas.width) * 2 - 1, -((y / canvas.height) * 2 - 1)]; }

function drawCircle(center, radius, color)
{
	for (let i = 0; i < 360; i++)
	{
        circleArray[i * 2] = center[0] + radius * Math.cos(2 * Math.PI * (i / 360));
        circleArray[i * 2 + 1] = center[1] + radius * Math.sin(2 * Math.PI * (i / 360));
    }
    
    if (circleBuffer == null) { circleBuffer = gl.createBuffer(); }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, circleArray, gl.DYNAMIC_DRAW);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    
    shader.use();
    shader.setVec4("u_color", color);
    
    gl.drawArrays(gl.LINE_LOOP, 0, 360);
}

function drawLine(start, end, color)
{
    if (lineBuffer == null) { lineBuffer = gl.createBuffer(); }
    const lineData = new Float32Array([start[0], start[1], end[0], end[1]])
    
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    
    shader.use();
    shader.setVec4("u_color", color);
    
    gl.drawArrays(gl.LINES, 0, 2);
}

function drawPoint(position, color)
{
    if (positionBuffer == null) { positionBuffer = gl.createBuffer(); }
    const positionData = new Float32Array(position)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.DYNAMIC_DRAW);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    
    shader.use();
    shader.setVec4("u_color", color);
    
    gl.drawArrays(gl.POINTS, 0, 1);
}

function getIntersection()
{
    const a = lineArray[2] - lineArray[0]; const b = lineArray[0]; const c = lineArray[3] - lineArray[1]; const d = lineArray[1];
    const e = circleCenter[0]; const f = circleCenter[1]; const r = radius;
    const A = a ** 2 + c ** 2; const B = 2 * (a * b - a * e + c * d - c * f);
    const C = b ** 2 + d ** 2 + e ** 2 + f ** 2 - r ** 2 - 2 * (b * e + d * f);
    const D = B ** 2 - 4 * A * C;
    
    const tempPoints = [];
    
    if (D < 0.0) { return new Float32Array(tempPoints); }
    else if (D < 0.01)
    {
        const t = ((-B) / (2 * A));
        if (0.0 <= t && t <= 1.0) { tempPoints.push(a * t + b, c * t + d); }
        return new Float32Array(tempPoints);
    }
    else
    {
        const t1 = ((-B + D ** 0.5) / (2 * A)); const t2 = ((-B - D ** 0.5) / (2 * A));
        if (0.0 <= t1 && t1 <= 1.0) { tempPoints.push(a * t1 + b, c * t1 + d); }
        if (0.0 <= t2 && t2 <= 1.0) { tempPoints.push(a * t2 + b, c * t2 + d); }
        return new Float32Array(tempPoints);
    }
}