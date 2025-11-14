import { resizeAspectRatio, setupText, updateText, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';
import { Arcball } from './arcball.js';
import { Cylinder } from './cylinder.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let textOverlay2;
let textOverlay3;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let arcBallMode = 'CAMERA';
let shadingMode = 'SMOOTH';
let toonLevel = 1;


const cylinder = new Cylinder(gl, 32);
const axes = new Axes(gl, 1.5);

const cameraPos = vec3.fromValues(0, 0, 3);
const lightDirection = vec3.fromValues(1.0, 0.25, 0.5);
const shininess = 32.0;

const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('DOMContentLoaded', () =>
    {
        if (isInitialized)
        {
            console.log("Already initialized");
            return;
        }

        main().then(success =>
        {
            if (!success)
            {
                console.log('program terminated');
                return;
            }
            isInitialized = true;
        }).catch(error =>
            {
                console.error('program terminated with error:', error);
            });
    });

function setupKeyboardEvents()
{
    document.addEventListener('keydown', (event) =>
    {
        if (event.key == 'a')
        {
            if (arcBallMode == 'CAMERA') { arcBallMode = 'MODEL'; }
            else { arcBallMode = 'CAMERA'; }
            updateText(textOverlay2, "arcball mode: " + arcBallMode);
        }
        else if (event.key == 'r')
        {
            arcball.reset();
            modelMatrix = mat4.create(); 
            arcBallMode = 'CAMERA';
            updateText(textOverlay2, "arcball mode: " + arcBallMode);
        }
        else if (event.key == 's')
        {
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            shadingMode = 'SMOOTH';
            render();
        }
        else if (event.key == "1")
        {
            toonLevel = 1;
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            render();
            updateText(textOverlay3, "toon levels: " + toonLevel);
        }
        else if (event.key == "2")
        {
            toonLevel = 2;
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            render();
            updateText(textOverlay3, "toon levels: " + toonLevel);
        }
        else if (event.key == '3')
        {
            toonLevel = 3;
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            render();
            updateText(textOverlay3, "toon levels: " + toonLevel);
        }
        else if (event.key == '4')
        {
            toonLevel = 4;
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            render();
            updateText(textOverlay3, "toon levels: " + toonLevel);
        }
        else if (event.key == '5')
        {
            toonLevel = 5;
            cylinder.copyVertexNormalsToNormals();
            cylinder.updateNormals();
            render();
            updateText(textOverlay3, "toon levels: " + toonLevel);
        }
    });
}

function initWebGL()
{
    if (!gl)
    {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    
    return true;
}

async function initShader()
{
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode == 'CAMERA') { viewMatrix = arcball.getViewMatrix(); }
    
    else
    {
        modelMatrix = arcball.getModelRotMatrix();
        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setVec3('u_viewPos', cameraPos);
    shader.setInt("toon_level", toonLevel);
    cylinder.draw(shader);

    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

async function main()
{
    try
    {
        if (!initWebGL()) { throw new Error('WebGL initialization failed'); }
        
        mat4.lookAt(
            viewMatrix, 
            cameraPos, 
            vec3.fromValues(0, 0, 0), 
            vec3.fromValues(0, 1, 0)
        );

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        await initShader();

        shader.use();
        shader.setMat4("u_projection", projMatrix);
        shader.setVec3("light.direction", lightDirection);
        shader.setVec3("light.ambient", vec3.fromValues(0.2, 0.2, 0.2));
        shader.setVec3("light.diffuse", vec3.fromValues(0.7, 0.7, 0.7));
        shader.setVec3("light.specular", vec3.fromValues(1.0, 1.0, 1.0));
        shader.setInt("material.diffuse", 0);
        shader.setVec3("material.specular", vec3.fromValues(0.8, 0.8, 0.8));
        shader.setFloat("material.shininess", shininess);
        shader.setVec3("u_viewPos", cameraPos);
        shader.setInt("toon_level", toonLevel);

        setupText(canvas, "TOON SHADING ", 1);
        textOverlay2 = setupText(canvas, "arcball mode: " + arcBallMode, 2);
        textOverlay3 = setupText(canvas, "toon levels: " + toonLevel, 3);
        setupText(canvas, "press 'a/r' to change/reset arcball mode", 4);
        setupText(canvas, "press 1 - 5 to change toon shading levels", 5);

        setupKeyboardEvents();

        requestAnimationFrame(render);

        return true;

    }
    catch (error)
    {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}

