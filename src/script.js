import * as THREE from 'three';
import './style.css';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/Loaders/RGBELoader.js';

const perspectiveDistance = 10;
let camera, scene, renderer;
let meteor;

let pointLight;

init();

function init() {
    // find the element id 'container'
    const container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;

    // set renderer.domElement.style.background color to gradient
    // the background is a gradient from the top left to the bottom right of the screen
    // the gradient is a linear gradient from the top left to the bottom right
    // the top left color is rgb(175,180,210)
    // the bottom right color is rgb(165,155,165)

    renderer.domElement.style.background = 'linear-gradient(to bottom right, rgb(175,180,210), rgb(165,155,165))';
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    scene.add( new THREE.DirectionalLight( 0xffffff, 1 ) );

    {
        pointLight = new THREE.PointLight( 0x0000ff, 1 );
        scene.add( pointLight );
    }

    {
        const fov = 45;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.01;
        const far = 2000;
        camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    }

    camera.position.set( 0, 0, perspectiveDistance );

    new GLTFLoader().load( './assets/scene.gltf', function ( gltf ) {

        meteor = gltf.scene;

        meteor.scale.set( 0.1, 0.1, 0.1 );

        scene.add( meteor );

        new RGBELoader().load( './assets/royal_esplanade.hdr', function ( hdr ) {

            hdr.mapping = THREE.EquirectangularReflectionMapping;

            scene.environment = hdr;

            render();

        } );

    } );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {

    const time = Date.now() * 0.0005;

    pointLight.position.x = Math.sin( time * 0.9 ) * 3;
    pointLight.position.y = Math.cos( time * 0.6 ) * 4;
    pointLight.position.z = Math.cos( time * 0.3 ) * 3;

    meteor.rotation.x += 0.001;
    meteor.rotation.y += 0.002;
    meteor.rotation.z += 0.003;

    requestAnimationFrame( render );
    renderer.render( scene, camera );

}
