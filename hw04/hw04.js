
import { resizeAspectRatio, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader, vao, axes;
let startTime = 0;


document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

async function initShader() {
  const vs = await readShaderFile('shVert.glsl');
  const fs = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vs, fs);
}

function setupBuffers() {
  const verts = new Float32Array([
    -0.15,  0.15,   
    -0.15, -0.30,   
     0.15, -0.30,   
     0.15,  0.15    
  ]);
  const idx = new Uint16Array([0,1,2, 0,2,3]);
  const col = new Float32Array([
    1,0,0,1,  1,0,0,1,  1,0,0,1,  1,0,0,1
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);

  const cbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
  gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);
  shader.setAttribPointer('a_color', 4, gl.FLOAT, false, 0, 0);

  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
}

function drawRect(modelMat, color) {
  shader.use();
  shader.setMat4('u_transform', modelMat);
  shader.setVec4('v_color', color);
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (axes) axes.draw(mat4.create(), mat4.create());

  // rotation angles depending on time for big and small blades
  const t = performance.now()/1000 - startTime;
  const bigSpin   = Math.sin(t) * Math.PI * 2.0;   //big blade
  const smallSpin = Math.sin(t) * Math.PI * (-10); //small blade

  // center of the big blade's rotation, top of the pole
  const hub = [0.0, 0.3, 0.0];

  // dimensions of big and small blades and the pole
  const lb = 0.9, wb = 0.12; 
  const ls = 0.2, ws = 0.08;
  const wp = 0.10, hp = 0.90; 

  //scale the size of pole so that the top is at 'hub'
  {
    const S = mat4.create();
    mat4.scale(S, S, [wp/0.3, hp/0.45, 1.0]); //scaling to resize pole
    
    const sy = hp/0.45; //scale factor for pole height
    const topy = 0.15 * sy;
    const mPole = mat4.create();
    mat4.multiply(mPole, mPole, S);  
    mat4.translate(mPole, mPole, [hub[0], hub[1] - topy, 0]); //top is at hub now
    drawRect(mPole, [0.4, 0.0, 0.0, 1.0]);
  }

  
const defTR = mat4.create();
mat4.translate(defTR, defTR, hub); //move  to hub
mat4.rotateZ(defTR, defTR, bigSpin); //spin at hub

  //bigger blade
  {
    //first set using defTR
    const mBig = mat4.clone(defTR);     
    //scale size      
    mat4.scale(mBig, mBig, [lb/0.3, wb/0.45, 1.0]);        
    drawRect(mBig, [1.0, 1.0, 1.0, 1.0]);
  }

    //two smaller blades
    {
        const mSmallNear = mat4.clone(defTR);   //first set at hub

        //set the rotation center of small blade to the tip of the bigger blade
      
        mat4.translate(mSmallNear, mSmallNear, [-lb/2, 0, 0]);
        // spin
        mat4.rotateZ(mSmallNear, mSmallNear, smallSpin);
        //sclae
        mat4.scale(mSmallNear, mSmallNear, [ls/0.25, ws/0.45, 1.0]);
        drawRect(mSmallNear, [0.5, 0.5, 0.5, 1.0]);
    }

    {
        const mSmallFar = mat4.clone(defTR);                 
    
        mat4.translate(mSmallFar, mSmallFar, [lb/2, 0, 0]);
        
        mat4.rotateZ(mSmallFar, mSmallFar, smallSpin);
    
        mat4.scale(mSmallFar, mSmallFar, [ls/0.25, ws/0.45, 1.0]);
        drawRect(mSmallFar, [0.5, 0.5, 0.5, 1.0]);
    }
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }
        await initShader();

        setupBuffers();
        axes = new Axes(gl, 0.8); 
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

