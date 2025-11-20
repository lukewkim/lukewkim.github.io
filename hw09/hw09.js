import * as THREE from 'three';  
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as utils from './util.js'

const scene = new THREE.Scene();

let camera = utils.initCamera();
resetCameraPosition();
scene.add(camera);

const renderer = utils.initRenderer();
const stats = utils.initStats();
let orbitControls

resetOrbitControls()

const defaultLighting = utils.initDefaultLighting(scene, new THREE.Vector3(0, 0, 0));

const textureLoader = new THREE.TextureLoader();

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const sun = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshStandardMaterial({ color: 0xffff00 }));
scene.add(sun);

const planetDict =
{
    "mercury" : {
        "length" : 20,
        "instance" : new THREE.Mesh(
            new THREE.SphereGeometry(1.5),
            new THREE.MeshStandardMaterial({ map: textureLoader.load('./Mercury.jpg'), color: new THREE.Color(0xa6a6a6) })
        ),
        "rotation" : [0, 0, 0],
        "orbit" : [0, 0, 0]
    },
    "venus" : {
        "length" : 35,
        "instance" : new THREE.Mesh(
            new THREE.SphereGeometry(3),
            new THREE.MeshStandardMaterial({ map: textureLoader.load('./Venus.jpg'), color: new THREE.Color(0xe39e1c) })
        ),
        "rotation" : [0, 0, 0],
        "orbit" : [0, 0, 0]
    },
    "earth" : {
        "length" : 50,
        "instance" : new THREE.Mesh(
            new THREE.SphereGeometry(3.5),
            new THREE.MeshStandardMaterial({ map: textureLoader.load('./Earth.jpg'), color: new THREE.Color(0x3498db) })
        ),
        "rotation" : [0, 0, 0],
        "orbit" : [0, 0, 0]
    },
    "mars" : {
        "length" : 65,
        "instance" : new THREE.Mesh(
            new THREE.SphereGeometry(2.5),
            new THREE.MeshStandardMaterial({ map: textureLoader.load('./Mars.jpg'), color: new THREE.Color(0xc0392b) })
        ),
        "rotation" : [0, 0, 0],
        "orbit" : [0, 0, 0]
    }
}


for (let planet in planetDict) { scene.add(planetDict[planet]["instance"]); }

const controls = new function()
{
    this.perspective = "Perspective";
    this.switchCamera = function()
    {
        if (this.perspective == "Perspective")
        {
            scene.remove(camera);
            camera = null;
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            resetCameraPosition();
            resetOrbitControls();
            this.perspective = "Orthographic";
        }
        else
        {
            scene.remove(camera);
            camera = null;
            camera = utils.initCamera();
            resetCameraPosition();
            resetOrbitControls();
            this.perspective = "Perspective";
        }
    };

    this.mercuryRotationSpeed = 0.02;
    this.mercuryOrbitSpeed = 0.02;

    this.venusRotationSpeed = 0.015;
    this.venusOrbitSpeed = 0.015;

    this.earthRotationSpeed = 0.01;
    this.earthOrbitSpeed = 0.01;

    this.marsRotationSpeed = 0.008;
    this.marsOrbitSpeed = 0.008;
};

const gui = new GUI();
const guiCamera = gui.addFolder('Camera');
const guiMercury = gui.addFolder('Mercury');
const guiVenus = gui.addFolder('Venus');
const guiEarth = gui.addFolder('Earth');
const guiMars = gui.addFolder('Mars');

guiCamera.add(controls, 'switchCamera');
guiCamera.add(controls, 'perspective').listen();

guiMercury.add(controls, 'mercuryRotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
guiMercury.add(controls, 'mercuryOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

guiVenus.add(controls, 'venusRotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
guiVenus.add(controls, 'venusOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

guiEarth.add(controls, 'earthRotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
guiEarth.add(controls, 'earthOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

guiMars.add(controls, 'marsRotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
guiMars.add(controls, 'marsOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

render();

function render() {
    orbitControls.update();
    stats.update();
    
    for (let planet in planetDict)
    {
        planetDict[planet]["rotation"][1] += controls[`${planet}RotationSpeed`];
        planetDict[planet]["orbit"][1] += controls[`${planet}OrbitSpeed`];
        planetDict[planet]["instance"].rotation.y = planetDict[planet]["rotation"][1];
        planetDict[planet]["instance"].position.x = planetDict[planet]["length"] * Math.cos(planetDict[planet]["orbit"][1]);
        planetDict[planet]["instance"].position.z = planetDict[planet]["length"] * Math.sin(planetDict[planet]["orbit"][1]);
    }


    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function resetCameraPosition()
{
    camera.position.x = 100;
    camera.position.y = 100;
    camera.position.z = 150;
    camera.lookAt(new THREE.Vector3());
}

function resetOrbitControls()
{
    if (orbitControls != null) { orbitControls.dispose(); }
    orbitControls = null;
    orbitControls = utils.initOrbitControls(camera, renderer);
}