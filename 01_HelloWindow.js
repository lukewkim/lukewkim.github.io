// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Start rendering
gl.enable(gl.SCISSOR_TEST);
render();

function color(x, y, r, g, b)
{
	gl.scissor(x, y, canvas.width / 2, canvas.height / 2);
	gl.clearColor(r, g, b, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

// Render loop
function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	color(0, 0, 1.0, 0, 0);
	color(0, canvas.width / 2, 0, 1.0, 0);
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    canvas.width = Math.min(500, window.innerWidth, window.innerHeight);
    canvas.height = Math.min(500, window.innerWidth, window.innerHeight);
    render();
});

