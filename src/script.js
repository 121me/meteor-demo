import * as THREE from 'three';
import './style.css';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/Loaders/RGBELoader.js';

import hdr_file from '../static/assets/royal_esplanade.hdr';
import gltf_file from '../static/assets/scene.gltf';

import {TWEEN} from 'three/examples/jsm/libs/tween.module.min.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const perspectiveDistance = 10;
const root = new THREE.Object3D();

let camera, scene, renderer, controls;
let meteor;

let INTERSECTED = undefined;
let SPINNING = undefined;

const raycaster = new THREE.Raycaster();

// let pointLight;

init();

function init() {
    const container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;

    renderer.domElement.style.background = 'linear-gradient(to bottom right, rgb(175,180,210), rgb(165,155,165))';
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    {
        const dirLight =  new THREE.DirectionalLight(0x00ffff, 4);
        dirLight.position.set(0, -2, 3);

        dirLight.target = root;

        scene.add(dirLight);
    }

    {
        const pointLight = new THREE.PointLight(0x0000ff, 5);
        pointLight.position.set(0, 0, 3);

        scene.add( pointLight );
    }

    {
        const fov = 45;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.01;
        const far = 2000;
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    camera.position.set(0, 0, perspectiveDistance);

    {
        controls = new OrbitControls(camera, renderer.domElement);

        controls.enableZoom = false;
        controls.enablePan = false;
        controls.screenSpacePanning = false;

        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        controls.maxAzimuthAngle = Math.PI / 4;
        controls.minAzimuthAngle = -Math.PI / 4;

        controls.maxPolarAngle = 2 * Math.PI / 3;
        controls.minPolarAngle = Math.PI / 3;
    }

    controls.update();

    new GLTFLoader().load(gltf_file, function (gltf) {

        meteor = gltf.scene;

        meteor.scale.set(0.1, 0.1, 0.1);

        // meteor.rotation.y = 2 * Math.PI / 3;

        root.add(meteor);

        scene.add(root);

        new RGBELoader().load(hdr_file, function (hdr) {

            hdr.mapping = THREE.EquirectangularReflectionMapping;

            scene.environment = hdr;

            render();

        });
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

}

function onMouseMove() {
    console.log(INTERSECTED);

    // change the rotation of the meteor object based on mouse movement
    // the meteor object should look at the mouse position

    // get the mouse position
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    {
        // get the vector from the camera to the mouse position
        const vector = new THREE.Vector3(mouseX, mouseY, 5);

        // set the rotation of the meteor object to look at the mouse position
        root.lookAt(vector);
    }

    {
        // rotate the meteor object around the y axis if the mouse is on the object
        // raycast from the mouse position to the object
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        // get the intersected object
        const intersects = raycaster.intersectObject(meteor, true);

        // if the mouse is on the object
        INTERSECTED = intersects.length > 0;
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {

    const time = Date.now() * 0.0005;

    root.position.y = Math.cos(time) * 0.2;

    requestAnimationFrame(render);
    renderer.render(scene, camera);

    controls.update();

    if (INTERSECTED) {
        if (SPINNING) {
            // do nothing
        } else {
            new TWEEN.Tween(meteor.rotation).to({
                //y: 5 * Math.PI / 3
                y: Math.PI * 2
            }, 4000)
                .easing(TWEEN.Easing.Elastic.Out).start();
            SPINNING = true;
        }
    } else {
        if (SPINNING) {
            new TWEEN.Tween(meteor.rotation).to({
                //y: 2 * Math.PI / 3
                y: 0
            }, 4000)
                .easing(TWEEN.Easing.Elastic.Out).start();
            SPINNING = false;
        } else {
            // do nothing
        }
    }

    TWEEN.update()

}
